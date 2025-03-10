import { TypeChatLanguageModel, TypeChatJsonTranslator } from "typechat";
/**
 * Create a JSON translator designed to work for Chat
 * @param model language model to use
 * @param schema schema for the chat response
 * @param typeName typename of the chat response
 * @param preamble text to prepend to the prompt
 * @returns
 */
export declare function createChatTranslator<T extends object>(model: TypeChatLanguageModel, schema: string, typeName: string, preamble?: string): TypeChatJsonTranslator<T>;
export declare function refineTest(testoutfile: string): void;
export declare function createTabSeparatedOuput(testoutfile: string): void;
export declare function runTest(): Promise<void>;
//# sourceMappingURL=main.d.ts.map