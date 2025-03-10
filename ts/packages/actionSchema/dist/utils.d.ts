import { SchemaType, ActionSchemaTypeDefinition } from "./type.js";
export declare function resolveReference(type?: SchemaType): SchemaType | undefined;
export declare function getParameterType(actionType: ActionSchemaTypeDefinition, name: string): SchemaType | undefined;
export declare function getParameterNames(actionType: ActionSchemaTypeDefinition, getCurrentValue: (name: string) => any): string[];
//# sourceMappingURL=utils.d.ts.map