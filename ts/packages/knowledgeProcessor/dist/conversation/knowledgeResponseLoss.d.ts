import { TextEmbeddingModel } from "aiclient";
import { KnowledgeResponse } from "./knowledgeSchema.js";
export declare function createLocalSemanticMap<T>(_model: TextEmbeddingModel): Promise<{
    setMultiple(items: [string, T][]): void;
    getNearest: (key: string) => Promise<{
        item: NonNullable<T>;
        score: number;
    } | undefined>;
}>;
interface IGatheredTerms {
    terms: string[];
    structureTerms: string[];
}
export declare function gatherTerms(knowledge: KnowledgeResponse): IGatheredTerms;
export declare function knowledgeResponseLoss(refResponse: KnowledgeResponse, generatedResponse: KnowledgeResponse, model: TextEmbeddingModel): Promise<number>;
export declare function simpleKnowledgeResponseLoss(refResponse: KnowledgeResponse, generatedResponse: KnowledgeResponse, model: TextEmbeddingModel): Promise<number>;
export {};
//# sourceMappingURL=knowledgeResponseLoss.d.ts.map