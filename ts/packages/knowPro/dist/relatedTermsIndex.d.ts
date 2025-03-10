import { collections } from "typeagent";
import { IConversation, Term } from "./interfaces.js";
import { IndexingEventHandlers } from "./interfaces.js";
import { ITextEmbeddingIndexData, ITermToRelatedTermsData, ITermsToRelatedTermsIndexData } from "./secondaryIndexes.js";
import { ITermToRelatedTermsIndex, ITermToRelatedTermsFuzzy, ITermToRelatedTerms } from "./interfaces.js";
import { SearchTerm } from "./search.js";
import { TextEditDistanceIndex, TextEmbeddingIndexSettings } from "./fuzzyIndex.js";
export declare class TermToRelatedTermsMap implements ITermToRelatedTerms {
    map: collections.MultiMap<string, Term>;
    constructor();
    addRelatedTerm(termText: string, relatedTerm: Term | Term[]): void;
    lookupTerm(term: string): Term[] | undefined;
    removeTerm(term: string): void;
    clear(): void;
    serialize(): ITermToRelatedTermsData;
    deserialize(data?: ITermToRelatedTermsData): void;
}
export type RelatedTermIndexSettings = {
    embeddingIndexSettings?: TextEmbeddingIndexSettings | undefined;
};
export declare class RelatedTermsIndex implements ITermToRelatedTermsIndex {
    settings: RelatedTermIndexSettings;
    private aliasMap;
    private editDistanceIndex;
    private embeddingIndex;
    constructor(settings: RelatedTermIndexSettings);
    get aliases(): TermToRelatedTermsMap;
    get termEditDistanceIndex(): TermEditDistanceIndex | undefined;
    get fuzzyIndex(): TermEmbeddingIndex | undefined;
    serialize(): ITermsToRelatedTermsIndexData;
    deserialize(data?: ITermsToRelatedTermsIndexData): void;
}
export declare function buildRelatedTermsIndex(conversation: IConversation, eventHandler?: IndexingEventHandlers): Promise<void>;
/**
 * Give searchTerms, resolves related terms for those searchTerms that don't already have them
 * Optionally ensures that related terms are not duplicated across search terms because this can
 * skew how semantic references are scored during search (over-counting)
 * @param relatedTermsIndex
 * @param searchTerms
 */
export declare function resolveRelatedTerms(relatedTermsIndex: ITermToRelatedTermsIndex, searchTerms: SearchTerm[], ensureSingleOccurrence?: boolean): Promise<void>;
export interface ITermEmbeddingIndex extends ITermToRelatedTermsFuzzy {
    serialize(): ITextEmbeddingIndexData;
    deserialize(data: ITextEmbeddingIndexData): void;
}
export declare class TermEmbeddingIndex implements ITermEmbeddingIndex {
    settings: TextEmbeddingIndexSettings;
    private textArray;
    private embeddingIndex;
    constructor(settings: TextEmbeddingIndexSettings, data?: ITextEmbeddingIndexData);
    addTerms(terms: string[], eventHandler?: IndexingEventHandlers): Promise<void>;
    lookupTerm(text: string, maxMatches?: number, minScore?: number): Promise<Term[]>;
    lookupTerms(texts: string[], maxMatches?: number, minScore?: number): Promise<Term[][]>;
    removeTerm(term: string): void;
    clear(): void;
    serialize(): ITextEmbeddingIndexData;
    deserialize(data: ITextEmbeddingIndexData): void;
    private matchesToTerms;
}
export declare class TermEditDistanceIndex extends TextEditDistanceIndex implements ITermToRelatedTermsFuzzy {
    constructor(textArray?: string[]);
    addTerms(terms: string[]): Promise<void>;
    lookupTerm(text: string, maxMatches?: number, thresholdScore?: number): Promise<Term[]>;
    lookupTerms(textArray: string[], maxMatches?: number, thresholdScore?: number): Promise<Term[][]>;
    private matchesToTerms;
}
/**
 * Work in progress; Simplifying related terms
 */
export interface ITermToRelatedTermsIndex2 {
    addTerms(termTexts: string[], eventHandler?: IndexingEventHandlers): Promise<void>;
    addSynonyms(termText: string, relatedTerms: Term[]): void;
    lookupSynonym(termText: string): Term[] | undefined;
    lookupTermsFuzzy(termTexts: string[], maxMatches?: number, thresholdScore?: number): Promise<Term[][]>;
}
export declare class TermToRelatedTermsIndex2 implements ITermToRelatedTermsIndex2 {
    private synonyms;
    private termEmbeddings;
    constructor(settings: TextEmbeddingIndexSettings);
    addTerms(termTexts: string[], eventHandler?: IndexingEventHandlers): Promise<void>;
    addSynonyms(termText: string, relatedTerm: Term[]): void;
    lookupSynonym(termText: string): Term[] | undefined;
    lookupTermsFuzzy(termTexts: string[], maxMatches?: number, thresholdScore?: number): Promise<Term[][]>;
}
//# sourceMappingURL=relatedTermsIndex.d.ts.map