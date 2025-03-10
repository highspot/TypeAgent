import { ActionSchemaFile, SchemaTypeDefinition } from "./type.js";
export type ActionSchemaFileJSON = {
    schemaName: string;
    sourceHash: string;
    entry: string;
    types: Record<string, SchemaTypeDefinition>;
    actionNamespace?: boolean;
    order?: Record<string, number>;
};
/**
 * Convert a ActionSchemaFile to a JSON-able object
 * Data in the original ActionSchemaFile will not be modified.
 *
 * @param actionSchemaFile ActionSchemaFile to convert
 * @returns
 */
export declare function toJSONActionSchemaFile(actionSchemaFile: ActionSchemaFile): ActionSchemaFileJSON;
/**
 * Convert a ActionSchemaFileJSON back to a ActionSchemaFile
 * Data in the JSON will be modified.
 * Clone the data before passing into this function if you want to keep the original.
 *
 * @param json JSON data to convert
 * @returns
 */
export declare function fromJSONActionSchemaFile(json: ActionSchemaFileJSON): ActionSchemaFile;
//# sourceMappingURL=serialize.d.ts.map