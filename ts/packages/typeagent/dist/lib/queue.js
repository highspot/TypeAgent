"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskQueue = exports.createQueue = void 0;
const linkedList_1 = require("./linkedList");
const async_1 = require("async");
/**
 * Creates a simple linked list based queue
 * @returns
 */
function createQueue() {
    const list = (0, linkedList_1.createLinkedList)();
    return {
        length: list.length,
        enqueue,
        dequeue,
        entries,
    };
    function enqueue(item) {
        list.pushTail((0, linkedList_1.createListEntry)(item));
    }
    function dequeue() {
        const entry = list.popHead();
        return entry ? entry.value : undefined;
    }
    function* entries() {
        for (const node of list.entries()) {
            yield node.value;
        }
    }
}
exports.createQueue = createQueue;
function createTaskQueue(worker, maxLength, concurrency = 1) {
    let taskQueue;
    return {
        length,
        push,
        drain
    };
    function ensureQueue() {
        if (!taskQueue) {
            taskQueue = (0, async_1.queue)(async (item, callback) => {
                try {
                    await worker(item);
                    if (callback) {
                        callback();
                    }
                }
                catch (error) {
                    if (callback) {
                        callback(error);
                    }
                }
            }, concurrency);
        }
        return taskQueue;
    }
    function length() {
        return taskQueue ? taskQueue.length() : 0;
    }
    function push(item) {
        if (length() === maxLength) {
            return false;
        }
        ensureQueue().pushAsync(item);
        return true;
    }
    async function drain() {
        return taskQueue ? taskQueue.drain() : Promise.resolve();
    }
}
exports.createTaskQueue = createTaskQueue;
//# sourceMappingURL=queue.js.map