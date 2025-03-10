import { SchemaType, ActionSchemaTypeDefinition } from "./type.js";
export declare function validateSchema(name: string, expected: SchemaType, actual: unknown, coerce?: boolean): number | boolean | undefined;
export declare function validateAction(actionSchema: ActionSchemaTypeDefinition, action: any, coerce?: boolean): void;
export declare function validateType(type: SchemaType, value: any): void;
//# sourceMappingURL=validate.d.ts.map