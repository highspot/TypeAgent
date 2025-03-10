import * as knowLib from "knowledge-processor";
import { conversation } from "knowledge-processor";
import { ChatModel, TextEmbeddingModel } from "aiclient";
import { ChatMemoryPrinter } from "./chatMemoryPrinter.js";
export type Models = {
    chatModel: ChatModel;
    answerModel: ChatModel;
    embeddingModel: TextEmbeddingModel;
    embeddingModelSmall?: TextEmbeddingModel | undefined;
};
export type ChatContext = {
    storePath: string;
    statsPath: string;
    printer: ChatMemoryPrinter;
    models: Models;
    maxCharsPerChunk: number;
    stats?: knowLib.IndexingStats | undefined;
    topicWindowSize: number;
    searchConcurrency: number;
    minScore: number;
    entityTopK: number;
    actionTopK: number;
    conversationName: string;
    conversationSettings: knowLib.conversation.ConversationSettings;
    conversation: knowLib.conversation.Conversation;
    conversationManager: knowLib.conversation.ConversationManager;
    searcher: knowLib.conversation.ConversationSearchProcessor;
    searchMemory?: knowLib.conversation.ConversationManager;
    emailMemory: knowLib.conversation.ConversationManager;
    podcastMemory: knowLib.conversation.ConversationManager;
    imageMemory: knowLib.conversation.ConversationManager;
};
export declare enum ReservedConversationNames {
    transcript = "transcript",
    outlook = "outlook",
    play = "play",
    search = "search",
    podcasts = "podcasts",
    images = "images"
}
export declare function createModels(): Models;
export declare function createChatMemoryContext(completionCallback?: (req: any, resp: any) => void): Promise<ChatContext>;
export declare function createConversation(rootPath: string, settings: knowLib.conversation.ConversationSettings): Promise<conversation.Conversation>;
export declare function configureSearchProcessor(cm: conversation.ConversationManager, entityTopK: number, actionTopK: number): knowLib.conversation.ConversationSearchProcessor;
export declare function createSearchMemory(context: ChatContext): Promise<conversation.ConversationManager>;
export declare function loadConversation(context: ChatContext, name: string, rootPath?: string): Promise<boolean>;
export declare function runChatMemory(): Promise<void>;
//# sourceMappingURL=chatMemory.d.ts.map