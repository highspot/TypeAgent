export type Timestamped<T = any> = {
    timestamp: Date;
    value: T;
};
export type DateRange = {
    startDate: Date;
    stopDate?: Date | undefined;
};
export declare function stringifyTimestamped(value: any, timestamp?: Date): string;
export declare function parseTimestamped<T = any>(json: string): Timestamped<T>;
export declare function timestampString(date: Date, sep?: boolean): string;
export declare function timestampStringUtc(date: Date, sep?: boolean): string;
export type TimestampRange = {
    startTimestamp: string;
    endTimestamp?: string | undefined;
};
export declare function timestampRange(startAt: Date, stopAt?: Date): TimestampRange;
export declare function generateRandomDates(startDate: Date, minMsOffset: number, maxMsOffset: number): IterableIterator<Date>;
export declare function stringToDate(value: string | undefined): Date | undefined;
export declare function addMinutesToDate(date: Date, minutes: number): Date;
//# sourceMappingURL=dateTime.d.ts.map