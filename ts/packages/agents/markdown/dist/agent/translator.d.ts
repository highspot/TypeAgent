import { TypeChatJsonTranslator } from "typechat";
import { ChatModelWithStreaming } from "aiclient";
import { MarkdownContent } from "./markdownDocumentSchema.js";
export declare function createMarkdownAgent(model: "GPT_35_TURBO" | "GPT_4" | "GPT-v" | "GPT_4o"): Promise<MarkdownAgent<MarkdownContent>>;
export declare class MarkdownAgent<T extends object> {
    schema: string;
    model: ChatModelWithStreaming;
    translator: TypeChatJsonTranslator<T>;
    constructor(schema: string, schemaName: string, fastModelName: string);
    getMarkdownUpdatePrompts(currentMarkdown: string | undefined, intent: string): {
        type: string;
        text: string;
    }[];
    updateDocument(currentMarkdown: string | undefined, intent: string): Promise<import("typechat").Result<T>>;
}
//# sourceMappingURL=translator.d.ts.map