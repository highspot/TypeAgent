import { DateRange, IConversation, KnowledgeType, ScoredKnowledge, ScoredSemanticRef, SemanticRef, Term } from "./interfaces.js";
import { PromptSection } from "typechat";
export type SearchTerm = {
    /**
     * Term being searched for
     */
    term: Term;
    /**
     * Additional terms related to term.
     * These can be supplied from synonym tables and so on
     */
    relatedTerms?: Term[] | undefined;
};
/**
 * A Group of search terms
 */
export type SearchTermGroup = {
    /**
     * And will enforce that all terms match
     */
    booleanOp: "and" | "or";
    terms: (SearchTerm | PropertySearchTerm)[];
};
/**
 * Well known knowledge properties
 */
export type KnowledgePropertyName = "name" | "type" | "verb" | "subject" | "object" | "indirectObject" | "tag";
export type PropertySearchTerm = {
    /**
     * PropertySearch terms let you matched named property, values
     * - You can  match a well known property name (name("Bach") type("book"))
     * - Or you can provide a SearchTerm as a propertyName.
     *   E.g. to match hue(red)
     *      - propertyName as SearchTerm, set to 'hue'
     *      - propertyValue as SearchTerm, set to 'red'
     * SearchTerms can included related terms
     *   E.g you could include "color" as a related term for the propertyName "hue". Or 'crimson' for red.
     * The the query processor can also related terms using a related terms secondary index, if one is available
     */
    propertyName: KnowledgePropertyName | SearchTerm;
    propertyValue: SearchTerm;
};
export declare function createSearchTerm(text: string, score?: number): SearchTerm;
export declare function createPropertySearchTerm(key: string, value: string): PropertySearchTerm;
export type WhenFilter = {
    knowledgeType?: KnowledgeType | undefined;
    dateRange?: DateRange | undefined;
    threadDescription?: string | undefined;
};
export type SearchOptions = {
    maxMatches?: number | undefined;
    exactMatch?: boolean | undefined;
    usePropertyIndex?: boolean | undefined;
    useTimestampIndex?: boolean | undefined;
};
export type SearchResult = {
    termMatches: Set<string>;
    semanticRefMatches: ScoredSemanticRef[];
};
/**
 * Searches conversation for terms
 */
export declare function searchConversation(conversation: IConversation, searchTermGroup: SearchTermGroup, filter?: WhenFilter, options?: SearchOptions): Promise<Map<KnowledgeType, SearchResult> | undefined>;
export declare function getDistinctEntityMatches(semanticRefs: SemanticRef[], searchResults: ScoredSemanticRef[], topK?: number): ScoredKnowledge[];
export declare function getDistinctTopicMatches(semanticRefs: SemanticRef[], searchResults: ScoredSemanticRef[], topK?: number): ScoredKnowledge[];
export declare function getTimeRangeForConversation(conversation: IConversation): DateRange | undefined;
export declare function getTimeRangeSectionForConversation(conversation: IConversation): PromptSection[];
//# sourceMappingURL=search.d.ts.map