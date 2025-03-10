export type Vector = number[] | Float32Array;
/**
 * Vanilla dot product, implemented as a simple loop
 * @param x
 * @param y
 * @returns
 */
export declare function dotProductSimple(x: Vector, y: Vector): number;
/**
 * Return the dot product of two vectors
 * @param x
 * @param y
 * @returns
 */
export declare function dotProduct(x: Vector, y: Vector): number;
export declare function euclideanLength(x: Vector): number;
export declare function normalizeInPlace(v: Vector): void;
/**
 * Extremely vanilla implementation.
 * When possible, use Normalized Embeddings and dotProduct.
 * Use cosineSimilarityLoop for loops
 * @param x
 * @param y
 * @returns
 */
export declare function cosineSimilarity(x: Vector, y: Vector): number;
/**
 * A faster unrolled version of cosine similarity designed to run in a loop
 * When possible, use NormalizedEmbeddings and Dot products instead.
 * To normalize your embedding, call createNormalized(...)
 * @param x
 * @param other
 * @param otherLen Magnitude of other
 * @returns
 */
export declare function cosineSimilarityLoop(x: Vector, other: Vector, otherLen: number): number;
export declare function createMatrix(rowCount: number, colCount: number): number[][];
//# sourceMappingURL=vector.d.ts.map