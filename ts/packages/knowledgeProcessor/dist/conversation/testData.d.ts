import { AnswerResponse } from "./answerSchema.js";
import { ConversationManager } from "./conversationManager.js";
import { TextEmbeddingModel } from "aiclient";
export type QueryAnswer = {
    query: string;
    answer?: AnswerResponse | undefined;
};
export type BatchProgress = (item: string, index: number, total: number, result: QueryAnswer) => void | boolean;
export declare function searchBatchFile(cm: ConversationManager, filePath: string, destPath: string | undefined, concurrency: number, progress?: BatchProgress): Promise<void>;
export declare function searchBatch(cm: ConversationManager, queries: string[], concurrency: number, progress?: BatchProgress): Promise<QueryAnswer[]>;
export type QueryAnswerCompare = {
    baseLine: QueryAnswer;
    answer?: AnswerResponse | undefined;
    similarity: number;
};
export declare function compareQueryBatchFile(cm: ConversationManager, model: TextEmbeddingModel, filePath: string, concurrency: number, progress?: BatchProgress): Promise<QueryAnswerCompare[]>;
export declare function compareQueryBatch(model: TextEmbeddingModel, baseLine: QueryAnswer[], results: QueryAnswer[], concurrency: number, progress?: BatchProgress): Promise<QueryAnswerCompare[]>;
export declare function compareAnswers(model: TextEmbeddingModel, baseLine: AnswerResponse | undefined, answer: AnswerResponse | undefined): Promise<number>;
//# sourceMappingURL=testData.d.ts.map