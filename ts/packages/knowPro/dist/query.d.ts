import { DateRange, IConversation, IMessage, ITermToSemanticRefIndex, KnowledgeType, ScoredSemanticRef, SemanticRef, SemanticRefIndex, Term, TextRange } from "./interfaces.js";
import { PropertySearchTerm, SearchResult, SearchTerm } from "./search.js";
import { MatchAccumulator, PropertyTermSet, SemanticRefAccumulator, TermSet, TextRangeCollection, TextRangesInScope } from "./collections.js";
import { ITimestampToTextRangeIndex } from "./interfaces.js";
import { IPropertyToSemanticRefIndex } from "./interfaces.js";
import { conversation as kpLib } from "knowledge-processor";
import { Thread } from "./interfaces.js";
export declare function isConversationSearchable(conversation: IConversation): boolean;
export declare function getTextRangeForDateRange(conversation: IConversation, dateRange: DateRange): TextRange | undefined;
export declare function matchPropertySearchTermToEntity(searchTerm: PropertySearchTerm, semanticRef: SemanticRef): boolean;
export declare function matchEntityNameOrType(propertyValue: SearchTerm, entity: kpLib.ConcreteEntity): boolean;
export declare function matchPropertySearchTermToSemanticRef(searchTerm: PropertySearchTerm, semanticRef: SemanticRef): boolean;
export declare function lookupTermFiltered(semanticRefIndex: ITermToSemanticRefIndex, term: Term, semanticRefs: SemanticRef[], filter: (semanticRef: SemanticRef, scoredRef: ScoredSemanticRef) => boolean): ScoredSemanticRef[] | undefined;
export declare function lookupTerm(semanticRefIndex: ITermToSemanticRefIndex, term: Term, semanticRefs: SemanticRef[], rangesInScope?: TextRangesInScope): ScoredSemanticRef[] | undefined;
export declare function lookupProperty(semanticRefIndex: ITermToSemanticRefIndex, propertySearchTerm: PropertySearchTerm, semanticRefs: SemanticRef[], rangesInScope?: TextRangesInScope): ScoredSemanticRef[] | undefined;
export interface IQueryOpExpr<T> {
    eval(context: QueryEvalContext): T;
}
export declare class QueryEvalContext {
    conversation: IConversation;
    /**
     * If a property secondary index is available, the query processor will use it
     */
    propertyIndex: IPropertyToSemanticRefIndex | undefined;
    /**
     * If a timestamp secondary index is available, the query processor will use it
     */
    timestampIndex: ITimestampToTextRangeIndex | undefined;
    matchedTerms: TermSet;
    matchedPropertyTerms: PropertyTermSet;
    textRangesInScope: TextRangesInScope | undefined;
    constructor(conversation: IConversation, 
    /**
     * If a property secondary index is available, the query processor will use it
     */
    propertyIndex?: IPropertyToSemanticRefIndex | undefined, 
    /**
     * If a timestamp secondary index is available, the query processor will use it
     */
    timestampIndex?: ITimestampToTextRangeIndex | undefined);
    get semanticRefIndex(): ITermToSemanticRefIndex;
    get semanticRefs(): SemanticRef[];
    getSemanticRef(semanticRefIndex: SemanticRefIndex): SemanticRef;
    getMessageForRef(semanticRef: SemanticRef): IMessage;
    clearMatchedTerms(): void;
}
export declare class QueryOpExpr<T = void> implements IQueryOpExpr<T> {
    eval(context: QueryEvalContext): T;
}
export declare class SelectTopNExpr<T extends MatchAccumulator> extends QueryOpExpr<T> {
    sourceExpr: IQueryOpExpr<T>;
    maxMatches: number | undefined;
    minHitCount: number | undefined;
    constructor(sourceExpr: IQueryOpExpr<T>, maxMatches?: number | undefined, minHitCount?: number | undefined);
    eval(context: QueryEvalContext): T;
}
export declare class MatchTermsBooleanExpr extends QueryOpExpr<SemanticRefAccumulator> {
    getScopeExpr?: GetScopeExpr | undefined;
    constructor(getScopeExpr?: GetScopeExpr | undefined);
    protected beginMatch(context: QueryEvalContext): void;
}
/**
 * Evaluates all child search term expressions
 * Returns their accumulated scored matches
 */
