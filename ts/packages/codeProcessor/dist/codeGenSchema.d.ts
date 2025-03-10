export type CodeLine = string;
export type CodeComment = string;
export type Code = CodeLine | CodeComment;
export type GeneratedCode = {
    language: string;
    linesOfCode: Code[];
    testCode: Code[];
};
export type GeneratedResponse = {
    type: "generated";
    code: GeneratedCode;
};
export type NotGeneratedResponse = {
    type: "notGenerated";
    reason?: string | undefined;
};
export type CodeGenResponse = GeneratedResponse | NotGeneratedResponse;
//# sourceMappingURL=codeGenSchema.d.ts.map
