// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PropertyTermSet, SemanticRefAccumulator, TermSet, TextRangeCollection, TextRangesInScope, } from "./collections.js";
import { lookupPropertyInPropertyIndex, PropertyNames, } from "./propertyIndex.js";
import { collections } from "typeagent";
import { facetValueToString } from "./knowledge.js";
import { isInDateRange, isSearchTermWildcard } from "./common.js";
export function isConversationSearchable(conversation) {
    return (conversation.semanticRefIndex !== undefined &&
        conversation.semanticRefs !== undefined);
}
export function getTextRangeForDateRange(conversation, dateRange) {
    const messages = conversation.messages;
    let rangeStartIndex = -1;
    let rangeEndIndex = rangeStartIndex;
    for (let messageIndex = 0; messageIndex < messages.length; ++messageIndex) {
        const message = messages[messageIndex];
        if (message.timestamp) {
            if (isInDateRange(dateRange, new Date(message.timestamp))) {
                if (rangeStartIndex < 0) {
                    rangeStartIndex = messageIndex;
                }
                rangeEndIndex = messageIndex;
            }
            else {
                if (rangeStartIndex >= 0) {
                    break;
                }
            }
        }
    }
    if (rangeStartIndex >= 0) {
        return {
            start: { messageIndex: rangeStartIndex },
            end: { messageIndex: rangeEndIndex + 1 },
        };
    }
    return undefined;
}
/**
 * A SearchTerm consists of (a) a term (b) optional terms related to term
 * Returns the term or related term that equals the given text
 * @param searchTerm
 * @param text
 * @returns The term or related term that matched the text
 */
function getMatchingTermForText(searchTerm, text) {
    // Do case-INSENSITIVE comparisons, since stored entities may have different case
    if (collections.stringEquals(text, searchTerm.term.text, false)) {
        return searchTerm.term;
    }
    if (searchTerm.relatedTerms && searchTerm.relatedTerms.length > 0) {
        for (const relatedTerm of searchTerm.relatedTerms) {
            if (collections.stringEquals(text, relatedTerm.text, false)) {
                return relatedTerm;
            }
        }
    }
    return undefined;
}
/**
 * See if a search term equals the given text.
 * Also compares any related terms
 * @param searchTerm
 * @param text
 */
