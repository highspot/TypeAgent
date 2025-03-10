// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, dateTime, readJsonFile } from "typeagent";
import fs from "fs";
import path from "path";
import { removeUndefined } from "../setOperations.js";
import { TextBlockType } from "../text.js";
import { createConversationManager, } from "../conversation/conversationManager.js";
import { createConversation, } from "../conversation/conversation.js";
import { isValidChunkSize, splitLargeTextIntoChunks } from "../textChunker.js";
import { KnownEntityTypes } from "../conversation/knowledge.js";
import { createEntitySearchOptions } from "../conversation/entities.js";
/**
 * Convert an email to a conversation message
 * Includes an knowledge that can be automatically extracted from the message
 * @param email
 * @returns
 */
export function emailToMessage(email) {
    const sender = email.from.displayName;
    return {
        header: emailHeadersToString(email),
        text: emailToTextBlock(email, false),
        knowledge: emailToKnowledge(email),
        timestamp: dateTime.stringToDate(email.sentOn),
        sender,
    };
}
/**
 * Convert an email to multiple conversation messages.
 * Large emails are broken into sub-messages.
 * @param email
 * @param maxCharsPerChunk
 * @returns
 */
export function emailToMessages(email, maxCharsPerChunk) {
    if (!isValidChunkSize(maxCharsPerChunk)) {
        return [emailToMessage(email)];
    }
    const messages = [];
    const text = email.body;
    for (const chunk of splitLargeTextIntoChunks(text, maxCharsPerChunk)) {
        const emailChunk = { ...email };
        emailChunk.body = chunk;
        messages.push(emailToMessage(emailChunk));
    }
    return messages;
}
export function emailAddressToString(address) {
    if (address.displayName) {
        return address.address
            ? `"${address.displayName}" <${address.address}>`
            : address.displayName;
    }
    return address.address ?? "";
}
export function emailAddressListToString(addresses) {
    if (addresses === undefined || addresses.length === 0) {
        return "";
    }
    return addresses
        ? addresses.map((a) => emailAddressToString(a)).join(", ")
        : "";
}
export function emailAddressToEntities(emailAddress) {
    const entities = [];
    if (emailAddress.displayName) {
        const entity = {
            name: emailAddress.displayName,
            type: [KnownEntityTypes.Person],
        };
        entities.push(entity);
        if (emailAddress.address) {
            entity.facets = [];
            entity.facets.push({
                name: "email_address",
                value: emailAddress.address,
            });
        }
    }
    if (emailAddress.address) {
        entities.push({
            name: emailAddress.address,
            type: [
                KnownEntityTypes.Email_Address,
                KnownEntityTypes.Email_Alias,
            ],
        });
    }
    return entities;
}
export function emailHeadersToString(email) {
    let text = "";
    if (email.from) {
        text += makeHeader("From", emailAddressToString(email.from));
    }
    if (email.to) {
        text += makeHeader("To", emailAddressListToString(email.to));
    }
    if (email.cc) {
        text += makeHeader("Cc", emailAddressListToString(email.cc));
    }
    if (email.bcc) {
        text += makeHeader("Bcc", emailAddressListToString(email.bcc));
    }
    if (email.sentOn) {
        text += makeHeader("Sent", email.sentOn.toString());
    }
    if (email.receivedOn) {
        text += makeHeader("Received", email.receivedOn.toString());
    }
    if (email.importance) {
        text += makeHeader("Importance", email.importance);
    }
    if (email.subject) {
        text += makeHeader("Subject", email.subject);
    }
    return text;
}
export function emailToString(email, includeBody = true) {
    let text = emailHeadersToString(email);
    if (includeBody && email.body) {
        text += "\n\n";
        text += email.body;
    }
    return text;
}
export function emailToTextBlock(email, includeHeader = true) {
    const value = includeHeader ? emailToString(email) : email.body;
    const block = {
        type: TextBlockType.Raw,
        value,
    };
    if (email.sourcePath) {
        block.sourceIds = [email.sourcePath];
    }
    return block;
}
export function emailToEntities(email, buffer) {
    const entities = buffer ?? [];
    pushAddresses(email.from, entities);
    pushAddresses(email.to, entities);
    pushAddresses(email.cc, entities);
    pushAddresses(email.bcc, entities);
    entities.push({
        name: "email",
        type: ["message"],
    });
    return entities;
    function pushAddresses(addresses, entities) {
        if (!addresses) {
            return;
        }
        if (Array.isArray(addresses)) {
            for (const address of addresses) {
                entities.push(...emailAddressToEntities(address));
            }
        }
        else {
            entities.push(...emailAddressToEntities(addresses));
        }
    }
}
var EmailVerbs;
(function (EmailVerbs) {
    EmailVerbs["send"] = "send";
    EmailVerbs["receive"] = "receive";
})(EmailVerbs || (EmailVerbs = {}));
export function isEmailVerb(verbs) {
    if (verbs.length === 1) {
        return verbs[0] === EmailVerbs.receive || verbs[0] === EmailVerbs.send;
    }
    return false;
}
function createEmailActions(sender, recipient, buffer) {
    const actions = buffer ?? [];
    addAction(EmailVerbs.send, sender, recipient);
    addAction(EmailVerbs.receive, recipient, sender);
    return actions;
    function addAction(verb, sender, recipient) {
        if (sender.displayName) {
            addActions(verb, sender.displayName, recipient, actions);
        }
        if (sender.address) {
            addActions(verb, sender.address, recipient, actions);
        }
    }
    function addActions(verb, sender, recipient, actions) {
        if (recipient.displayName) {
            actions.push(createAction(verb, sender, recipient.displayName));
        }
        if (recipient.address) {
            actions.push(createAction(verb, sender, recipient.address));
        }
    }
    function createAction(verb, from, to) {
        return {
            verbs: [verb],
            verbTense: "past",
            subjectEntityName: from,
            objectEntityName: "email",
            indirectObjectEntityName: to,
        };
    }
}
export function emailToActions(email) {
    const actions = [];
    addActions(email.from, email.to, actions);
    addActions(email.from, email.cc, actions);
    addActions(email.from, email.bcc, actions);
    return actions;
    function addActions(sender, recipients, buffer) {
        if (recipients) {
            recipients.forEach((r) => createEmailActions(sender, r, buffer));
        }
    }
}
function emailToKnowledge(email) {
    return {
        entities: emailToEntities(email),
        topics: email.subject ? [email.subject] : [],
        actions: emailToActions(email),
        inverseActions: [],
    };
}
/**
 * Load a JSON file containing an Email object
 * @param filePath
 * @returns
 */
