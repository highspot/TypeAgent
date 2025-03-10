"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.textToProcessSection = exports.dateTimeRangePromptSection = exports.dateTimeRangePrompt = exports.dateTimePromptSection = exports.dateTimePrompt = void 0;
const message_1 = require("./message");
/**
 * Prompt that tells the model about the current date and time.
 * @returns prompt
 */
function dateTimePrompt() {
    const now = new Date();
    let prompt = `CURRENT DATE AND TIME: ${now.toString()}\n`;
    prompt +=
        "Use precise date and times RELATIVE to current date & time. Turn ranges like next week and next month into precise dates";
    return prompt;
}
exports.dateTimePrompt = dateTimePrompt;
/**
 * A prompt section that supplies the current time stamp
 * @returns
 */
function dateTimePromptSection() {
    return { role: message_1.MessageSourceRole.user, content: dateTimePrompt() };
}
exports.dateTimePromptSection = dateTimePromptSection;
/**
 * Prompt that tells the model about the current date and time.
 * @returns prompt
 */
function dateTimeRangePrompt(range) {
    let prompt = `DATE TIME RANGE: "${range.startDate}"`;
    if (range.stopDate) {
        prompt += ` TO "${range.stopDate}"`;
    }
    prompt += "\n";
    prompt +=
        "Use precise date and times RELATIVE to the DATE TIME RANGE. Turn ranges like next week and next month into precise dates";
    return prompt;
}
exports.dateTimeRangePrompt = dateTimeRangePrompt;
/**
 * A prompt section that supplies the current time stamp
 * @returns
 */
function dateTimeRangePromptSection(range) {
    return {
        role: message_1.MessageSourceRole.user,
        content: dateTimeRangePrompt(range),
    };
}
exports.dateTimeRangePromptSection = dateTimeRangePromptSection;
function textToProcessSection(text) {
    return { role: message_1.MessageSourceRole.user, content: "[TEXT SECTION]\n" + text };
}
exports.textToProcessSection = textToProcessSection;
//# sourceMappingURL=promptLib.js.map