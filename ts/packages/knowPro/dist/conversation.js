// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function getTimeRangeForConversation(conversation) {
    const messages = conversation.messages;
    const start = messages[0].timestamp;
    const end = messages[messages.length - 1].timestamp;
    if (start !== undefined) {
        return {
            start: new Date(start),
            end: end ? new Date(end) : undefined,
        };
    }
    return undefined;
}
//# sourceMappingURL=conversation.js.map