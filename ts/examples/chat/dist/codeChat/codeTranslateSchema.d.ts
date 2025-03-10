export type TranslationResponse = Translation | NoResponse;
export type Translation = {
    responseType: "translate";
    translation: string;
    params?: Parameter[];
    returnValue?: ReturnValue;
};
export type Parameter = {
    name: string;
    description: string;
};
export type ReturnValue = {
    description: string;
};
export type NoResponse = {
    responseType: "noResponse";
    reason: string;
};
//# sourceMappingURL=codeTranslateSchema.d.ts.map