// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, createChatTranslator, loadSchema, rewriteText, } from "typeagent";
import { flatten } from "../setOperations.js";
import registerDebug from "debug";
import { answerContextToString, splitAnswerContext, } from "./answerContext.js";
const answerError = registerDebug("knowledge-processor:answerGenerator:error");
export function createAnswerGeneratorSettings() {
    return {
        topK: {
            topicsTopK: 8,
            entitiesTopK: 8,
            actionsTopK: 0,
        },
        chunking: {
            enable: false,
            splitMessages: false,
            fastStop: false,
        },
        maxCharsInContext: 1024 * 8,
    };
}
export function createAnswerGenerator(model, generatorSettings) {
    const settings = generatorSettings ?? createAnswerGeneratorSettings();
    const translator = createChatTranslator(model, loadSchema(["answerSchema.ts"], import.meta.url), "AnswerResponse");
    return {
        get settings() {
            return settings;
        },
        generateAnswer,
        generateAnswerInChunks,
    };
    async function generateAnswerInChunks(question, response, settings, progress) {
        const context = createContext(response);
        return getAnswerInChunks(question, context, settings, progress);
    }
    async function generateAnswer(question, answerStyle, response, higherPrecision, enforceContextLength) {
        const context = createContext(response);
        enforceContextLength ??= true;
        if (enforceContextLength &&
            isContextTooBig(context, response) &&
            settings.chunking?.enable) {
            // Run answer generation in chunks
            return await getAnswerInChunks(question, context, {
                maxCharsPerChunk: settings.maxCharsInContext,
                answerStyle,
                higherPrecision,
            });
        }
        // Context is small enough
        return getAnswer(question, answerStyle, higherPrecision, context, enforceContextLength);
    }
    async function getAnswerInChunks(question, context, answerSettings, progress) {
        let chunks = splitContext(context, answerSettings.maxCharsPerChunk);
        if (chunks.length === 0) {
            return undefined;
        }
        if (!chunks[0].messages) {
            const structuredChunk = chunks[0];
            // Structured only. Lets do it first, since it may have the full answer we needed
            const structuredAnswer = await getAnswer(question, answerSettings.answerStyle, answerSettings.higherPrecision, structuredChunk, false);
            if (structuredAnswer &&
                structuredAnswer.type === "Answered" &&
                settings.chunking.fastStop) {
                return structuredAnswer;
            }
            chunks = chunks.slice(1);
        }
        if (chunks.length === 0) {
            return undefined;
        }
        // Generate partial answers from each chunk
        const partialAnswers = await asyncArray.mapAsync(chunks, settings.concurrency ?? 2, (chunk) => getAnswer(question, answerSettings.answerStyle, answerSettings.higherPrecision, chunk, false), (context, index, response) => {
            if (progress) {
                progress(context, index, response);
            }
            if (settings.chunking.fastStop) {
                // Return false if mapAsync should stop
                return response && response.type !== "Answered";
            }
        });
        return await combinePartialAnswers(question, partialAnswers);
    }
    async function getAnswer(question, answerStyle, higherPrecision, context, trim = true) {
        // Currently always use a model to transform the search response into an answer
        // Future: some answers may be rendered using local templates, code etc.
        let contextContent = answerContextToString(context);
        if (trim && contextContent.length > getMaxContextLength()) {
            contextContent = trimContext(contextContent, getMaxContextLength());
        }
        let preamble = [];
        if (settings.contextProvider) {
            preamble.push(...(await settings.contextProvider.getSections(question)));
        }
        preamble.push({
            role: "user",
            content: `[CONVERSATION HISTORY]\n${contextContent}`,
        });
        const prompt = createAnswerPrompt(question, higherPrecision, answerStyle);
        const result = await translator.translate(prompt, preamble);
        return result.success ? result.data : undefined;
    }
    async function combinePartialAnswers(question, partialAnswers) {
        let answer = "";
        let whyNoAnswer;
        let answerCount = 0;
        for (const partialAnswer of partialAnswers) {
            if (partialAnswer) {
                if (partialAnswer.type === "Answered") {
                    answerCount++;
                    answer += partialAnswer.answer + "\n";
                }
                else {
                    whyNoAnswer ??= partialAnswer.whyNoAnswer;
                }
            }
        }
        if (answer.length > 0) {
            if (answerCount > 1) {
                answer = (await rewriteAnswer(question, answer)) ?? answer;
            }
            return {
                type: "Answered",
                answer,
            };
        }
        whyNoAnswer ??= "";
        return {
            type: "NoAnswer",
            whyNoAnswer,
        };
    }
    async function rewriteAnswer(question, text) {
        text = trim(text, settings.maxCharsInContext);
        return rewriteText(model, text, question);
    }
    function createAnswerPrompt(question, higherPrecision, answerStyle) {
        let prompt = `The following is a user question about a conversation:\n${question}\n\n`;
        prompt +=
            "The included CONVERSATION HISTORY contains information that MAY be relevant to answering the question.\n";
        prompt +=
            "Answer the question using only relevant topics, entities, actions, messages and time ranges/timestamps found in CONVERSATION HISTORY.\n";
        prompt +=
            "Use the name and type of the provided entities to select those highly relevant to answering the question.\n";
        prompt += "Entities and topics are case-insensitive.\n";
        if (settings.hints) {
            prompt += "\n" + settings.hints;
        }
        if (higherPrecision) {
            prompt +=
                "Don't answer if the topics and entity names/types in the question are not in the conversation history.\n";
        }
        if (answerStyle) {
            prompt += answerStyleToHint(answerStyle);
        }
        else {
            prompt += "List ALL entities if query intent implies that.\n";
        }
        prompt += `Your answer is readable and complete, with suitable formatting (line breaks, bullet points etc).`;
        return prompt;
    }
    function answerStyleToHint(answerStyle) {
        switch (answerStyle) {
            default:
                return "";
            case "List":
            case "List_Entities":
                return "List ALL relevant entities";
        }
    }
    function createContext(response) {
        const context = {
            entities: {
                timeRanges: response.entityTimeRanges(),
                values: response.getEntities(settings.topK.entitiesTopK),
            },
            topics: {
                timeRanges: response.topicTimeRanges(),
                values: response.getTopics(),
            },
            messages: response.messages && response.messages.length > 0
                ? flatten(response.messages, (m) => {
                    return {
                        timestamp: m.timestamp,
                        value: m.value.value,
                    };
                })
                : [],
        };
        if (settings.topK.actionsTopK > 0 && response.hasActions()) {
            const actions = response.getActions(settings.topK.actionsTopK);
            if (actions.length > 0) {
                context.actions = {
                    timeRanges: response.actionTimeRanges(),
                    values: response.getActions(settings.topK.actionsTopK),
                };
            }
        }
        return context;
    }
    function splitContext(context, maxCharsPerChunk) {
        let chunks = [...splitAnswerContext(context, maxCharsPerChunk)];
        const maxChunks = settings.chunking.maxChunks;
        if (maxChunks && maxChunks > 0) {
            chunks = chunks.slice(0, maxChunks);
        }
        return chunks;
    }
    function trimContext(content, maxLength) {
        if (content.length > maxLength) {
            content = content.slice(0, maxLength);
            log("generateAnswerWithModel", `Context exceeds ${maxLength} chars. Trimmed.`);
        }
        return content;
    }
    function trim(text, maxLength) {
        if (maxLength && text.length > maxLength) {
            return text.slice(0, maxLength);
        }
        return text;
    }
    function isContextTooBig(context, response) {
        const totalMessageLength = response.getTotalMessageLength();
        return totalMessageLength > getMaxContextLength();
    }
    function getMaxContextLength() {
        return settings?.maxCharsInContext ?? 1000 * 20;
    }
}
function log(where, message) {
    const errorText = `${where}\n${message}`;
    answerError(errorText);
}
//# sourceMappingURL=answerGenerator.js.map