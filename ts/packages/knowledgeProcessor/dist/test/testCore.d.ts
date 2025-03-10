/// <reference types="jest" />
import { ChatModel, TextEmbeddingModel } from "aiclient";
import { TextBlock, TextBlockType } from "../src/text.js";
import { SearchTermsActionV2 } from "../src/conversation/knowledgeTermSearchSchema2.js";
export type TestModels = {
    chat: ChatModel;
    answerModel: ChatModel;
    embeddings: TextEmbeddingModel;
};
export declare function testIf(name: string, runIf: () => boolean, fn: jest.ProvidesCallback, testTimeout?: number | undefined): void;
export declare function shouldSkip(): boolean;
export declare function hasTestKeys(): boolean;
export declare function skipTest(name: string): void;
export declare function createTestModels(): TestModels;
export declare function getRootDataPath(): string;
export declare function loadData(filePath: string, blockType?: TextBlockType): Promise<TextBlock<any>[]>;
export type SearchAction = {
    query: string;
    action: SearchTermsActionV2;
};
export declare function loadSearchActionV2(rootPath: string, name: string): Promise<SearchAction>;
//# sourceMappingURL=testCore.d.ts.map