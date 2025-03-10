import { Entity } from "@typeagent/agent-sdk";
import { CachedImageWithDetails } from "common-utils";
import { PromptSection } from "typechat";
type PromptRole = "user" | "assistant" | "system";
export interface ChatHistoryEntry {
    text: string;
    entities: Entity[];
    role: PromptRole;
    id: string | undefined;
    additionalInstructions?: string[] | undefined;
    attachments?: CachedImageWithDetails[] | undefined;
}
export interface ChatHistory {
    entries: ChatHistoryEntry[];
    getTopKEntities(k: number): Entity[];
    getEntitiesByName(name: string): Entity[] | undefined;
    getEntitiesByType(type: string): Entity[] | undefined;
    addEntry(
        text: string,
        entities: Entity[],
        role: PromptRole,
        id?: string,
        attachments?: CachedImageWithDetails[],
        additionalInstructions?: string[],
    ): void;
    getEntry(id: string): ChatHistoryEntry | undefined;
    getCurrentInstructions(): string[] | undefined;
    getPromptSections(): PromptSection[];
}
export declare function createChatHistory(): ChatHistory;
export {};
//# sourceMappingURL=chatHistory.d.ts.map