export declare class MatchTermsOrExpr extends MatchTermsBooleanExpr {
    termExpressions: MatchTermExpr[];
    getScopeExpr?: GetScopeExpr | undefined;
    constructor(termExpressions: MatchTermExpr[], getScopeExpr?: GetScopeExpr | undefined);
    eval(context: QueryEvalContext): SemanticRefAccumulator;
}
export declare class MatchTermsAndExpr extends MatchTermsBooleanExpr {
    termExpressions: MatchTermExpr[];
    getScopeExpr?: GetScopeExpr | undefined;
    constructor(termExpressions: MatchTermExpr[], getScopeExpr?: GetScopeExpr | undefined);
    eval(context: QueryEvalContext): SemanticRefAccumulator;
}
export declare class MatchTermExpr extends QueryOpExpr<SemanticRefAccumulator | undefined> {
    constructor();
    eval(context: QueryEvalContext): SemanticRefAccumulator | undefined;
    accumulateMatches(context: QueryEvalContext, matches: SemanticRefAccumulator): void;
}
export declare class MatchSearchTermExpr extends MatchTermExpr {
    searchTerm: SearchTerm;
    scoreBooster?: ((searchTerm: SearchTerm, sr: SemanticRef, scored: ScoredSemanticRef) => ScoredSemanticRef) | undefined;
    constructor(searchTerm: SearchTerm, scoreBooster?: ((searchTerm: SearchTerm, sr: SemanticRef, scored: ScoredSemanticRef) => ScoredSemanticRef) | undefined);
    accumulateMatches(context: QueryEvalContext, matches: SemanticRefAccumulator): void;
    protected lookupTerm(context: QueryEvalContext, term: Term): ScoredSemanticRef[] | IterableIterator<ScoredSemanticRef> | undefined;
    private accumulateMatchesForTerm;
}
export declare class MatchPropertySearchTermExpr extends MatchTermExpr {
    propertySearchTerm: PropertySearchTerm;
    constructor(propertySearchTerm: PropertySearchTerm);
    accumulateMatches(context: QueryEvalContext, matches: SemanticRefAccumulator): void;
    private accumulateMatchesForFacets;
    private accumulateMatchesForProperty;
    private accumulateMatchesForPropertyValue;
    private lookupProperty;
    private lookupPropertyWithoutIndex;
}
export declare class MatchTagExpr extends MatchSearchTermExpr {
    tagTerm: SearchTerm;
    constructor(tagTerm: SearchTerm);
    protected lookupTerm(context: QueryEvalContext, term: Term): ScoredSemanticRef[] | undefined;
}
export declare class GroupByKnowledgeTypeExpr extends QueryOpExpr<Map<KnowledgeType, SemanticRefAccumulator>> {
    matches: IQueryOpExpr<SemanticRefAccumulator>;
    constructor(matches: IQueryOpExpr<SemanticRefAccumulator>);
    eval(context: QueryEvalContext): Map<KnowledgeType, SemanticRefAccumulator>;
}
export declare class SelectTopNKnowledgeGroupExpr extends QueryOpExpr<Map<KnowledgeType, SemanticRefAccumulator>> {
    sourceExpr: IQueryOpExpr<Map<KnowledgeType, SemanticRefAccumulator>>;
    maxMatches: number | undefined;
    minHitCount: number | undefined;
    constructor(sourceExpr: IQueryOpExpr<Map<KnowledgeType, SemanticRefAccumulator>>, maxMatches?: number | undefined, minHitCount?: number | undefined);
    eval(context: QueryEvalContext): Map<KnowledgeType, SemanticRefAccumulator>;
}
export declare class GroupSearchResultsExpr extends QueryOpExpr<Map<KnowledgeType, SearchResult>> {
    srcExpr: IQueryOpExpr<Map<KnowledgeType, SemanticRefAccumulator>>;
    constructor(srcExpr: IQueryOpExpr<Map<KnowledgeType, SemanticRefAccumulator>>);
    eval(context: QueryEvalContext): Map<KnowledgeType, SearchResult>;
}
export declare class WhereSemanticRefExpr extends QueryOpExpr<SemanticRefAccumulator> {
    sourceExpr: IQueryOpExpr<SemanticRefAccumulator>;
    predicates: IQuerySemanticRefPredicate[];
    constructor(sourceExpr: IQueryOpExpr<SemanticRefAccumulator>, predicates: IQuerySemanticRefPredicate[]);
    eval(context: QueryEvalContext): SemanticRefAccumulator;
    private evalPredicates;
}
export interface IQuerySemanticRefPredicate {
    eval(context: QueryEvalContext, semanticRef: SemanticRef): boolean;
}
export declare class KnowledgeTypePredicate implements IQuerySemanticRefPredicate {
    type: KnowledgeType;
    constructor(type: KnowledgeType);
    eval(context: QueryEvalContext, semanticRef: SemanticRef): boolean;
}
export declare class PropertyMatchPredicate implements IQuerySemanticRefPredicate {
    searchTerm: PropertySearchTerm;
    constructor(searchTerm: PropertySearchTerm);
    eval(context: QueryEvalContext, semanticRef: SemanticRef): boolean;
}
export declare class GetScopeExpr extends QueryOpExpr<TextRangesInScope> {
    rangeSelectors: IQueryTextRangeSelector[];
    constructor(rangeSelectors: IQueryTextRangeSelector[]);
    eval(context: QueryEvalContext): TextRangesInScope;
}
export declare class SelectInScopeExpr extends QueryOpExpr<SemanticRefAccumulator> {
    sourceExpr: IQueryOpExpr<SemanticRefAccumulator>;
    rangeSelectors: IQueryTextRangeSelector[];
    constructor(sourceExpr: IQueryOpExpr<SemanticRefAccumulator>, rangeSelectors: IQueryTextRangeSelector[]);
    eval(context: QueryEvalContext): SemanticRefAccumulator;
}
export interface IQueryTextRangeSelector {
    eval(context: QueryEvalContext, semanticRefs?: SemanticRefAccumulator | undefined): TextRangeCollection | undefined;
}
export declare class TextRangesInDateRangeSelector implements IQueryTextRangeSelector {
    dateRangeInScope: DateRange;
    constructor(dateRangeInScope: DateRange);
    eval(context: QueryEvalContext): TextRangeCollection | undefined;
}
export declare class TextRangesPredicateSelector implements IQueryTextRangeSelector {
    predicates: IQuerySemanticRefPredicate[];
    constructor(predicates: IQuerySemanticRefPredicate[]);
    eval(context: QueryEvalContext, semanticRefs?: SemanticRefAccumulator | undefined): TextRangeCollection | undefined;
}
export declare class TextRangesWithTagSelector implements IQueryTextRangeSelector {
    constructor();
    eval(context: QueryEvalContext, semanticRefs: SemanticRefAccumulator): TextRangeCollection | undefined;
}
export declare class TextRangesWithTermMatchesSelector implements IQueryTextRangeSelector {
    sourceExpr: QueryOpExpr<SemanticRefAccumulator>;
    constructor(sourceExpr: QueryOpExpr<SemanticRefAccumulator>);
    eval(context: QueryEvalContext): TextRangeCollection;
}
export declare class ThreadSelector implements IQueryTextRangeSelector {
    threads: Thread[];
    constructor(threads: Thread[]);
    eval(context: QueryEvalContext): TextRangeCollection | undefined;
}
export declare function toGroupedSearchResults(evalResults: Map<KnowledgeType, SemanticRefAccumulator>): Map<KnowledgeType, SearchResult>;
//# sourceMappingURL=query.d.ts.map