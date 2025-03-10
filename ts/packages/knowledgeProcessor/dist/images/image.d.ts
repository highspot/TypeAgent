import { ChatModel } from "aiclient";
import { StorageProvider } from "../storageProvider.js";
import { ConversationSettings } from "../conversation/conversation.js";
import { ConversationManager, ConversationMessage } from "../conversation/conversationManager.js";
import { Image } from "./imageSchema.js";
import { KnowledgeResponse } from "../conversation/knowledgeSchema.js";
import { KnowledgeExtractor } from "../conversation/knowledge.js";
/**
 * Creates an image memory
 */
export declare function createImageMemory(model: ChatModel, answerModel: ChatModel, name: string, rootPath: string, settings: ConversationSettings, storageProvider?: StorageProvider): Promise<ConversationManager<string, string>>;
/**
 * Add an image to a conversation
 * @param cm
 * @param emails
 */
export declare function addImageToConversation(cm: ConversationManager, images: Image | Image[], maxCharsPerChunk: number, extractor: KnowledgeExtractor): Promise<void>;
/**
 * Convert an image to a conversation message
 * Includes an knowledge that can be automatically extracted from the image
 * @param image
 * @returns
 */
export declare function imageToMessage(image: Image, extractor: KnowledgeExtractor): Promise<ConversationMessage>;
export declare function getKnowledgeForImage(image: Image, extractor: KnowledgeExtractor): KnowledgeResponse;
export interface generateCaption {
    title: string;
    altText: string;
    caption: string;
    fileName: string;
    width: number;
    height: number;
    dateTaken: string;
}
export interface imageDetailExtractionSchema {
    title: string;
    altText: string;
    caption: string;
    knowledge: KnowledgeResponse;
}
/**
 *
 * @param fileName The image file to load
 * @param model The language model being used to describe the image.
 * @param loadCachedDetails A flag indicating if cached image descriptions should be loaded if available.
 * @param cacheFolder The folder to find cached image data. If not supplied defaults to the image folder.
 * @returns The described image.
 */
export declare function loadImage(fileName: string, model: ChatModel, loadCachedDetails?: boolean, cacheFolder?: string | undefined): Promise<Image | undefined>;
/**
 * Loads the image and then uses the LLM and other APIs to get POI, KnowledgeResponse, address, etc.
 *
 * @param fileName The image file to load
 * @param cachePath The path where the image knowledge response is to be cached
 * @param model The language model being used to describe the image.
 * @param loadCachedDetails A flag indicating if cached image descriptions should be loaded if available.
 * @returns The described image.
 */
export declare function loadImageWithKnowledge(fileName: string, cachePath: string, model: ChatModel, loadCachedDetails?: boolean): Promise<Image | undefined>;
/**
 * Builds a histogram of image counts per bucket of time
 * @param filePath The path of the folder to build a histogram for
 */
export declare function buildImageCountHistogram(filePath: string, recursive?: boolean, bucketSizeInSeconds?: number): void;
//# sourceMappingURL=image.d.ts.map