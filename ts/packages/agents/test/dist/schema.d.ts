export type TestActions = AddAction | RandomNumberAction;
type AddAction = {
    actionName: "add";
    parameters: {
        a: number;
        b: number;
    };
};
type RandomNumberAction = {
    actionName: "random";
};
export {};
//# sourceMappingURL=schema.d.ts.map