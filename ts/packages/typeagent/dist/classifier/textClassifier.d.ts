import { Result, TypeChatLanguageModel, TypeChatJsonTranslator, PromptSection } from "typechat";
export type Class = {
    className: string;
    description: string;
};
export interface ClassificationResponse {
    className: string;
}
export interface TextClassifier<InputType> {
    translator: TypeChatJsonTranslator<ClassificationResponse>;
    classes: Class[];
    classify(query: InputType, context?: PromptSection[]): Promise<Result<ClassificationResponse>>;
    addClass(newClass: Class): Promise<void>;
}
export declare function createTextClassifier<InputType = string>(model: TypeChatLanguageModel, existingClasses?: Class[]): Promise<TextClassifier<InputType>>;
export declare function classify(model: TypeChatLanguageModel, classes: Class[], query: string, context?: PromptSection[]): Promise<Result<string>>;
//# sourceMappingURL=textClassifier.d.ts.map