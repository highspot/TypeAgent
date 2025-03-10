export type ClarifyRequestAction = ClarifyMultiplePossibleActionName | ClarifyMissingParameter | ClarifyUnresolvedReference;
export interface ClarifyMultiplePossibleActionName {
    actionName: "clarifyMultiplePossibleActionName";
    parameters: {
        request: string;
        possibleActionNames: string[];
        clarifyingQuestion: string;
    };
}
export interface ClarifyMissingParameter {
    actionName: "clarifyMissingParameter";
    parameters: {
        request: string;
        actionName: string;
        parameterName: string;
        clarifyingQuestion: string;
    };
}
export interface ClarifyUnresolvedReference {
    actionName: "clarifyUnresolvedReference";
    parameters: {
        request: string;
        actionName: string;
        parameterName: string;
        reference: string;
        clarifyingQuestion: string;
    };
}
//# sourceMappingURL=clarifyActionSchema.d.ts.map