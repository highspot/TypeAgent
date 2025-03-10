export type RelevantLine = {
    lineNumber: number;
    comment: string;
    relevance: "High" | "Medium" | "Low" | "None";
};
export type CodeAnswer = {
    answerStatus: "Answered" | "PartiallyAnswered" | "NotAnswered";
    answerLines?: RelevantLine[];
};
//# sourceMappingURL=codeAnswerSchema.d.ts.map