function matchSearchTermToText(searchTerm, text) {
    if (text) {
        return getMatchingTermForText(searchTerm, text) !== undefined;
    }
    return false;
}
function matchSearchTermToOneOfText(searchTerm, textArray) {
    if (textArray) {
        for (const text of textArray) {
            if (matchSearchTermToText(searchTerm, text)) {
                return true;
            }
        }
    }
    return false;
}
export function matchPropertySearchTermToEntity(searchTerm, semanticRef) {
    if (semanticRef.knowledgeType !== "entity" ||
        typeof searchTerm.propertyName !== "string") {
        return false;
    }
    const entity = semanticRef.knowledge;
    switch (searchTerm.propertyName) {
        default:
            break;
        case "type":
            return matchSearchTermToOneOfText(searchTerm.propertyValue, entity.type);
        case "name":
            return matchSearchTermToText(searchTerm.propertyValue, entity.name);
        case "facet.name":
            return matchPropertyNameToFacetName(searchTerm.propertyValue, entity);
        case "facet.value":
            return matchPropertyValueToFacetValue(searchTerm.propertyValue, entity);
    }
    return false;
}
export function matchEntityNameOrType(propertyValue, entity) {
    return (matchSearchTermToText(propertyValue, entity.name) ||
        matchSearchTermToOneOfText(propertyValue, entity.type));
}
function matchPropertyNameToFacetName(propertyValue, entity) {
    if (entity.facets && entity.facets.length > 0) {
        for (const facet of entity.facets) {
            if (matchSearchTermToText(propertyValue, facet.name)) {
                return true;
            }
        }
    }
    return false;
}
function matchPropertyValueToFacetValue(propertyValue, entity) {
    if (entity.facets && entity.facets.length > 0) {
        for (const facet of entity.facets) {
            const facetValue = facetValueToString(facet);
            if (matchSearchTermToText(propertyValue, facetValue)) {
                return true;
            }
        }
    }
    return false;
}
function matchPropertySearchTermToAction(searchTerm, semanticRef) {
    if (semanticRef.knowledgeType !== "action" ||
        typeof searchTerm.propertyName !== "string") {
        return false;
    }
    const action = semanticRef.knowledge;
    switch (searchTerm.propertyName) {
        default:
            break;
        case "verb":
            return matchSearchTermToOneOfText(searchTerm.propertyValue, action.verbs);
        case "subject":
            return entityNameMatch(searchTerm.propertyValue, action.subjectEntityName);
        case "object":
            return entityNameMatch(searchTerm.propertyValue, action.objectEntityName);
        case "indirectObject":
            return entityNameMatch(searchTerm.propertyValue, action.indirectObjectEntityName);
    }
    return false;
    function entityNameMatch(searchTerm, entityValue) {
        return (entityValue !== "none" &&
            matchSearchTermToText(searchTerm, entityValue));
    }
}
function matchPropertySearchTermToTag(searchTerm, semanticRef) {
    if (semanticRef.knowledgeType !== "tag" ||
        typeof searchTerm.propertyName !== "string") {
        return false;
    }
    return matchSearchTermToText(searchTerm.propertyValue, semanticRef.knowledge.text);
}
export function matchPropertySearchTermToSemanticRef(searchTerm, semanticRef) {
    return (matchPropertySearchTermToEntity(searchTerm, semanticRef) ||
        matchPropertySearchTermToAction(searchTerm, semanticRef) ||
        matchPropertySearchTermToTag(searchTerm, semanticRef));
}
export function lookupTermFiltered(semanticRefIndex, term, semanticRefs, filter) {
    const scoredRefs = semanticRefIndex.lookupTerm(term.text);
    if (scoredRefs && scoredRefs.length > 0) {
        let filtered = scoredRefs.filter((sr) => {
            const semanticRef = semanticRefs[sr.semanticRefIndex];
            const result = filter(semanticRef, sr);
            return result;
        });
        return filtered;
    }
    return undefined;
}
export function lookupTerm(semanticRefIndex, term, semanticRefs, rangesInScope) {
    if (rangesInScope) {
        // If rangesInScope has no actual text ranges, then lookups can't possibly match
        return lookupTermFiltered(semanticRefIndex, term, semanticRefs, (sr) => rangesInScope.isRangeInScope(sr.range));
    }
    return semanticRefIndex.lookupTerm(term.text);
}
export function lookupProperty(semanticRefIndex, propertySearchTerm, semanticRefs, rangesInScope) {
    if (typeof propertySearchTerm.propertyName !== "string") {
        throw new Error("Not supported");
    }
    // Since we are only matching propertyValue.term
    const valueTerm = propertySearchTerm.propertyValue.term;
    propertySearchTerm = {
        propertyName: propertySearchTerm.propertyName,
        propertyValue: { term: valueTerm },
    };
    return lookupTermFiltered(semanticRefIndex, valueTerm, semanticRefs, (semanticRef) => {
        const inScope = rangesInScope
            ? rangesInScope.isRangeInScope(semanticRef.range)
            : true;
        return (inScope &&
            matchPropertySearchTermToSemanticRef(propertySearchTerm, semanticRef));
    });
}
export class QueryEvalContext {
    constructor(conversation, 
    /**
     * If a property secondary index is available, the query processor will use it
     */
    propertyIndex = undefined, 
    /**
     * If a timestamp secondary index is available, the query processor will use it
     */
    timestampIndex = undefined) {
        this.conversation = conversation;
        this.propertyIndex = propertyIndex;
        this.timestampIndex = timestampIndex;
        this.matchedTerms = new TermSet();
        this.matchedPropertyTerms = new PropertyTermSet();
        if (!isConversationSearchable(conversation)) {
            throw new Error(`${conversation.nameTag} is not initialized and cannot be searched`);
        }
        this.textRangesInScope = new TextRangesInScope();
    }
    get semanticRefIndex() {
        return this.conversation.semanticRefIndex;
    }
    get semanticRefs() {
        return this.conversation.semanticRefs;
    }
    getSemanticRef(semanticRefIndex) {
        return this.conversation.semanticRefs[semanticRefIndex];
    }
    getMessageForRef(semanticRef) {
        const messageIndex = semanticRef.range.start.messageIndex;
        return this.conversation.messages[messageIndex];
    }
    clearMatchedTerms() {
        this.matchedTerms.clear();
        this.matchedPropertyTerms.clear();
    }
}
export class QueryOpExpr {
    eval(context) {
        throw new Error("Not implemented");
    }
}
export class SelectTopNExpr extends QueryOpExpr {
    constructor(sourceExpr, maxMatches = undefined, minHitCount = undefined) {
        super();
        this.sourceExpr = sourceExpr;
        this.maxMatches = maxMatches;
        this.minHitCount = minHitCount;
    }
    eval(context) {
        const matches = this.sourceExpr.eval(context);
        matches.selectTopNScoring(this.maxMatches, this.minHitCount);
        return matches;
    }
}
export class MatchTermsBooleanExpr extends QueryOpExpr {
    constructor(getScopeExpr) {
        super();
        this.getScopeExpr = getScopeExpr;
    }
    beginMatch(context) {
        if (this.getScopeExpr) {
            context.textRangesInScope = this.getScopeExpr.eval(context);
        }
        context.clearMatchedTerms();
    }
}
/**
 * Evaluates all child search term expressions
 * Returns their accumulated scored matches
 */
