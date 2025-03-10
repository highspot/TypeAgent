// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { collections } from "typeagent";
import { isSearchTermWildcard } from "./common.js";
import { TermSet } from "./collections.js";
import { TextEditDistanceIndex, TextEmbeddingIndex, } from "./fuzzyIndex.js";
export class TermToRelatedTermsMap {
    constructor() {
        this.map = new collections.MultiMap();
    }
    addRelatedTerm(termText, relatedTerm) {
        if (Array.isArray(relatedTerm)) {
            for (const related of relatedTerm) {
                this.map.addUnique(termText, related, (x, y) => x.text === y.text);
            }
        }
        else {
            this.map.addUnique(termText, relatedTerm, (x, y) => x.text === y.text);
        }
    }
    lookupTerm(term) {
        return this.map.get(term);
    }
    removeTerm(term) {
        this.map.delete(term);
    }
    clear() {
        this.map.clear();
    }
    serialize() {
        const relatedTerms = [];
        for (const [key, value] of this.map) {
            relatedTerms.push({ termText: key, relatedTerms: value });
        }
        return { relatedTerms };
    }
    deserialize(data) {
        if (data) {
            if (data.relatedTerms) {
                for (const dataItem of data.relatedTerms) {
                    this.map.set(dataItem.termText, dataItem.relatedTerms);
                }
            }
        }
    }
}
export class RelatedTermsIndex {
    constructor(settings) {
        this.settings = settings;
        this.aliasMap = new TermToRelatedTermsMap();
        if (settings.embeddingIndexSettings) {
            this.embeddingIndex = new TermEmbeddingIndex(settings.embeddingIndexSettings);
        }
    }
    get aliases() {
        return this.aliasMap;
    }
    get termEditDistanceIndex() {
        return this.editDistanceIndex;
    }
    get fuzzyIndex() {
        return this.embeddingIndex;
    }
    serialize() {
        return {
            aliasData: this.aliasMap.serialize(),
            textEmbeddingData: this.embeddingIndex?.serialize(),
        };
    }
    deserialize(data) {
        if (data) {
            if (data.aliasData) {
                this.aliasMap = new TermToRelatedTermsMap();
                this.aliasMap.deserialize(data.aliasData);
            }
            if (data.textEmbeddingData &&
                this.settings.embeddingIndexSettings) {
                this.embeddingIndex = new TermEmbeddingIndex(this.settings.embeddingIndexSettings);
                this.embeddingIndex.deserialize(data.textEmbeddingData);
            }
        }
    }
}
export async function buildRelatedTermsIndex(conversation, eventHandler) {
    const fuzzyIndex = conversation.secondaryIndexes?.termToRelatedTermsIndex?.fuzzyIndex;
    if (conversation.semanticRefIndex && fuzzyIndex) {
        const allTerms = conversation.semanticRefIndex.getTerms();
        if (allTerms.length > 0) {
            await fuzzyIndex.addTerms(allTerms, eventHandler);
        }
    }
}
/**
 * Give searchTerms, resolves related terms for those searchTerms that don't already have them
 * Optionally ensures that related terms are not duplicated across search terms because this can
 * skew how semantic references are scored during search (over-counting)
 * @param relatedTermsIndex
 * @param searchTerms
 */
