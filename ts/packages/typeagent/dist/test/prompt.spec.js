"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("../src/prompt");
const message_1 = require("../src/message");
describe("Prompts", () => {
    test("ChatHistory", () => {
        let maxContextLength = 1024;
        let messageCount = 6;
        let sections = generateMessages(messageCount);
        expect((0, prompt_1.getTotalPromptLength)(sections.sections)).toEqual(sections.length);
        let halfLength = (0, prompt_1.getTotalPromptLength)(sections.sections.slice(messageCount / 2));
        let context = [...(0, prompt_1.getContextFromHistory)(sections.sections, halfLength)];
        expect(context).toHaveLength(messageCount / 2);
        let messages = sections.sections;
        context = [...(0, prompt_1.getContextFromHistory)(messages, maxContextLength)];
        expect(context).toHaveLength(messageCount);
        let historySize = 4;
        let limitedHistory = (0, prompt_1.createChatHistory)(historySize);
        for (const msg of messages) {
            limitedHistory.push(msg);
        }
        expect(limitedHistory.length).toEqual(historySize);
        expect(limitedHistory.getEntries()).toEqual(messages.slice(2));
        context = [...(0, prompt_1.getContextFromHistory)(limitedHistory, maxContextLength)];
        expect(context).toHaveLength(historySize);
        context = [...(0, prompt_1.getContextFromHistory)(sections.sections, halfLength)];
        expect(context).toHaveLength(messageCount / 2);
    });
    function generateMessages(count) {
        let length = 0;
        let sections = [];
        for (let i = 0; i < count; ++i) {
            let content = `Message ${i}`;
            sections.push({
                role: message_1.MessageSourceRole.user,
                content,
            });
            length += content.length;
        }
        return {
            length,
            sections,
        };
    }
});
//# sourceMappingURL=prompt.spec.js.map