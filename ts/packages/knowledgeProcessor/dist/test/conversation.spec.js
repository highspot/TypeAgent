// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../../../.env", import.meta.url) });
import path from "node:path";
import os from "node:os";
import { conversation } from "../src/index.js";
import { shouldSkip, skipTest } from "./testCore.js";
describe("ConversationManager", () => {
    const testTimeout = 120000;
    let g_context;
    beforeAll(async () => {
        await getContext();
    });
    shouldSkip()
        ? skipTest("addEntities")
        : test("addEntities", async () => {
            const context = await getContext();
            await addEntities(context.cm);
        }, testTimeout);
    shouldSkip()
        ? skipTest("search")
        : test("search", async () => {
            const context = await getContext();
            const query = "What food did we talk about?";
            let matches = await context.cm.search(query);
            expect(matches && matches.response && matches.response.answer);
        }, testTimeout);
    shouldSkip()
        ? skipTest("searchTerms")
        : test("searchTerms", async () => {
            const context = await getContext();
            const query = "What food did we talk about?";
            const filters = [
                {
                    terms: ["food"],
                },
            ];
            let matches = await context.cm.search(query, filters);
            expect(matches && matches.response && matches.response.answer);
        });
    shouldSkip()
        ? skipTest("queueEntities")
        : test("queueEntities", async () => {
            const context = await getContext();
            queueEntities(context.cm);
            await context.cm.updateTaskQueue.drain();
            expect(context.cm.updateTaskQueue.length()).toBe(0);
            const entityIndex = await context.cm.conversation.getEntityIndex();
            const postings = await entityIndex.typeIndex.get("writer");
            expect(postings).not.toBeUndefined();
            expect(postings?.length).toBeGreaterThan(0);
        }, testTimeout * 2);
    async function getContext() {
        if (!g_context) {
            g_context = await createTestContext();
        }
        return g_context;
    }
});
async function createTestContext() {
    const cm = await conversation.createConversationManager({}, "testConversation", path.join(os.tmpdir(), "/data/tests"), true);
    return {
        cm,
    };
}
async function addEntities(cm) {
    const testMessage = "Bach ate pizza while he wrote fugues";
    let entity1 = {
        name: "bach",
        type: ["composer", "person"],
    };
    let entity2 = {
        name: "pizza",
        type: ["food"],
    };
    await cm.addMessage({ text: testMessage, knowledge: [entity1, entity2] });
}
function queueEntities(cm) {
    const message = "Shakespeare did pushups while he wrote Macbeth";
    let entity1 = {
        name: "Shakespeare",
        type: ["writer", "person"],
    };
    let entity2 = {
        name: "pushups",
        type: ["exercise"],
    };
    let entity3 = {
        name: "Macbeth",
        type: ["play"],
    };
    cm.queueAddMessage({
        text: message,
        knowledge: [entity1, entity2, entity3],
    });
}
//# sourceMappingURL=conversation.spec.js.map