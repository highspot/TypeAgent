"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const objStream_1 = require("../src/objStream");
const workQueue_1 = require("../src/storage/workQueue");
const common_1 = require("./common");
describe("storage.workQueue", () => {
    const timeoutMs = 1000 * 60 * 5;
    test("end2end", async () => {
        const queuePath = (0, common_1.testDirectoryPath)("workQueue");
        await (0, objStream_1.removeDir)(queuePath);
        const queue = await (0, workQueue_1.createWorkQueueFolder)(queuePath, "tasks");
        const tasks = ["One", "Two", "Three"];
        for (const task of tasks) {
            await queue.addTask(task);
        }
        for (let i = 0; i < 2; ++i) {
            expect(await queue.count()).toBe(tasks.length);
            const completed = [];
            await queue.drainTask(1, async (task) => {
                completed.push(task);
            });
            expect(completed).toHaveLength(tasks.length);
            expect(await queue.count()).toBe(0);
            await queue.requeue();
        }
    }, timeoutMs);
});
//# sourceMappingURL=storage.workQueue.spec.js.map