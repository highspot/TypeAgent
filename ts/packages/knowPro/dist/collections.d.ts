import { IMessage, Knowledge, KnowledgeType, ScoredSemanticRef, SemanticRef, SemanticRefIndex, Term, TextRange } from "./interfaces.js";
export interface Match<T = any> {
    value: T;
    score: number;
    hitCount: number;
    relatedScore: number;
    relatedHitCount: number;
}
/**
 * Sort in place
 * @param matches
 */
export declare function sortMatchesByRelevance(matches: Match[]): void;
export declare class MatchAccumulator<T = any> {
    private matches;
    constructor();
    get size(): number;
    has(value: T): boolean;
    getMatch(value: T): Match<T> | undefined;
    setMatch(match: Match<T>): void;
    setMatches(matches: Match<T>[] | IterableIterator<Match<T>>, clear?: boolean): void;
    getMaxHitCount(): number;
    add(value: T, score: number, isExactMatch: boolean): void;
    addUnion(other: MatchAccumulator): void;
    intersect(other: MatchAccumulator, intersection?: MatchAccumulator): MatchAccumulator;
    private combineMatches;
    calculateTotalScore(): void;
    getSortedByScore(minHitCount?: number): Match<T>[];
    /**
     * Return the top N scoring matches
     * @param maxMatches
     * @returns
     */
    getTopNScoring(maxMatches?: number, minHitCount?: number): Match<T>[];
    getWithHitCount(minHitCount: number): Match<T>[];
    getMatches(predicate?: (match: Match<T>) => boolean): IterableIterator<Match<T>>;
    clearMatches(): void;
    selectTopNScoring(maxMatches?: number, minHitCount?: number): number;
    selectWithHitCount(minHitCount: number): number;
    private matchesWithMinHitCount;
}
export type KnowledgePredicate<T extends Knowledge> = (knowledge: T) => boolean;
export declare class SemanticRefAccumulator extends MatchAccumulator<SemanticRefIndex> {
    searchTermMatches: Set<string>;
    constructor(searchTermMatches?: Set<string>);
    addTermMatches(searchTerm: Term, scoredRefs: ScoredSemanticRef[] | IterableIterator<ScoredSemanticRef> | undefined, isExactMatch: boolean, weight?: number): void;
    getSortedByScore(minHitCount?: number): Match<SemanticRefIndex>[];
    getTopNScoring(maxMatches?: number, minHitCount?: number): Match<SemanticRefIndex>[];
    getSemanticRefs(semanticRefs: SemanticRef[], predicate?: (semanticRef: SemanticRef) => boolean): IterableIterator<SemanticRef>;
    getMatchesOfType<T extends Knowledge>(semanticRefs: SemanticRef[], knowledgeType: KnowledgeType, predicate?: KnowledgePredicate<T>): IterableIterator<Match<SemanticRefIndex>>;
    groupMatchesByType(semanticRefs: SemanticRef[]): Map<KnowledgeType, SemanticRefAccumulator>;
    getMatchesInScope(semanticRefs: SemanticRef[], rangesInScope: TextRangesInScope): SemanticRefAccumulator;
    intersect(other: SemanticRefAccumulator): SemanticRefAccumulator;
    toScoredSemanticRefs(): ScoredSemanticRef[];
    clearMatches(): void;
}
export declare class MessageAccumulator extends MatchAccumulator<IMessage> {
}
export declare class TextRangeCollection {
    private ranges;
    constructor(ranges?: TextRange[] | undefined);
    get size(): number;
    addRange(textRange: TextRange): boolean;
    addRanges(textRanges: TextRange[] | TextRangeCollection): void;
    isInRange(rangeToMatch: TextRange): boolean;
}
export declare class TextRangesInScope {
    textRanges: TextRangeCollection[] | undefined;
    constructor(textRanges?: TextRangeCollection[] | undefined);
    addTextRanges(ranges: TextRangeCollection): void;
    isRangeInScope(innerRange: TextRange): boolean;
}
export declare class TermSet {
    private terms;
    constructor(terms?: Term[]);
    get size(): number;
    add(term: Term): boolean;
    addOrUnion(terms: Term | Term[] | undefined): void;
    get(term: string | Term): Term | undefined;
    getWeight(term: Term): number | undefined;
    has(term: Term): boolean;
    remove(term: Term): void;
    clear(): void;
    values(): IterableIterator<Term>;
}
export declare class PropertyTermSet {
    private terms;
    constructor(terms?: Map<string, Term>);
    add(propertyName: string, propertyValue: Term): void;
    has(propertyName: string, propertyValue: Term): boolean;
    clear(): void;
    private makeKey;
}
/**
 * Unions two un-sorted arrays
 * @param xArray
 * @param yArray
 */
export declare function unionArrays<T = any>(x: T[] | undefined, y: T[] | undefined): T[] | undefined;
//# sourceMappingURL=collections.d.ts.map