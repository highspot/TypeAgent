import { RequestAction, ParamValueType, ParamFieldType, JSONAction } from "./requestAction.js";
export interface GenericSubPhrase {
    text: string;
}
export declare function validateSubPhraseText(requestAction: RequestAction, subPhrases: GenericSubPhrase[]): string | undefined;
export declare function getActionProperty(actionProps: ParamFieldType | JSONAction | JSONAction[], propertyName: string): ParamFieldType | undefined;
export declare function checkActionPropertyValue(actionProps: ParamFieldType | JSONAction | JSONAction[], propertyName: string, implicit: boolean): ParamValueType;
export declare function checkActionProperty(actionProps: ParamFieldType | JSONAction | JSONAction[], // work on action or action.parameters, based on "paramName" format matches
param: {
    paramName: string;
    paramValue: ParamValueType;
}, implicit: boolean): void;
export declare function ensureProperties(explanationParamNameSet: Set<string>, actionProps: ParamFieldType | JSONAction | JSONAction[]): string[];
//# sourceMappingURL=validateExplanation.d.ts.map