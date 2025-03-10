import { asyncArray } from "typeagent";
import { Action, ConcreteEntity } from "../conversation/knowledgeSchema.js";
import { Email, EmailAddress } from "./emailSchema.js";
import { TextBlock } from "../text.js";
import { ConversationManager, ConversationMessage } from "../conversation/conversationManager.js";
import { ConversationSettings } from "../conversation/conversation.js";
import { ChatModel } from "aiclient";
import { StorageProvider } from "../storageProvider.js";
/**
 * Convert an email to a conversation message
 * Includes an knowledge that can be automatically extracted from the message
 * @param email
 * @returns
 */
export declare function emailToMessage(email: Email): ConversationMessage;
/**
 * Convert an email to multiple conversation messages.
 * Large emails are broken into sub-messages.
 * @param email
 * @param maxCharsPerChunk
 * @returns
 */
export declare function emailToMessages(email: Email, maxCharsPerChunk?: number | undefined): ConversationMessage[];
export declare function emailAddressToString(address: EmailAddress): string;
export declare function emailAddressListToString(addresses: EmailAddress[] | undefined): string;
export declare function emailAddressToEntities(emailAddress: EmailAddress): ConcreteEntity[];
export declare function emailHeadersToString(email: Email): string;
export declare function emailToString(email: Email, includeBody?: boolean): string;
export declare function emailToTextBlock(email: Email, includeHeader?: boolean): TextBlock<string>;
export declare function emailToEntities(email: Email, buffer?: ConcreteEntity[] | undefined): ConcreteEntity[];
export declare function isEmailVerb(verbs: string[]): boolean;
export declare function emailToActions(email: Email): Action[];
/**
 * Load a JSON file containing an Email object
 * @param filePath
 * @returns
 */
export declare function loadEmailFile(filePath: string): Promise<Email | undefined>;
export declare function loadEmailFolder(folderPath: string, concurrency: number, progress?: asyncArray.ProcessProgress<string, Email | undefined>): Promise<Email[]>;
export interface EmailMemorySettings extends ConversationSettings {
    mailBoxOwner?: EmailAddress | undefined;
}
/**
 * Create email memory at the given root path
 * @param name
 * @param rootPath
 * @param settings
 * @returns
 */
export declare function createEmailMemory(model: ChatModel, answerModel: ChatModel, name: string, rootPath: string, settings: EmailMemorySettings, storageProvider?: StorageProvider): Promise<ConversationManager<string, string>>;
/**
 * Add an email message to an email conversation
 * @param cm
 * @param emails
 */
export declare function addEmailToConversation(cm: ConversationManager, emails: Email | Email[], maxCharsPerChunk: number): Promise<void>;
export declare function addEmailFileToConversation(cm: ConversationManager, sourcePath: string, maxCharsPerChunk: number): Promise<boolean>;
//# sourceMappingURL=email.d.ts.map