import { SchemaTypeDefinition, ActionSchemaFile } from "./type.js";
import { SchemaConfig } from "./schemaConfig.js";
export declare function createActionSchemaFile(schemaName: string, sourceHash: string, entry: SchemaTypeDefinition, order: Map<string, number> | undefined, strict: boolean, schemaConfig?: SchemaConfig): ActionSchemaFile;
export declare function parseActionSchemaSource(source: string, schemaName: string, sourceHash: string, typeName: string, fileName?: string, schemaConfig?: SchemaConfig, strict?: boolean): ActionSchemaFile;
//# sourceMappingURL=parser.d.ts.map