import { ScoredItem } from "../memory";
import { Embedding, SimilarityType } from "../vector/embeddings";
import { Path } from "../objStream";
import { FileSystem, ObjectFolder, ObjectFolderSettings } from "./objectFolder";
import { VectorIndex } from "../vector/vectorIndex";
/**
 * EmbeddingFolder stores embeddings in folder, one per file.
 * The name of the file is the key associated with the embedding.
 * Nearest neighbor matches return the names of the matching files.
 */
export interface EmbeddingFolder extends ObjectFolder<Embedding>, VectorIndex<string> {
    nearestNeighborsInSubset(embedding: Embedding, subsetIds: string[], maxMatches: number, similarity: SimilarityType, minScore?: number): Promise<ScoredItem<string>[]>;
}
export declare function createEmbeddingFolder(folderPath: Path, folderSettings?: ObjectFolderSettings, concurrency?: number, fSys?: FileSystem): Promise<EmbeddingFolder>;
//# sourceMappingURL=embeddingFS.d.ts.map