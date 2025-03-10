import { TypeSchema, VariationType } from "typeagent";
import { TypeChatLanguageModel } from "typechat";
/**
 * Generate phrases that could target the given action schema
 * @param type
 * @param model
 * @param actionSchema
 * @param actionDescription
 * @param count
 * @param facets
 * @returns
 */
export declare function generateActionPhrases(type: VariationType | string, model: TypeChatLanguageModel, actionSchema: TypeSchema, actionDescription: string | undefined, count: number, facets?: string, example?: string, language?: string): Promise<string[]>;
/**
 * Generate
 * @param model
 * @param seedPhrase
 * @param count
 * @param facets
 * @param language
 * @returns
 */
export declare function generateOutputTemplate(model: TypeChatLanguageModel, seedPhrase: string, count: number, facets?: string, language?: string): Promise<string[]>;
//# sourceMappingURL=variationGenerator.d.ts.map