"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkQueueFolder = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const objStream_1 = require("../objStream");
const __1 = require("..");
const objectFolder_1 = require("./objectFolder");
const array_1 = require("../lib/array");
const async_1 = require("../async");
async function createWorkQueueFolder(rootPath, queueFolderName, workItemFilter) {
    queueFolderName ??= "queue";
    let queuePath = await (0, objStream_1.ensureDir)(path_1.default.join(rootPath, queueFolderName));
    queueFolderName ??= "";
    let completedPath = await (0, objStream_1.ensureDir)(path_1.default.join(rootPath, queueFolderName + "_completed"));
    let skippedPath = await (0, objStream_1.ensureDir)(path_1.default.join(rootPath, queueFolderName + "_skipped"));
    let errorPath = await (0, objStream_1.ensureDir)(path_1.default.join(rootPath, queueFolderName + "_error"));
    const namedGenerator = (0, objectFolder_1.createFileNameGenerator)(objectFolder_1.generateTimestampString, (name) => {
        return !fs_1.default.existsSync(taskFilePath(name));
    });
    const thisQueue = {
        count,
        addTask,
        drainTask,
        drain,
        requeue,
        requeueErrors,
    };
    return thisQueue;
    async function count() {
        const fileNames = await fs_1.default.promises.readdir(queuePath);
        return fileNames.length;
    }
    async function addTask(task) {
        const fileName = namedGenerator.next().value;
        await (0, objStream_1.writeJsonFile)(taskFilePath(fileName), task);
    }
    async function drainTask(concurrency, processor, maxItems, pauseMs) {
        return drain(concurrency, async (item, index, total) => {
            const task = await (0, objStream_1.readJsonFile)(item);
            processor(task, index, total);
        }, maxItems, pauseMs);
    }
    async function drain(concurrency, processor, maxItems, pauseMs) {
        let fileNames = await fs_1.default.promises.readdir(queuePath);
        if (workItemFilter) {
            fileNames = await workItemFilter(queuePath, fileNames);
        }
        if (maxItems && maxItems > 0) {
            fileNames = fileNames.slice(0, maxItems);
        }
        const total = fileNames.length;
        let startAt = 0;
        let successCount = 0;
        for (let slice of (0, array_1.slices)(fileNames, concurrency)) {
            startAt = slice.startAt;
            await __1.asyncArray.forEachAsync(slice.value, concurrency, processFile);
            if (pauseMs && pauseMs > 0) {
                await (0, async_1.pause)(pauseMs);
            }
        }
        return successCount;
        async function processFile(fileName, index) {
            const filePath = taskFilePath(fileName);
            try {
                if (isAlreadyProcessed(fileName)) {
                    await moveFileTo(fileName, skippedPath);
                }
                else {
                    await processor(filePath, startAt + index, total);
                    await moveFileTo(fileName, completedPath);
                    ++successCount;
                }
                return;
            }
            catch (err) {
                if (thisQueue.onError) {
                    thisQueue.onError(err);
                }
            }
            // Move to the error folder
            await moveFileTo(fileName, errorPath);
        }
    }
    async function requeue() {
        const completedFiles = await fs_1.default.promises.readdir(completedPath);
        for (const fileName of completedFiles) {
            await moveFileTo(fileName, queuePath, completedPath);
        }
        return completedFiles.length > 0;
    }
    async function requeueErrors() {
        const errorFiles = await fs_1.default.promises.readdir(errorPath);
        for (const fileName of errorFiles) {
            await moveFileTo(fileName, queuePath, errorPath);
        }
        return errorFiles.length > 0;
    }
    function isAlreadyProcessed(fileName) {
        return fs_1.default.existsSync(path_1.default.join(completedPath, fileName));
    }
    async function moveFileTo(fileName, targetDirPath, fromDirPath) {
        const targetFilePath = path_1.default.join(targetDirPath, fileName);
        await (0, objStream_1.removeFile)(targetFilePath);
        await fs_1.default.promises.rename(fromDirPath
            ? path_1.default.join(fromDirPath, fileName)
            : taskFilePath(fileName), targetFilePath);
    }
    function taskFilePath(name) {
        return path_1.default.join(queuePath, name);
    }
}
exports.createWorkQueueFolder = createWorkQueueFolder;
//# sourceMappingURL=workQueue.js.map