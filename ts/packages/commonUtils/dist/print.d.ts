export declare function getElapsedString(elapsedMs: number, showMinutes?: boolean): string;
export declare function getColorElapsedString(elapsedMs: number): string;
/**
 * Print a record in columns
 * @param record record to print
 * @param sort true if keys should be sorted
 */
export declare function printRecord(record: Record<string, any>, title?: string, sort?: boolean, minKeyColWidth?: number): void;
export declare function valueToString(value: any): string;
export declare function printRecordAsHtml(record: Record<string, any>, title?: string, sort?: boolean, cellPadding?: number): string;
//# sourceMappingURL=print.d.ts.map