export type GreetingAction = PersonalizedGreetingAction;
export interface PersonalizedGreetingAction {
    actionName: "personalizedGreetingAction";
    parameters: {
        originalRequest: string;
        possibleGreetings: GenericGreeting[];
    };
}
export interface GenericGreeting {
    generatedGreeting: string;
}
//# sourceMappingURL=greetingActionSchema.d.ts.map