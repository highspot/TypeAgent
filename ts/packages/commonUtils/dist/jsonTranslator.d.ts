import { PromptSection, Result, TypeChatJsonTranslator, TypeChatJsonValidator } from "typechat";
import { TypeChatConstraintsValidator } from "./constraints.js";
import { CompleteUsageStatsCallback, CompletionJsonSchema } from "aiclient";
import { IncrementalJsonValueCallBack } from "./incrementalJsonParser.js";
import { CachedImageWithDetails } from "./image.js";
export type InlineTranslatorSchemaDef = {
    kind: "inline";
    typeName: string;
    schema: string;
};
export type TranslatorSchemaDef = {
    kind: "file";
    typeName: string;
    fileName: string;
} | {
    kind: "inline";
    typeName: string;
    schema: string;
};
export declare function composeTranslatorSchemas(typeName: string, schemaDefs: TranslatorSchemaDef[]): string;
export interface TypeChatJsonTranslatorWithStreaming<T extends object> extends TypeChatJsonTranslator<T> {
    translate: (request: string, promptPreamble?: string | PromptSection[], attachments?: CachedImageWithDetails[] | undefined, cb?: IncrementalJsonValueCallBack, usageCallback?: CompleteUsageStatsCallback) => Promise<Result<T>>;
}
export declare function enableJsonTranslatorStreaming<T extends object>(translator: TypeChatJsonTranslator<T>): TypeChatJsonTranslatorWithStreaming<T>;
export type JsonTranslatorOptions<T extends object> = {
    constraintsValidator?: TypeChatConstraintsValidator<T> | undefined;
    instructions?: PromptSection[] | undefined;
    model?: string | undefined;
};
/**
 *
 * @param schemas pass either a single schema text OR schema definitions to compose.
 * @param typeName a single type name to be translated to.
 * @param constraintsValidator optionally validate constraints on response
 * @param instructions Optional additional instructions
 * @param model optional, custom model impl.
 * @returns
 */
export declare function createJsonTranslatorFromSchemaDef<T extends object>(typeName: string, schemas: string | TranslatorSchemaDef[], options?: JsonTranslatorOptions<T>): TypeChatJsonTranslator<T>;
export interface TypeAgentJsonValidator<T extends object> extends TypeChatJsonValidator<T> {
    getSchemaText(): string;
    getTypeName(): string;
    validate(jsonObject: object): Result<T>;
    getJsonSchema?: () => CompletionJsonSchema | undefined;
}
export declare function createJsonTranslatorWithValidator<T extends object>(name: string, validator: TypeAgentJsonValidator<T>, options?: JsonTranslatorOptions<T>): TypeChatJsonTranslator<T>;
/**
 * load schema from schema file. If multiple files provided, concatenate them
 * @param schemaFiles a single or multiple file paths
 */
export declare function getTranslationSchemaText(schemaFiles: string | string[]): string;
/**
 *
 * @param schemaFiles pass either a single file OR an array of files that are concatenated
 * @param typeName
 * @param constraintsValidator optionally validate constraints on response
 * @param instructions Optional additional instructions
 * @param model optional, custom model impl.
 * @returns
 */
export declare function createJsonTranslatorFromFile<T extends object>(typeName: string, schemaFiles: string | string[], options?: JsonTranslatorOptions<T>): TypeChatJsonTranslator<T>;
export declare function readSchemaFile(schemaFile: string): string;
//# sourceMappingURL=jsonTranslator.d.ts.map