export class MatchTermsOrExpr extends MatchTermsBooleanExpr {
    constructor(termExpressions, getScopeExpr) {
        super(getScopeExpr);
        this.termExpressions = termExpressions;
        this.getScopeExpr = getScopeExpr;
    }
    eval(context) {
        super.beginMatch(context);
        const allMatches = new SemanticRefAccumulator();
        for (const matchExpr of this.termExpressions) {
            matchExpr.accumulateMatches(context, allMatches);
        }
        allMatches.calculateTotalScore();
        return allMatches;
    }
}
export class MatchTermsAndExpr extends MatchTermsBooleanExpr {
    constructor(termExpressions, getScopeExpr) {
        super(getScopeExpr);
        this.termExpressions = termExpressions;
        this.getScopeExpr = getScopeExpr;
    }
    eval(context) {
        super.beginMatch(context);
        let allMatches;
        let iTerm = 0;
        // Loop over each search term, intersecting the returned results...
        for (; iTerm < this.termExpressions.length; ++iTerm) {
            const termMatches = this.termExpressions[iTerm].eval(context);
            if (termMatches === undefined || termMatches.size === 0) {
                // We can't possibly have an 'and'
                break;
            }
            if (allMatches === undefined) {
                allMatches = termMatches;
            }
            else {
                allMatches = allMatches.intersect(termMatches);
            }
        }
        if (allMatches) {
            if (iTerm === this.termExpressions.length) {
                allMatches.calculateTotalScore();
                allMatches.selectWithHitCount(this.termExpressions.length);
            }
            else {
                // And is not possible
                allMatches.clearMatches();
            }
        }
        return allMatches ?? new SemanticRefAccumulator();
    }
}
export class MatchTermExpr extends QueryOpExpr {
    constructor() {
        super();
    }
    eval(context) {
        const matches = new SemanticRefAccumulator();
        this.accumulateMatches(context, matches);
        if (matches.size > 0) {
            return matches;
        }
        return undefined;
    }
    accumulateMatches(context, matches) {
        return;
    }
}
export class MatchSearchTermExpr extends MatchTermExpr {
    constructor(searchTerm, scoreBooster) {
        super();
        this.searchTerm = searchTerm;
        this.scoreBooster = scoreBooster;
    }
    accumulateMatches(context, matches) {
        // Match the search term
        this.accumulateMatchesForTerm(context, matches, this.searchTerm.term);
        // And any related terms
        if (this.searchTerm.relatedTerms &&
            this.searchTerm.relatedTerms.length > 0) {
            for (const relatedTerm of this.searchTerm.relatedTerms) {
                this.accumulateMatchesForTerm(context, matches, this.searchTerm.term, relatedTerm);
            }
        }
    }
    lookupTerm(context, term) {
        const matches = lookupTerm(context.semanticRefIndex, term, context.semanticRefs, context.textRangesInScope);
        if (matches && this.scoreBooster) {
            for (let i = 0; i < matches.length; ++i) {
                matches[i] = this.scoreBooster(this.searchTerm, context.getSemanticRef(matches[i].semanticRefIndex), matches[i]);
            }
        }
        return matches;
    }
    accumulateMatchesForTerm(context, matches, term, relatedTerm) {
        if (relatedTerm === undefined) {
            if (!context.matchedTerms.has(term)) {
                const semanticRefs = this.lookupTerm(context, term);
                matches.addTermMatches(term, semanticRefs, true);
                context.matchedTerms.add(term);
            }
        }
        else {
            if (!context.matchedTerms.has(relatedTerm)) {
                const semanticRefs = this.lookupTerm(context, relatedTerm);
                matches.addTermMatches(term, semanticRefs, false, relatedTerm.weight);
                context.matchedTerms.add(relatedTerm);
            }
        }
    }
}
export class MatchPropertySearchTermExpr extends MatchTermExpr {
    constructor(propertySearchTerm) {
        super();
        this.propertySearchTerm = propertySearchTerm;
    }
    accumulateMatches(context, matches) {
        if (typeof this.propertySearchTerm.propertyName === "string") {
            this.accumulateMatchesForProperty(context, this.propertySearchTerm.propertyName, this.propertySearchTerm.propertyValue, matches);
        }
        else {
            this.accumulateMatchesForFacets(context, this.propertySearchTerm.propertyName, this.propertySearchTerm.propertyValue, matches);
        }
    }
    accumulateMatchesForFacets(context, propertyName, propertyValue, matches) {
        this.accumulateMatchesForProperty(context, PropertyNames.FacetName, propertyName, matches);
        if (!isSearchTermWildcard(propertyValue)) {
            this.accumulateMatchesForProperty(context, PropertyNames.FacetValue, propertyValue, matches);
        }
    }
    accumulateMatchesForProperty(context, propertyName, propertyValue, matches) {
        this.accumulateMatchesForPropertyValue(context, matches, propertyName, propertyValue.term);
        if (propertyValue.relatedTerms &&
            propertyValue.relatedTerms.length > 0) {
            for (const relatedPropertyValue of propertyValue.relatedTerms) {
                this.accumulateMatchesForPropertyValue(context, matches, propertyName, propertyValue.term, relatedPropertyValue);
            }
        }
    }
    accumulateMatchesForPropertyValue(context, matches, propertyName, propertyValue, relatedPropVal) {
        if (relatedPropVal === undefined) {
            if (!context.matchedPropertyTerms.has(propertyName, propertyValue)) {
                const semanticRefs = this.lookupProperty(context, propertyName, propertyValue.text);
                matches.addTermMatches(propertyValue, semanticRefs, true);
                context.matchedPropertyTerms.add(propertyName, propertyValue);
            }
        }
        else {
            if (!context.matchedPropertyTerms.has(propertyName, relatedPropVal)) {
                const semanticRefs = this.lookupProperty(context, propertyName, relatedPropVal.text);
                matches.addTermMatches(propertyValue, semanticRefs, false, relatedPropVal.weight);
                context.matchedPropertyTerms.add(propertyName, relatedPropVal);
            }
        }
    }
    lookupProperty(context, propertyName, propertyValue) {
        if (context.propertyIndex) {
            return lookupPropertyInPropertyIndex(context.propertyIndex, propertyName, propertyValue, context.semanticRefs, context.textRangesInScope);
        }
        return this.lookupPropertyWithoutIndex(context, propertyName, propertyValue);
    }
    lookupPropertyWithoutIndex(context, propertyName, propertyValue) {
        return lookupProperty(context.semanticRefIndex, {
            propertyName: propertyName,
            propertyValue: { term: { text: propertyValue } },
        }, context.semanticRefs, context.textRangesInScope);
    }
}
export class MatchTagExpr extends MatchSearchTermExpr {
    constructor(tagTerm) {
        super(tagTerm);
        this.tagTerm = tagTerm;
    }
    lookupTerm(context, term) {
        return lookupTermFiltered(context.semanticRefIndex, term, context.semanticRefs, (semanticRef) => semanticRef.knowledgeType === "tag");
    }
}
export class GroupByKnowledgeTypeExpr extends QueryOpExpr {
    constructor(matches) {
        super();
        this.matches = matches;
    }
    eval(context) {
        const semanticRefMatches = this.matches.eval(context);
        return semanticRefMatches.groupMatchesByType(context.semanticRefs);
    }
}
export class SelectTopNKnowledgeGroupExpr extends QueryOpExpr {
    constructor(sourceExpr, maxMatches = undefined, minHitCount = undefined) {
        super();
        this.sourceExpr = sourceExpr;
        this.maxMatches = maxMatches;
        this.minHitCount = minHitCount;
    }
    eval(context) {
        const groupsAccumulators = this.sourceExpr.eval(context);
        for (const accumulator of groupsAccumulators.values()) {
            accumulator.selectTopNScoring(this.maxMatches, this.minHitCount);
        }
        return groupsAccumulators;
    }
}
export class GroupSearchResultsExpr extends QueryOpExpr {
    constructor(srcExpr) {
        super();
        this.srcExpr = srcExpr;
    }
    eval(context) {
        return toGroupedSearchResults(this.srcExpr.eval(context));
    }
}
export class WhereSemanticRefExpr extends QueryOpExpr {
    constructor(sourceExpr, predicates) {
        super();
        this.sourceExpr = sourceExpr;
        this.predicates = predicates;
    }
    eval(context) {
        const accumulator = this.sourceExpr.eval(context);
        const filtered = new SemanticRefAccumulator(accumulator.searchTermMatches);
        filtered.setMatches(accumulator.getMatches((match) => this.evalPredicates(context, this.predicates, match)));
        return filtered;
    }
    evalPredicates(context, predicates, match) {
        for (let i = 0; i < predicates.length; ++i) {
            const semanticRef = context.getSemanticRef(match.value);
            if (!predicates[i].eval(context, semanticRef)) {
                return false;
            }
        }
        return true;
    }
}
function matchPredicates(context, predicates, semanticRef) {
    for (let i = 0; i < predicates.length; ++i) {
        if (!predicates[i].eval(context, semanticRef)) {
            return false;
        }
    }
    return true;
}
export class KnowledgeTypePredicate {
    constructor(type) {
        this.type = type;
    }
    eval(context, semanticRef) {
        return semanticRef.knowledgeType === this.type;
    }
}
export class PropertyMatchPredicate {
    constructor(searchTerm) {
        this.searchTerm = searchTerm;
    }
    eval(context, semanticRef) {
        return matchPropertySearchTermToSemanticRef(this.searchTerm, semanticRef);
    }
}
export class GetScopeExpr extends QueryOpExpr {
    constructor(rangeSelectors) {
        super();
        this.rangeSelectors = rangeSelectors;
    }
    eval(context) {
        let rangesInScope = new TextRangesInScope();
        for (const selector of this.rangeSelectors) {
            const range = selector.eval(context);
            if (range) {
                rangesInScope.addTextRanges(range);
            }
        }
        return rangesInScope;
    }
}
export class SelectInScopeExpr extends QueryOpExpr {
    constructor(sourceExpr, rangeSelectors) {
        super();
        this.sourceExpr = sourceExpr;
        this.rangeSelectors = rangeSelectors;
    }
    eval(context) {
        let semanticRefs = this.sourceExpr.eval(context);
        // Scope => collect the set of text ranges that are in scope for this query
        // - Collect all possible text ranges that may be in scope.
        // - Since ranges come from a set of range selectors, the collected ranges may overlap, or may not agree.
        //  We don't intersect/union ranges yet... future optimization
        const rangesInScope = new TextRangesInScope();
        for (const selector of this.rangeSelectors) {
            const range = selector.eval(context, semanticRefs);
            if (range) {
                rangesInScope.addTextRanges(range);
            }
        }
        semanticRefs = semanticRefs.getMatchesInScope(context.semanticRefs, rangesInScope);
        return semanticRefs;
    }
}
export class TextRangesInDateRangeSelector {
    constructor(dateRangeInScope) {
        this.dateRangeInScope = dateRangeInScope;
    }
    eval(context) {
        const textRangesInScope = new TextRangeCollection();
        if (context.timestampIndex) {
            const textRanges = context.timestampIndex.lookupRange(this.dateRangeInScope);
            for (const timeRange of textRanges) {
                textRangesInScope.addRange(timeRange.range);
            }
            return textRangesInScope;
        }
        else {
            const textRange = getTextRangeForDateRange(context.conversation, this.dateRangeInScope);
            if (textRange !== undefined) {
                textRangesInScope.addRange(textRange);
            }
        }
        return textRangesInScope;
    }
}
export class TextRangesPredicateSelector {
    constructor(predicates) {
        this.predicates = predicates;
    }
    eval(context, semanticRefs) {
        if (!semanticRefs) {
            return undefined;
        }
        if (this.predicates && this.predicates.length > 0) {
            const textRangesInScope = new TextRangeCollection();
            for (const inScopeRef of semanticRefs.getSemanticRefs(context.semanticRefs, (sr) => matchPredicates(context, this.predicates, sr))) {
                textRangesInScope.addRange(inScopeRef.range);
            }
            return textRangesInScope;
        }
        return undefined;
    }
}
export class TextRangesWithTagSelector {
    constructor() { }
    eval(context, semanticRefs) {
        let textRangesInScope;
        for (const inScopeRef of semanticRefs.getSemanticRefs(context.semanticRefs, (sr) => sr.knowledgeType === "tag")) {
            textRangesInScope ??= new TextRangeCollection();
            textRangesInScope.addRange(inScopeRef.range);
        }
        return textRangesInScope;
    }
}
export class TextRangesWithTermMatchesSelector {
    constructor(sourceExpr) {
        this.sourceExpr = sourceExpr;
    }
    eval(context) {
        const matches = this.sourceExpr.eval(context);
        const rangesInScope = new TextRangeCollection();
        if (matches.size > 0) {
            for (const match of matches.getMatches()) {
                const semanticRef = context.getSemanticRef(match.value);
                rangesInScope.addRange(semanticRef.range);
            }
        }
        return rangesInScope;
    }
}
export class ThreadSelector {
    constructor(threads) {
        this.threads = threads;
    }
    eval(context) {
        const textRanges = new TextRangeCollection();
        for (const thread of this.threads) {
            textRanges.addRanges(thread.ranges);
        }
        return textRanges;
    }
}
export function toGroupedSearchResults(evalResults) {
    const semanticRefMatches = new Map();
    for (const [type, accumulator] of evalResults) {
        if (accumulator.size > 0) {
            semanticRefMatches.set(type, {
                termMatches: accumulator.searchTermMatches,
                semanticRefMatches: accumulator.toScoredSemanticRefs(),
            });
        }
    }
    return semanticRefMatches;
}
//# sourceMappingURL=query.js.map