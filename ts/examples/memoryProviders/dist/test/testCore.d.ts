/// <reference types="jest" />
import { NormalizedEmbedding } from "typeagent";
import * as knowLib from "knowledge-processor";
export declare function skipTest(name: string): void;
export declare function testIf(name: string, runIf: () => boolean, fn: jest.ProvidesCallback, testTimeout?: number | undefined): void;
export declare function hasEmbeddingEndpoint(endpoint?: string | undefined): boolean;
export declare function createEmbeddingModel(endpoint?: string | undefined, dimensions?: number): import("aiclient").TextEmbeddingModel;
export declare function ensureTestDir(): Promise<string>;
export declare function getRootDataPath(): string;
export declare function testFilePath(fileName: string): string;
export declare function generateTestEmbedding(value: number, length: number): NormalizedEmbedding;
export declare function generateRandomTestEmbedding(length: number): NormalizedEmbedding;
export declare function generateRandomTestEmbeddings(length: number, count: number): Float32Array[];
export declare function composers(offset?: number): knowLib.TextBlock<number>[];
export declare function fruits(): knowLib.TextBlock<number>[];
export declare function uniqueSourceIds(blocks: knowLib.TextBlock[]): number[];
export declare function countSourceIds(blocks: knowLib.TextBlock[]): number;
//# sourceMappingURL=testCore.d.ts.map