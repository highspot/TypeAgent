import { PromptSection } from "typechat";
import { AppAction, TypeAgentAction, Entity } from "@typeagent/agent-sdk";
export type PromptEntity = Entity & {
    sourceAppAgentName: string;
};
export type HistoryContext = {
    promptSections: PromptSection[];
    entities: PromptEntity[];
    additionalInstructions?: string[] | undefined;
};
export declare function normalizeParamString(str: string): string;
export declare function normalizeParamValue(value: ParamValueType): string | number | boolean;
export declare function equalNormalizedParamValue(a: ParamValueType, b: ParamValueType): boolean;
export declare function equalNormalizedParamObject(a?: ParamObjectType, b?: ParamObjectType): boolean;
export type ParamValueType = string | number | boolean;
export type ParamFieldType = ParamValueType | ParamObjectType | string[] | number[] | boolean[] | ParamObjectType[];
export type ParamObjectType = {
    [key: string]: ParamFieldType;
};
export interface FullAction extends AppAction {
    translatorName: string;
    parameters?: ParamObjectType;
}
export interface JSONAction {
    fullActionName: string;
    parameters?: ParamObjectType;
    resultEntityId?: string;
}
export interface ExecutableAction {
    action: TypeAgentAction<FullAction>;
    resultEntityId?: string;
}
export declare function createExecutableAction(translatorName: string, actionName: string, parameters?: ParamObjectType, resultEntityId?: string): ExecutableAction;
export declare function getFullActionName(action: ExecutableAction): string;
export declare function fromJsonActions(actions: JSONAction | JSONAction[]): ExecutableAction[];
export declare function toJsonActions(actions: ExecutableAction[]): JSONAction | JSONAction[];
export declare function toExecutableActions(actions: FullAction[]): ExecutableAction[];
export declare function toFullActions(actions: ExecutableAction[]): FullAction[];
export declare function getTranslationNamesForActions(actions: ExecutableAction[]): string[];
export declare class RequestAction {
    readonly request: string;
    readonly actions: ExecutableAction[];
    readonly history?: HistoryContext | undefined;
    static readonly Separator = " => ";
    constructor(request: string, actions: ExecutableAction[], history?: HistoryContext | undefined);
    toString(): string;
    toPromptString(): string;
    static fromString(input: string): RequestAction;
    static create(request: string, actions: ExecutableAction | ExecutableAction[], history?: HistoryContext): RequestAction;
}
//# sourceMappingURL=requestAction.d.ts.map