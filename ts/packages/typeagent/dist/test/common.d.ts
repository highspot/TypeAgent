/// <reference types="jest" />
import { Embedding } from "../src/vector/embeddings";
export declare function hasEmbeddingModel(endpoint?: string | undefined): boolean;
export declare function testDirectoryPath(subPath: string): string;
export declare function testIf(runIf: () => boolean, name: string, fn: jest.ProvidesCallback, testTimeout?: number | undefined): void;
export declare function generateRandomEmbedding(length: number): Embedding;
//# sourceMappingURL=common.d.ts.map