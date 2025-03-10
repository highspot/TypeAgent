import { HistoryContext } from "agent-cache";
import { CachedImageWithDetails } from "common-utils";
import { TypeChatJsonTranslator } from "typechat";
export declare function createTypeAgentRequestPrompt(
    translator: TypeChatJsonTranslator<object>,
    request: string,
    history: HistoryContext | undefined,
    attachments: CachedImageWithDetails[] | undefined,
): string;
//# sourceMappingURL=chatHistoryPrompt.d.ts.map
