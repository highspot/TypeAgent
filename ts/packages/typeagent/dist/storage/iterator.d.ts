export interface ChunkedIterator<T = any> {
    next(): IteratorResult<T>;
    loadNext(): Promise<boolean>;
}
export declare function createChunkedIterator<T = any>(loader: () => Promise<Iterator<T> | Array<T>>): ChunkedIterator<T>;
//# sourceMappingURL=iterator.d.ts.map