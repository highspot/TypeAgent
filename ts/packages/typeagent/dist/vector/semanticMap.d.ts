import { TextEmbeddingModel } from "aiclient";
import { EmbeddedValue } from "./vectorIndex";
import { NormalizedEmbedding } from "./embeddings";
import { ScoredItem } from "../memory";
export interface SemanticMap<T> {
    readonly size: number;
    readonly model: TextEmbeddingModel;
    keys(): IterableIterator<EmbeddedValue<string>>;
    values(): IterableIterator<T>;
    entries(): IterableIterator<[EmbeddedValue<string>, T]>;
    has(text: string): boolean;
    get(text: string): T | undefined;
    getNearest(text: string | NormalizedEmbedding): Promise<ScoredItem<T> | undefined>;
    set(text: string, value: T, retryMaxAttempts?: number, retryPauseMs?: number): Promise<void>;
    setMultiple(items: [string, T][], retryMaxAttempts?: number, retryPauseMs?: number, concurrency?: number): Promise<void>;
    nearestNeighbors(value: string | NormalizedEmbedding, maxMatches: number, minScore?: number): Promise<ScoredItem<T>[]>;
}
export declare function createSemanticMap<T = any>(model?: TextEmbeddingModel, existingValues?: [EmbeddedValue<string>, T][]): Promise<SemanticMap<T>>;
export type SemanticMapEntry<T> = {
    key: EmbeddedValue<string>;
    value: T;
};
//# sourceMappingURL=semanticMap.d.ts.map