import { SchemaTypeDefinition, ActionSchemaGroup } from "./type.js";
export type GenerateSchemaOptions = {
    strict?: boolean;
    exact?: boolean;
    jsonSchema?: boolean;
    jsonSchemaFunction?: boolean;
    jsonSchemaWithTs?: boolean;
    jsonSchemaValidate?: boolean;
};
export declare function generateSchemaTypeDefinition(definition: SchemaTypeDefinition, options?: GenerateSchemaOptions, order?: Map<string, number>): string;
export declare function generateActionSchema(actionSchemaGroup: ActionSchemaGroup, options?: GenerateSchemaOptions): string;
//# sourceMappingURL=generator.d.ts.map