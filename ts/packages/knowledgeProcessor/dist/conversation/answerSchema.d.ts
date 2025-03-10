export type AnswerRelevance = "NoAnswer" | "Answered";
export type AnswerResponse = {
    type: AnswerRelevance;
    answer?: string | undefined;
    whyNoAnswer?: string;
};
//# sourceMappingURL=answerSchema.d.ts.map