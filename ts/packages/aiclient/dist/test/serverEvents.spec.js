"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const serverEvents_1 = require("../src/serverEvents");
const messages = ["data: hello", "data: world", "data: foo", "data: bar"];
function getTextStream(text, breakAt) {
    return (async function* () {
        yield text.slice(0, breakAt);
        yield text.slice(breakAt);
    })();
}
describe("serverEvents", () => {
    describe("readMessage", () => {
        const fullMessage = messages.join("\n\n");
        for (let i = 0; i < fullMessage.length; i++) {
            it(`should read messages break at ${i}`, async () => {
                const textStream = getTextStream(fullMessage, i);
                let index = 0;
                for await (const message of (0, serverEvents_1.readMessages)(textStream)) {
                    expect(message).toEqual(messages[index++]);
                }
            });
        }
    });
});
//# sourceMappingURL=serverEvents.spec.js.map