export async function resolveRelatedTerms(relatedTermsIndex, searchTerms, ensureSingleOccurrence = true) {
    const searchableTerms = new TermSet();
    const searchTermsNeedingRelated = [];
    for (const searchTerm of searchTerms) {
        if (isSearchTermWildcard(searchTerm)) {
            continue;
        }
        searchableTerms.addOrUnion(searchTerm.term);
        const termText = searchTerm.term.text;
        // Resolve any specific term to related term mappings
        if (relatedTermsIndex.aliases &&
            (!searchTerm.relatedTerms || searchTerm.relatedTerms.length === 0)) {
            searchTerm.relatedTerms =
                relatedTermsIndex.aliases.lookupTerm(termText);
        }
        // If no hard-coded mappings, add this to the list of things for which we do fuzzy retrieval
        if (!searchTerm.relatedTerms || searchTerm.relatedTerms.length === 0) {
            searchTermsNeedingRelated.push(searchTerm);
        }
    }
    if (relatedTermsIndex.fuzzyIndex && searchTermsNeedingRelated.length > 0) {
        const relatedTermsForSearchTerms = await relatedTermsIndex.fuzzyIndex.lookupTerms(searchTermsNeedingRelated.map((st) => st.term.text));
        for (let i = 0; i < searchTermsNeedingRelated.length; ++i) {
            searchTermsNeedingRelated[i].relatedTerms =
                relatedTermsForSearchTerms[i];
        }
    }
    //
    // Due to fuzzy matching, a search term may end with related terms that overlap with those of other search terms.
    // This causes scoring problems... duplicate/redundant scoring that can cause items to seem more relevant than they are
    // - The same related term can show up for different search terms but with different weights
    // - related terms may also already be present as search terms
    //
    dedupeRelatedTerms(searchTerms, ensureSingleOccurrence);
}
function dedupeRelatedTerms(searchTerms, ensureSingleOccurrence) {
    const allSearchTerms = new TermSet();
    let allRelatedTerms;
    //
    // Collect all unique search and related terms.
    // We end up with {term, maximum weight for term} pairs
    //
    searchTerms.forEach((st) => allSearchTerms.add(st.term));
    if (ensureSingleOccurrence) {
        allRelatedTerms = new TermSet();
        searchTerms.forEach((st) => allRelatedTerms.addOrUnion(st.relatedTerms));
    }
    for (const searchTerm of searchTerms) {
        if (searchTerm.relatedTerms && searchTerm.relatedTerms.length > 0) {
            let uniqueRelatedForSearchTerm = [];
            for (const candidateRelatedTerm of searchTerm.relatedTerms) {
                if (allSearchTerms.has(candidateRelatedTerm)) {
                    // This related term is already a search term
                    continue;
                }
                if (ensureSingleOccurrence && allRelatedTerms) {
                    // Each unique related term should be searched for
                    // only once, and (if there were duplicates) assigned the maximum weight assigned to that term
                    const termWithMaxWeight = allRelatedTerms.get(candidateRelatedTerm);
                    if (termWithMaxWeight !== undefined &&
                        termWithMaxWeight.weight === candidateRelatedTerm.weight) {
                        // Associate this related term with the current search term
                        uniqueRelatedForSearchTerm.push(termWithMaxWeight);
                        allRelatedTerms.remove(candidateRelatedTerm);
                    }
                }
                else {
                    uniqueRelatedForSearchTerm.push(candidateRelatedTerm);
                }
            }
            searchTerm.relatedTerms = uniqueRelatedForSearchTerm;
        }
    }
}
export class TermEmbeddingIndex {
    constructor(settings, data) {
        this.settings = settings;
        this.embeddingIndex = new TextEmbeddingIndex(settings);
        this.textArray = [];
        if (data) {
            this.deserialize(data);
        }
    }
    async addTerms(terms, eventHandler) {
        await this.embeddingIndex.addTextBatch(terms, eventHandler);
        this.textArray.push(...terms);
    }
    async lookupTerm(text, maxMatches, minScore) {
        let matches = await this.embeddingIndex.getIndexesOfNearest(text, maxMatches, minScore);
        return this.matchesToTerms(matches);
    }
    async lookupTerms(texts, maxMatches, minScore) {
        const matchesList = await this.embeddingIndex.getIndexesOfNearestMultiple(texts, maxMatches, minScore);
        const results = [];
        for (const matches of matchesList) {
            results.push(this.matchesToTerms(matches));
        }
        return results;
    }
    removeTerm(term) {
        const indexOf = this.textArray.indexOf(term);
        if (indexOf >= 0) {
            this.textArray.splice(indexOf, 1);
            this.embeddingIndex.removeAt(indexOf);
        }
    }
    clear() {
        this.textArray = [];
        this.embeddingIndex.clear();
    }
    serialize() {
        return {
            textItems: this.textArray,
            embeddings: this.embeddingIndex.serialize(),
        };
    }
    deserialize(data) {
        if (data.textItems.length !== data.embeddings.length) {
            throw new Error(`TextEmbeddingIndexData corrupt. textItems.length ${data.textItems.length} != ${data.embeddings.length}`);
        }
        this.textArray = data.textItems;
        this.embeddingIndex.deserialize(data.embeddings);
    }
    matchesToTerms(matches) {
        return matches.map((m) => {
            return { text: this.textArray[m.item], weight: m.score };
        });
    }
}
export class TermEditDistanceIndex extends TextEditDistanceIndex {
    constructor(textArray = []) {
        super(textArray);
    }
    async addTerms(terms) {
        this.textArray.push(...terms);
    }
    async lookupTerm(text, maxMatches, thresholdScore) {
        const matches = await super.getNearest(text, maxMatches, thresholdScore);
        return this.matchesToTerms(matches);
    }
    async lookupTerms(textArray, maxMatches, thresholdScore) {
        const matches = await super.getNearestMultiple(textArray, maxMatches, thresholdScore);
        return matches.map((m) => this.matchesToTerms(m));
    }
    matchesToTerms(matches) {
        return matches.map((m) => {
            return { text: m.item, weight: m.score };
        });
    }
}
export class TermToRelatedTermsIndex2 {
    constructor(settings) {
        this.synonyms = new TermToRelatedTermsMap();
        this.termEmbeddings = new TermEmbeddingIndex(settings);
    }
    addTerms(termTexts, eventHandler) {
        return this.termEmbeddings.addTerms(termTexts, eventHandler);
    }
    addSynonyms(termText, relatedTerm) {
        this.synonyms.addRelatedTerm(termText, relatedTerm);
    }
    lookupSynonym(termText) {
        return this.synonyms.lookupTerm(termText);
    }
    lookupTermsFuzzy(termTexts, maxMatches, thresholdScore) {
        return this.termEmbeddings.lookupTerms(termTexts, maxMatches, thresholdScore);
    }
}
//# sourceMappingURL=relatedTermsIndex.js.map