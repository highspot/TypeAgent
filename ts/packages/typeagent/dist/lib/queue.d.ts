/**
 * Classic Queue
 */
export interface Queue<T> {
    readonly length: number;
    entries(): IterableIterator<T>;
    enqueue(item: T): void;
    dequeue(): T | undefined;
}
/**
 * Creates a simple linked list based queue
 * @returns
 */
export declare function createQueue<T>(): Queue<T>;
export interface TaskQueue<T = any> {
    length(): number;
    push(item: T): boolean;
    drain(): Promise<void>;
}
export declare function createTaskQueue<T = any>(worker: (item: T) => Promise<void>, maxLength: number, concurrency?: number): TaskQueue<T>;
//# sourceMappingURL=queue.d.ts.map