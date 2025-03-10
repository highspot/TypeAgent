import { AnswerSpecs } from "./makeAnswerSchema.js";
export type QuerySpec = {
    query: string;
    maxHits?: number;
    confidence: number;
};
export type QuerySpecs = {
    summaries?: QuerySpec;
    keywords?: QuerySpec;
    tags?: QuerySpec;
    synonyms?: QuerySpec;
    dependencies?: QuerySpec;
    answer?: AnswerSpecs;
};
//# sourceMappingURL=makeQuerySchema.d.ts.map