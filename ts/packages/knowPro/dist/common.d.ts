import { DateRange, TextLocation, TextRange } from "./interfaces.js";
import { SearchTerm } from "./search.js";
/**
 * Common types and methods INTERNAL to the library.
 * Should not be exposed via index.ts
 */
export interface Scored<T = any> {
    item: T;
    score: number;
}
/**
 * Returns:
 *  0 if locations are equal
 *  < 0 if x is less than y
 *  > 0 if x is greater than y
 * @param x
 * @param y
 * @returns
 */
export declare function compareTextLocation(x: TextLocation, y: TextLocation): number;
export declare function compareTextRange(x: TextRange, y: TextRange): number;
export declare function isInTextRange(outerRange: TextRange, innerRange: TextRange): boolean;
export declare function compareDates(x: Date, y: Date): number;
export declare function isInDateRange(outerRange: DateRange, date: Date): boolean;
export declare function isSearchTermWildcard(searchTerm: SearchTerm): boolean;
//# sourceMappingURL=common.d.ts.map