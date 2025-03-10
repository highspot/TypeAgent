export interface ClarifyRequestAction {
    actionName: "clarifyRequest";
    parameters: {
        request: string;
        possibleActionName: string[];
        ambiguity: string[];
        clarifyingQuestion: string;
    };
}
//# sourceMappingURL=clarifyActionSchema.d.ts.map