export async function loadEmailFile(filePath) {
    return readJsonFile(filePath);
}
export async function loadEmailFolder(folderPath, concurrency, progress) {
    const fileNames = await fs.promises.readdir(folderPath);
    const filePaths = fileNames.map((f) => path.join(folderPath, f));
    const emails = await asyncArray.mapAsync(filePaths, concurrency, (filePath) => loadEmailFile(filePath), progress);
    return removeUndefined(emails);
}
/**
 * Create email memory at the given root path
 * @param name
 * @param rootPath
 * @param settings
 * @returns
 */
export async function createEmailMemory(model, answerModel, name, rootPath, settings, storageProvider) {
    const storePath = path.join(rootPath, name);
    settings.initializer ??= setupEmailConversation;
    const emailConversation = await createConversation(settings, storePath, undefined, undefined, storageProvider);
    const userProfile = await readJsonFile(path.join(rootPath, "emailUserProfile.json"));
    const cm = await createConversationManager({
        model,
        answerModel,
        initializer: (c) => setupEmailConversationManager(c, userProfile),
    }, name, rootPath, false, emailConversation);
    return cm;
}
async function setupEmailConversationManager(cm, userProfile) {
    cm.topicMerger.settings.mergeWindowSize = 1;
    cm.topicMerger.settings.trackRecent = false;
    const entityIndex = await cm.conversation.getEntityIndex();
    entityIndex.noiseTerms.put("email");
    entityIndex.noiseTerms.put("message");
    cm.searchProcessor.actions.requestInstructions =
        "The following is a user request about the messages in their email inbox. The email inbox belongs to:\n" +
            JSON.stringify(userProfile, undefined, 2) +
            "\n" +
            "When generating the filter, ignore 'email', 'inbox' and 'message' as noise words\n";
    //"User specific first person pronouns are rewritten to use user's name, but general ones are not.";
    cm.searchProcessor.answers.settings.hints =
        "messages are *emails* with email headers such as To, From, Cc, Subject. etc. " +
            "To answer questions correctly, use the headers to determine who the email is from and who it was sent to. " +
            "If you are not sure, return NoAnswer.";
    cm.searchProcessor.settings.defaultEntitySearchOptions =
        createEntitySearchOptions(true);
    // cm.searchProcessor.settings.defaultEntitySearchOptions.nameSearchOptions!.maxMatches = 25;
}
async function setupEmailConversation(emailConversation) {
    const actions = await emailConversation.getActionIndex();
    actions.verbTermMap.put("say", EmailVerbs.send);
    actions.verbTermMap.put("discuss", EmailVerbs.send);
    actions.verbTermMap.put("talk", EmailVerbs.send);
    actions.verbTermMap.put("get", EmailVerbs.receive);
}
/**
 * Add an email message to an email conversation
 * @param cm
 * @param emails
 */
export async function addEmailToConversation(cm, emails, maxCharsPerChunk) {
    const messages = [];
    if (Array.isArray(emails)) {
        for (const email of emails) {
            messages.push(...emailToMessages(email, maxCharsPerChunk));
        }
    }
    else {
        messages.push(...emailToMessages(emails, maxCharsPerChunk));
    }
    await cm.addMessageBatch(messages);
}
export async function addEmailFileToConversation(cm, sourcePath, maxCharsPerChunk) {
    if (fs.existsSync(sourcePath)) {
        const email = await loadEmailFile(sourcePath);
        if (email) {
            await addEmailToConversation(cm, email, maxCharsPerChunk);
        }
        return true;
    }
    return false;
}
function makeHeader(name, text) {
    if (text) {
        return `${name}: ${text}\n`;
    }
    return "";
}
//# sourceMappingURL=email.js.map