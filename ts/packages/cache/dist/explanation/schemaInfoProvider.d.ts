import { ParamSpec } from "action-schema";
import { ExecutableAction, FullAction } from "./requestAction.js";
export type ParamRange = {
    min: string;
    max: string;
    step: string;
    convertToInt?: boolean;
};
export declare function getParamRange(spec: ParamSpec): ParamRange | undefined;
export declare function doCacheAction(action: ExecutableAction, schemaInfoProvider?: SchemaInfoProvider): boolean | undefined;
export declare function getParamSpec(action: FullAction, paramName: string, schemaInfoProvider?: SchemaInfoProvider): ParamSpec | undefined;
export declare function getNamespaceForCache(schemaName: string, actionName: string, schemaInfoProvider?: SchemaInfoProvider): string;
export type SchemaInfoProvider = {
    getActionParamSpec: (schemaName: string, actionName: string, paramName: string) => ParamSpec | undefined;
    getActionCacheEnabled: (schemaName: string, actionName: string) => boolean;
    getActionNamespace: (schemaName: string) => boolean | undefined;
    getActionSchemaFileHash: (schemaName: string) => string;
};
//# sourceMappingURL=schemaInfoProvider.d.ts.map