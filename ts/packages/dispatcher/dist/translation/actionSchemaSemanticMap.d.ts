import { ActionSchemaFile, ActionSchemaTypeDefinition } from "action-schema";
import { ActionConfig } from "./actionConfig.js";
import { NormalizedEmbedding, ScoredItem } from "typeagent";
import { TextEmbeddingModel } from "aiclient";
type Entry = {
    embedding: NormalizedEmbedding;
    actionSchemaFile: ActionSchemaFile;
    definition: ActionSchemaTypeDefinition;
};
export type EmbeddingCache = Map<string, NormalizedEmbedding>;
export declare class ActionSchemaSemanticMap {
    private readonly actionSemanticMaps;
    private readonly model;
    constructor(model?: TextEmbeddingModel);
    addActionSchemaFile(config: ActionConfig, actionSchemaFile: ActionSchemaFile, cache?: EmbeddingCache): Promise<void>;
    removeActionSchemaFile(schemaName: string): void;
    nearestNeighbors(request: string, maxMatches: number, filter: (schemaName: string) => boolean, minScore?: number): Promise<ScoredItem<Entry>[]>;
    embeddings(): [string, NormalizedEmbedding][];
}
export declare function writeEmbeddingCache(fileName: string, embeddings: [string, NormalizedEmbedding][]): Promise<void>;
export declare function readEmbeddingCache(fileName: string): Promise<EmbeddingCache>;
export {};
//# sourceMappingURL=actionSchemaSemanticMap.d.ts.map