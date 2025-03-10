import { ActionSchemaEntryTypeDefinition, ActionSchemaGroup, SchemaTypeDefinition } from "./type.js";
export declare function wrapTypeWithJsonSchema(type: ActionSchemaEntryTypeDefinition): SchemaTypeDefinition;
type JsonSchemaObject = {
    type: "object";
    description?: string;
    properties: Record<string, JsonSchema>;
    required: string[];
    additionalProperties: false;
};
type JsonSchemaArray = {
    type: "array";
    description?: string;
    items: JsonSchema;
};
type JsonSchemaString = {
    type: "string";
    description?: string;
    enum?: string[];
};
type JsonSchemaNumber = {
    type: "number";
    description?: string;
};
type JsonSchemaBoolean = {
    type: "boolean";
    description?: string;
};
type JsonSchemaNull = {
    type: "null";
    description?: string;
};
type JsonSchemaUnion = {
    anyOf: JsonSchema[];
    description?: string;
};
type JsonSchemaReference = {
    $ref: string;
    description?: string;
};
export type ActionObjectJsonSchema = {
    name: string;
    description?: string;
    strict: true;
    schema: JsonSchemaRoot;
};
type JsonSchemaRoot = JsonSchema & {
    $defs?: Record<string, JsonSchema>;
};
type JsonSchema = JsonSchemaObject | JsonSchemaArray | JsonSchemaString | JsonSchemaNumber | JsonSchemaBoolean | JsonSchemaNull | JsonSchemaUnion | JsonSchemaReference;
export declare function generateActionJsonSchema(actionSchemaGroup: ActionSchemaGroup): ActionObjectJsonSchema;
export type ActionFunctionJsonSchema = {
    type: "function";
    function: {
        name: string;
        description?: string;
        parameters?: JsonSchemaRoot;
        strict: true;
    };
};
export declare function generateActionActionFunctionJsonSchemas(actionSchemaGroup: ActionSchemaGroup, strict?: boolean): ActionFunctionJsonSchema[];
export {};
//# sourceMappingURL=jsonSchemaGenerator.d.ts.map