import { PromptSection, TypeChatJsonTranslator } from "typechat";
type CorrectionRecord = {
    data: any;
    correction: ValidationError;
};
type TypeChatAgentSuccess<ResultType> = {
    success: true;
    data: ResultType;
    corrections?: CorrectionRecord[];
};
type TypeChatAgentError = {
    success: false;
    message: string;
    corrections?: CorrectionRecord[];
};
export type TypeChatAgentResult<T extends object = object> = TypeChatAgentSuccess<T> | TypeChatAgentError;
export type ValidationError = string | string[];
export type TypeChatAgentValidator<InputType, ResultType extends object, ConfigType> = (input: InputType, result: ResultType, config?: ConfigType) => ValidationError | undefined;
export interface GenericTypeChatAgent<InputType, ResultType extends object, ConfigType> {
    run(input: InputType, config?: ConfigType): Promise<TypeChatAgentResult<ResultType>>;
    validate?: TypeChatAgentValidator<InputType, ResultType, ConfigType> | undefined;
    correct?(input: InputType, result: ResultType, correction: ValidationError): Promise<TypeChatAgentResult<ResultType>>;
}
export declare class TypeChatAgent<InputType, ResultType extends object, ConfigType> implements GenericTypeChatAgent<InputType, ResultType, ConfigType> {
    private readonly resultName;
    private readonly createTranslator;
    private readonly createPromptPreamble;
    private readonly createRequest;
    readonly validate?: TypeChatAgentValidator<InputType, ResultType, ConfigType> | undefined;
    private readonly correctionAttempt;
    private static readonly defaultCorrectionAttempt;
    constructor(resultName: string, createTranslator: () => TypeChatJsonTranslator<ResultType>, createPromptPreamble: (input: InputType) => string | PromptSection[], createRequest: (input: InputType) => string, validate?: TypeChatAgentValidator<InputType, ResultType, ConfigType> | undefined, correctionAttempt?: number);
    private _translator;
    private get translator();
    run(input: InputType, config?: ConfigType): Promise<TypeChatAgentResult<ResultType>>;
    private createCorrectionPrompt;
    private toPromptSections;
    followUp(request: string, result: ResultType, followUpPrompt: string | PromptSection[], promptPreamble?: string | PromptSection[]): Promise<import("typechat").Error | import("typechat").Success<ResultType>>;
    stripNulls(obj: any): void;
    completeAndValidate(prompt: PromptSection[]): Promise<import("typechat").Error | import("typechat").Success<ResultType>>;
    correct(input: InputType, result: ResultType, correction: ValidationError, promptPreamble?: string | PromptSection[]): Promise<import("typechat").Error | import("typechat").Success<ResultType>>;
}
export declare class SequentialTypeChatAgents<InputType, IntermediateType extends object, ResultType extends object, ConfigType> implements GenericTypeChatAgent<InputType, [
    IntermediateType,
    ResultType
], ConfigType> {
    private readonly agent1;
    private readonly agent2;
    constructor(agent1: TypeChatAgent<InputType, IntermediateType, ConfigType>, agent2: TypeChatAgent<[
        InputType,
        IntermediateType
    ], ResultType, ConfigType>);
    run(input: InputType, config?: ConfigType): Promise<TypeChatAgentResult<[IntermediateType, ResultType]>>;
    validate(input: InputType, result: [IntermediateType, ResultType], config?: ConfigType): ValidationError | undefined;
}
export {};
//# sourceMappingURL=typeChatAgent.d.ts.map