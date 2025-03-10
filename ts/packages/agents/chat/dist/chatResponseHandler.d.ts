import { ChatResponseAction, Entity } from "./chatResponseActionSchema.js";
import { ChunkChatResponse, LookupOptions } from "typeagent";
import { ChatModel } from "aiclient";
import { PromptSection } from "typechat";
import { ActionContext, AppAgent, ActionResult, TypeAgentAction } from "@typeagent/agent-sdk";
export declare function instantiate(): AppAgent;
export declare function executeChatResponseAction(chatAction: TypeAgentAction<ChatResponseAction>, context: ActionContext): Promise<ActionResult>;
export declare function logEntities(label: string, entities?: Entity[]): void;
export type LookupContext = {
    lookups: string[];
    answers: Map<string, ChunkChatResponse>;
    inProgress: Map<string, LookupProgress>;
};
type LookupProgress = {
    url: string;
    counter: number;
    answerSoFar?: ChunkChatResponse | undefined;
};
export type LookupSettings = {
    fastMode: boolean;
    answerGenModel: ChatModel;
    entityGenModel?: ChatModel;
    maxSearchResults: number;
    maxEntityTextLength: number;
    lookupOptions: LookupOptions;
};
export declare function handleLookup(lookups: string[] | undefined, context: ActionContext, settings: LookupSettings): Promise<ActionResult>;
export declare function getLookupSettings(fastMode?: boolean): Promise<LookupSettings>;
export declare function getLookupInstructions(): PromptSection[];
export declare function runEntityExtraction(context: LookupContext, settings: LookupSettings): Promise<Entity[]>;
/**
 * Search bing
 * @param query
 * @returns urls of relevant web pages
 */
export declare function searchWeb(query: string, maxSearchResults?: number): Promise<string[] | undefined>;
export {};
//# sourceMappingURL=chatResponseHandler.d.ts.map