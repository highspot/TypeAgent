/// <reference types="node" resolution-mode="require"/>
import { NormalizedEmbedding } from "typeagent";
import { TextEmbeddingModel } from "aiclient";
import { Scored } from "./common.js";
import { IndexingEventHandlers } from "./interfaces.js";
export declare class TextEmbeddingIndex {
    settings: TextEmbeddingIndexSettings;
    private embeddings;
    constructor(settings: TextEmbeddingIndexSettings);
    get size(): number;
    addText(texts: string | string[]): Promise<void>;
    addTextBatch(textToIndex: string[], eventHandler?: IndexingEventHandlers): Promise<void>;
    get(pos: number): NormalizedEmbedding;
    add(embedding: NormalizedEmbedding): void;
    getIndexesOfNearest(text: string | NormalizedEmbedding, maxMatches?: number, minScore?: number): Promise<Scored[]>;
    getIndexesOfNearestMultiple(textArray: string[], maxMatches?: number, minScore?: number): Promise<Scored[][]>;
    removeAt(pos: number): void;
    clear(): void;
    serialize(): Float32Array[];
    deserialize(embeddings: Float32Array[]): void;
    private indexesOfNearestText;
}
export declare function serializeEmbedding(embedding: NormalizedEmbedding): number[];
export declare function deserializeEmbedding(array: number[]): NormalizedEmbedding;
export type TextEmbeddingIndexSettings = {
    embeddingModel: TextEmbeddingModel;
    embeddingSize: number;
    minScore: number;
    maxMatches?: number | undefined;
    retryMaxAttempts?: number;
    retryPauseMs?: number;
    batchSize: number;
};
export declare function createTextEmbeddingIndexSettings(minScore?: number): TextEmbeddingIndexSettings;
export declare class TextEditDistanceIndex {
    textArray: string[];
    constructor(textArray?: string[]);
    getNearest(text: string, maxMatches?: number, maxEditDistance?: number): Promise<Scored<string>[]>;
    getNearestMultiple(textArray: string[], maxMatches?: number, maxEditDistance?: number): Promise<Scored<string>[][]>;
}
export declare function nearestNeighborEditDistance(textList: string[] | IterableIterator<string>, other: string, maxMatches?: number, maxEditDistance?: number): Scored<string>[];
export declare function serializeEmbeddings(embeddings: NormalizedEmbedding[]): Buffer;
export declare function deserializeEmbeddings(buffer: Buffer, embeddingSize: number): NormalizedEmbedding[];
//# sourceMappingURL=fuzzyIndex.d.ts.map