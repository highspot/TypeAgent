/// <reference types="node" resolution-mode="require"/>
import { FileSystem, NameValue, ObjectFolder, ObjectFolderSettings, dateTime } from "typeagent";
type DateRange = dateTime.DateRange;
export type TemporalLogSettings = {
    concurrency: number;
};
/**
 * A mutable log of timestamped items
 * @template TId the type of the log entry Id
 * @template T type of object stored in the log
 */
export interface TemporalLog<TId = any, T = any> {
    size(): Promise<number>;
    all(): AsyncIterableIterator<NameValue<dateTime.Timestamped<T>, TId>>;
    allObjects(): AsyncIterableIterator<dateTime.Timestamped<T>>;
    get(id: TId): Promise<dateTime.Timestamped<T> | undefined>;
    getMultiple(ids: TId[]): Promise<(dateTime.Timestamped<T> | undefined)[]>;
    /**
     * Return the ids of the log entries in the given date range
     * @param startAt
     * @param stopAt
     */
    getIdsInRange(startAt: Date, stopAt?: Date): Promise<TId[]>;
    /**
     * Return the log entries in the given date range
     * @param startAt
     * @param stopAt
     */
    getEntriesInRange(startAt: Date, stopAt?: Date): Promise<dateTime.Timestamped<T>[]>;
    put(value: T, timestamp?: Date): Promise<TId>;
    newestObjects(): AsyncIterableIterator<dateTime.Timestamped<T>>;
    getNewest(count: number): Promise<dateTime.Timestamped<T>[]>;
    getOldest(count: number): Promise<dateTime.Timestamped<T>[]>;
    getTimeRange(): Promise<DateRange | undefined>;
    remove(id: TId): Promise<void>;
    removeInRange(startAt: Date, stopAt: Date): Promise<void>;
    clear(): Promise<void>;
    getUrl?: (id: TId) => URL;
}
/**
 * Create a temporal log using files
 * @param settings
 * @param folderPath
 * @param folderSettings
 * @param fSys
 * @returns
 */
export declare function createTemporalLog<T>(settings: TemporalLogSettings, folderPath: string, folderSettings?: ObjectFolderSettings, fSys?: FileSystem): Promise<TemporalLog<string, T>>;
/**
 * Put an object with an associated timestamp into the given object store
 * @param store
 * @param value
 * @param timestamp
 * @returns
 */
export declare function putTimestampedObject(store: ObjectFolder<string>, value: any, timestamp?: Date): Promise<string>;
/**
 * Get the timestamped object with the given Id from the object folder
 * @param store
 * @param id
 * @returns
 */
export declare function getTimestampedObject<T>(store: ObjectFolder<string>, id: string): Promise<dateTime.Timestamped<T> | undefined>;
export declare function itemsFromTemporalSequence<T>(sequence: Iterable<dateTime.Timestamped<T[]>> | undefined): T[] | undefined;
export declare function filterTemporalSequence<T>(sequence: Iterable<dateTime.Timestamped<T[]>>, requiredValues: T[]): dateTime.Timestamped<T[]>[];
export declare function getRangeOfTemporalSequence(sequence: dateTime.Timestamped[] | undefined): dateTime.DateRange | undefined;
/**
 * A window of recent items
 */
export interface RecentItems<T> {
    /**
     * Returns all recent entries, ordered by most recent first
     */
    getEntries(): T[];
    push(items: T | T[]): void;
    getContext(maxContextLength: number): string[];
    getUnique(): T[];
    reset(): void;
}
/**
 * Create a 'window' to track the most recent items in a "stream"
 * Uses a circular array
 * @param windowSize
 * @param stringify
 * @returns
 */
export declare function createRecentItemsWindow<T>(windowSize: number, stringify?: (value: T) => string): RecentItems<T>;
export {};
//# sourceMappingURL=temporal.d.ts.map