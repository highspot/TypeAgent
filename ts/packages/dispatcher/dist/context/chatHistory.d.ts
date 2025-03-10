import { Entity } from "@typeagent/agent-sdk";
import { CachedImageWithDetails } from "common-utils";
import { PromptSection } from "typechat";
import { RequestId } from "./interactiveIO.js";
import { PromptEntity } from "agent-cache";
type UserEntry = {
    role: "user";
    text: string;
    id?: RequestId;
    attachments?: CachedImageWithDetails[] | undefined;
};
type AssistantEntry = {
    role: "assistant";
    text: string;
    id?: RequestId;
    sourceAppAgentName: string;
    entities?: Entity[] | undefined;
    additionalInstructions?: string[] | undefined;
};
export type ChatHistoryEntry = UserEntry | AssistantEntry;
export interface ChatHistory {
    entries: ChatHistoryEntry[];
    enable(value: boolean): void;
    getTopKEntities(k: number): PromptEntity[];
    addUserEntry(text: string, id: string | undefined, attachments?: CachedImageWithDetails[]): void;
    addAssistantEntry(text: string, id: string | undefined, sourceAppAgentName: string, entities?: Entity[], additionalInstructions?: string[]): void;
    getCurrentInstructions(): string[] | undefined;
    getPromptSections(): PromptSection[];
}
export declare function createChatHistory(init: boolean): ChatHistory;
export {};
//# sourceMappingURL=chatHistory.d.ts.map