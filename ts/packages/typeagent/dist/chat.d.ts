import { TypeChatLanguageModel, TypeChatJsonTranslator, PromptSection } from "typechat";
import { ChatHistory } from "./prompt";
/**
 * Simplest possible TypeChat with RAG.
 * Automatically includes history and instructions as context for translations
 * @param model
 * @param schema Schema of chat messages
 * @param typeName type of chat messages
 * @param instructions Chat instructions
 * @param history Chat history just an array of prompt sections. You supply the array, and you load/save/trim it appropriately
 * @param maxPromptLength maximum length of context in chars: chat history + instructions + schema
 * @param maxWindowLength (Optional) maximum number of past chat turns (user and assistant) - window - to include.
 * @param stringify Customize how T is translated to a string for pushing into memory
 */
export declare function createTypeChat<T extends object>(model: TypeChatLanguageModel, schema: string, typeName: string, instructions: string | string[], history: PromptSection[] | ChatHistory, maxPromptLength: number, maxWindowLength?: number, stringify?: (value: T) => string): TypeChatJsonTranslator<T>;
/**
 * Create a JSON translator designed to work for Chat
 * @param model language model to use
 * @param schema schema for the chat response
 * @param typeName typename of the chat response
 * @returns
 */
export declare function createChatTranslator<T extends object>(model: TypeChatLanguageModel, schema: string, typeName: string): TypeChatJsonTranslator<T>;
/**
 * Create a Json translator
 * @param model language model to use
 * @param schemaPaths schema files to use
 * @param baseUrl base Url from where to load schema files
 * @param typeName type name of the model response
 * @param createRequestPrompt (optional) customize the prompt
 * @returns
 */
export declare function createTranslator<T extends object>(model: TypeChatLanguageModel, schemaPaths: string[], baseUrl: string, typeName: string, createRequestPrompt?: ((request: string, schema: string, typeName: string) => string) | undefined): TypeChatJsonTranslator<T>;
export interface ChatUserInterface {
    showMessage(message: string): Promise<void>;
    askYesNo(message: string): Promise<boolean>;
    getInput(message: string): Promise<string | undefined>;
}
//# sourceMappingURL=chat.d.ts.map