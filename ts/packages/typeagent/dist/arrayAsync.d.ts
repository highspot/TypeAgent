import { Slice } from "./lib";
export type ProcessAsync<T, TResult> = (item: T, index: number) => Promise<TResult>;
export type ProcessProgress<T, TResult> = (item: T, index: number, result: TResult) => void | boolean;
/**
 * Any async version of map that supports concurrency
 * @param array chunks to process
 * @param concurrency how many to run in parallel
 * @param processor function to process chunks
 * @returns
 */
export declare function mapAsync<T, TResult>(array: T[], concurrency: number, processor: ProcessAsync<T, TResult>, progress?: ProcessProgress<T, TResult>): Promise<TResult[]>;
/**
 * Any async version of map that supports concurrency
 * @param array chunks to process
 * @param concurrency how many to run in parallel
 * @param processor function to process chunks
 * @returns
 */
export declare function forEachAsync<T>(array: T[], concurrency: number, processor: (item: T, index: number) => Promise<void>, progress?: (item: T, index: number) => void | boolean): Promise<void>;
export type ProcessBatch<T, TResult> = (slice: Slice<T>) => Promise<TResult>[];
export type ProgressBatch<T, TResult> = (slice: Slice<T>, results: TResult[]) => void;
export declare function forEachBatch<T = any, TResult = any>(array: T[] | AsyncIterableIterator<T>, sliceSize: number, processor: ProcessBatch<T, TResult>, progress?: ProgressBatch<T, TResult>, maxCount?: number | undefined): Promise<void>;
/**
 * Read items from the given iterable in batches
 * @param source source of items
 * @param batchSize batch size
 * @returns
 */
export declare function readBatches<T = any>(source: AsyncIterableIterator<T> | Array<T>, batchSize: number): AsyncIterableIterator<Slice<T>>;
/**
 * Turn an async iterator into an array
 * @param iter
 * @param maxLength (Optional) Read at most these many items
 * @returns
 */
export declare function toArray(iter: AsyncIterableIterator<any>, maxLength?: number): Promise<any[]>;
//# sourceMappingURL=arrayAsync.d.ts.map