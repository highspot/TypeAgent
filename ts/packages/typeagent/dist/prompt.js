"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContextFromHistory = exports.createChatHistory = exports.createPromptSectionBuilder = exports.createPromptBuilder = exports.getPreambleLength = exports.getTotalPromptLength = exports.joinPromptSections = exports.concatPromptSections = exports.createPromptSections = void 0;
const message_1 = require("./message");
const objStream_1 = require("./objStream");
const array_1 = require("./lib/array");
/**
 * Create Prompt Sections from given strings
 * @param strings
 * @returns Prompt sections
 */
function createPromptSections(strings, role) {
    if (typeof strings === "string") {
        return [{ role: role, content: strings }];
    }
    return strings.map((str) => {
        return { role: role, content: str };
    });
}
exports.createPromptSections = createPromptSections;
/**
 * Concatenate two prompt sections
 * @param first
 * @param second
 * @returns
 */
function concatPromptSections(first, second) {
    if (first) {
        if (second) {
            return first.concat(second);
        }
        return first;
    }
    else {
        return second;
    }
}
exports.concatPromptSections = concatPromptSections;
/**
 * Join sections into one:
 * @param role
 * @param sections
 * @returns
 */
function joinPromptSections(role, sections) {
    let content = "";
    for (const section of sections) {
        content += section.content + "\n";
    }
    return {
        role,
        content,
    };
}
exports.joinPromptSections = joinPromptSections;
/**
 * Get the cumulative length of all text in the given prompt sections
 * @param sections
 * @returns
 */
function getTotalPromptLength(sections) {
    let length = 0;
    for (let i = 0; i < sections.length; ++i) {
        length += sections[i].content.length;
    }
    return length;
}
exports.getTotalPromptLength = getTotalPromptLength;
function getPreambleLength(preamble) {
    if (preamble) {
        if (Array.isArray(preamble)) {
            return getTotalPromptLength(preamble);
        }
        else {
            return preamble.length;
        }
    }
    return 0;
}
exports.getPreambleLength = getPreambleLength;
/**
 * A Prompt is a collection of Prompt Sections
 * Context is usually submitted as a collection of prompt sections.
 * But contexts must satisfy a token budget: typically constrained to a maximum character count, as that
 * is easier to deal with than token counts
 *
 * Builders can be reused.
 */
function createPromptBuilder(maxLength, maxSections = Number.MAX_VALUE) {
    const builder = {
        maxLength,
        maxSections,
        currentLength: 0,
        prompt: [],
        begin,
        push,
        pushSection,
        pushText,
        pushSections,
        complete,
    };
    return builder;
    function begin() {
        builder.prompt.length = 0;
    }
    function push(sections) {
        if (typeof sections === "string") {
            return pushText(sections);
        }
        if (Array.isArray(sections)) {
            for (let section of sections) {
                if (!push(section)) {
                    return false;
                }
            }
            return true;
        }
        return pushSection(sections);
    }
    function pushSection(section) {
        if (willExceedLimit(section.content.length)) {
            return false;
        }
        builder.prompt.push(section);
        updateLength(section.content.length);
        return true;
    }
    function pushText(content) {
        if (willExceedLimit(content.length)) {
            return false;
        }
        builder.prompt.push({
            role: message_1.MessageSourceRole.user,
            content: content,
        });
        updateLength(content.length);
        return true;
    }
    function pushSections(sections) {
        if (Array.isArray(sections)) {
            for (let section of sections) {
                if (!pushSection(section)) {
                    return false;
                }
            }
        }
        else {
            for (let section of sections) {
                if (!pushSection(section)) {
                    return false;
                }
            }
        }
        return true;
    }
    function complete(reverse) {
        reverse ??= true;
        if (reverse) {
            builder.prompt.reverse();
        }
        return {
            length: builder.currentLength,
            sections: builder.prompt,
        };
    }
    function updateLength(length) {
        builder.currentLength = builder.currentLength + length;
    }
    function willExceedLimit(newLength, newSectionCount = 1) {
        return (builder.currentLength + newLength > builder.maxLength ||
            builder.prompt.length + newSectionCount > builder.maxSections);
    }
}
exports.createPromptBuilder = createPromptBuilder;
function createPromptSectionBuilder(maxLength) {
    const builder = {
        maxLength,
        buffer: "",
        begin,
        pushText,
        push: push,
        complete,
    };
    return builder;
    function begin() {
        builder.buffer = "";
    }
    function pushText(text) {
        if (builder.buffer.length + text.length > maxLength) {
            return false;
        }
        builder.buffer = builder.buffer + text;
        return true;
    }
    function push(object) {
        if (typeof object === "string") {
            return pushText(object);
        }
        return pushText((0, objStream_1.toJsonLine)(object));
    }
    function complete(role) {
        return {
            role,
            content: builder.buffer,
        };
    }
}
exports.createPromptSectionBuilder = createPromptSectionBuilder;
/**
 * Creates a chat history with a maximum past history using a circular buffer
 * @param maxPastMessages
 * @param savedHistory Saved history, if any.. ordered by oldest message first
 * @returns
 */
function createChatHistory(maxPastMessages, savedHistory) {
    const history = new array_1.CircularArray(maxPastMessages);
    if (savedHistory) {
        for (const entry of history) {
            history.push(entry);
        }
    }
    return history;
}
exports.createChatHistory = createChatHistory;
/**
 * Given chat history, select messages that could go into context
 * @param history Chat history
 * @param maxContextLength max number of characters available for history
 * @param maxWindowLength maximum size of the chat context window...
 */
function* getContextFromHistory(history, maxContextLength, maxWindowLength = Number.MAX_VALUE) {
    let totalLength = 0;
    let sectionCount = 0;
    let i = history.length - 1;
    // Get the range of sections that could be pushed on, NEWEST first
    while (i >= 0) {
        const nextLength = getEntry(history, i).content.length;
        if (nextLength + totalLength > maxContextLength ||
            sectionCount >= maxWindowLength) {
            ++i;
            break;
        }
        totalLength += nextLength;
        ++sectionCount;
        --i;
    }
    if (i < 0) {
        i = 0;
    }
    // Now that we know the range of messages that could be in context.
    // We yield them oldest first, since the model wants to see them in order
    for (; i < history.length; ++i) {
        yield getEntry(history, i);
    }
    function getEntry(history, index) {
        return Array.isArray(history) ? history[index] : history.get(index);
    }
}
exports.getContextFromHistory = getContextFromHistory;
//# sourceMappingURL=prompt.js.map