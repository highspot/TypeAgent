"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTranslator = exports.createChatTranslator = exports.createTypeChat = void 0;
const typechat_1 = require("typechat");
const ts_1 = require("typechat/ts");
const prompt_1 = require("./prompt");
const message_1 = require("./message");
const schema_1 = require("./schema");
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
function createTypeChat(model, schema, typeName, instructions, history, maxPromptLength, maxWindowLength = Number.MAX_VALUE, stringify) {
    //
    // We use a standard typechat translator. But we override the translate method and
    // transparently inject context/history into every call
    //
    const translator = createChatTranslator(model, schema, typeName);
    const translationFunction = translator.translate;
    translator.translate = translate;
    return translator;
    async function translate(request, promptPreamble) {
        const chatContext = buildContext(request, promptPreamble);
        const response = await translationFunction(request, chatContext);
        if (response.success) {
            // If translation was successful, save in chat history
            history.push({ role: message_1.MessageSourceRole.user, content: request });
            history.push({
                role: message_1.MessageSourceRole.assistant,
                content: stringify
                    ? stringify(response.data)
                    : JSON.stringify(response.data),
            });
        }
        return response;
    }
    //
    // Chat context consists of:
    // - Past message history, with newest messages first, upto a max
    // - Instructions
    // - Prompt preamble
    // - Schema (implicitly included in request)
    //
    function buildContext(request, promptPreamble) {
        const availablePromptLength = maxPromptLength - (request.length + schema.length);
        const maxHistoryLength = availablePromptLength - (0, prompt_1.getPreambleLength)(promptPreamble);
        // Schema consumes token budget, but must be included...
        const promptBuilder = (0, prompt_1.createPromptBuilder)(availablePromptLength);
        promptBuilder.begin();
        promptBuilder.push(instructions);
        promptBuilder.pushSections((0, prompt_1.getContextFromHistory)(history, maxHistoryLength, maxWindowLength));
        if (promptPreamble) {
            promptBuilder.push(promptPreamble);
        }
        return promptBuilder.complete(false).sections;
    }
}
exports.createTypeChat = createTypeChat;
/**
 * Create a JSON translator designed to work for Chat
 * @param model language model to use
 * @param schema schema for the chat response
 * @param typeName typename of the chat response
 * @returns
 */
function createChatTranslator(model, schema, typeName) {
    const validator = (0, ts_1.createTypeScriptJsonValidator)(schema, typeName);
    const translator = (0, typechat_1.createJsonTranslator)(model, validator);
    translator.createRequestPrompt = createRequestPrompt;
    return translator;
    function createRequestPrompt(request) {
        return (`Your responses are represented as JSON objects of type "${typeName}" using the following TypeScript definitions:\n` +
            `\`\`\`\n${schema}\`\`\`\n` +
            `The following is a user request:\n` +
            `"""\n${request}\n"""\n` +
            `The following is your JSON response with 2 spaces of indentation and no properties with the value undefined:\n`);
    }
}
exports.createChatTranslator = createChatTranslator;
/**
 * Create a Json translator
 * @param model language model to use
 * @param schemaPaths schema files to use
 * @param baseUrl base Url from where to load schema files
 * @param typeName type name of the model response
 * @param createRequestPrompt (optional) customize the prompt
 * @returns
 */
function createTranslator(model, schemaPaths, baseUrl, typeName, createRequestPrompt) {
    const schema = (0, schema_1.loadSchema)(schemaPaths, baseUrl);
    const validator = (0, ts_1.createTypeScriptJsonValidator)(schema, typeName);
    const translator = (0, typechat_1.createJsonTranslator)(model, validator);
    if (createRequestPrompt) {
        translator.createRequestPrompt = (request) => {
            return createRequestPrompt(request, validator.getSchemaText(), validator.getTypeName());
        };
    }
    return translator;
}
exports.createTranslator = createTranslator;
//# sourceMappingURL=chat.js.map