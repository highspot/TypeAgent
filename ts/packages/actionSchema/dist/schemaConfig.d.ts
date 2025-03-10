export type ParamSpec = "wildcard" | "checked_wildcard" | "number" | "percentage" | "ordinal" | "time" | "literal";
export type ActionParamSpecs = Record<string, ParamSpec> | false;
export type SchemaConfig = {
    paramSpec?: Record<string, ActionParamSpecs>;
    actionNamespace?: boolean;
};
//# sourceMappingURL=schemaConfig.d.ts.map