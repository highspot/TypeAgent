"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../src/index.js");
const objStream_js_1 = require("../src/objStream.js");
const objectFolder_js_1 = require("../src/storage/objectFolder.js");
const common_js_1 = require("./common.js");
function makeObjects(count) {
    const items = [];
    for (let i = 0; i < count; ++i) {
        items.push({ key: "key" + i, value: "value" + i });
    }
    return items;
}
async function addObjects(folder, objCount) {
    const objects = makeObjects(objCount);
    return await index_js_1.asyncArray.mapAsync(objects, 1, async (o) => folder.put(o));
}
async function ensureStore(folderPath, createNew = true, safeWrites = undefined) {
    if (createNew) {
        await (0, objStream_js_1.removeDir)(folderPath);
    }
    const settings = { safeWrites };
    return await (0, objectFolder_js_1.createObjectFolder)(folderPath, settings);
}
describe("storage.objectFolder", () => {
    const timeoutMs = 1000 * 60 * 5;
    let folder;
    const folderPath = (0, common_js_1.testDirectoryPath)("./data/test/testStore");
    beforeAll(async () => {
        folder = await ensureStore(folderPath, true);
    }, timeoutMs);
    test("idGen", () => {
        const nameGenerator = (0, objectFolder_js_1.createFileNameGenerator)(objectFolder_js_1.generateTimestampString, (name) => true);
        const maxNames = 256;
        let prevName = "";
        for (let i = 0; i < maxNames; ++i) {
            const objFileName = nameGenerator.next().value;
            expect(objFileName).not.toEqual(prevName);
            prevName = objFileName;
        }
    }, timeoutMs);
    test("putAndGet", async () => {
        const obj = {
            key: "Foo",
            value: "Bar",
        };
        const id = await folder.put(obj);
        const loaded = await folder.get(id);
        expect(loaded).toEqual(obj);
    }, timeoutMs);
    test("putMultiple", async () => {
        const objCount = 10;
        const ids = await addObjects(folder, objCount);
        expect(ids.length).toBe(objCount);
    }, timeoutMs);
    test("remove", async () => {
        await folder.clear();
        const size = await folder.size();
        expect(size).toBe(0);
    }, timeoutMs);
    test("readAll", async () => {
        await folder.clear();
        const objCount = 17;
        await addObjects(folder, objCount);
        let countRead = 0;
        for await (const _ of folder.all()) {
            countRead++;
        }
        expect(countRead).toBe(objCount);
    }, timeoutMs);
});
describe("storage.objectFolder.safeWrites", () => {
    const timeoutMs = 1000 * 60 * 5;
    let folder;
    const folderPath = (0, common_js_1.testDirectoryPath)("./data/test/testStoreSafe");
    beforeAll(async () => {
        folder = await ensureStore(folderPath, true, true);
    }, timeoutMs);
    test("putAndGet", async () => {
        const obj = {
            key: "Foo",
            value: "Bar",
        };
        const id = await folder.put(obj);
        let loaded = await folder.get(id);
        expect(loaded).toEqual(obj);
        obj.value = "Goo";
        await folder.put(obj, id);
        loaded = await folder.get(id);
        expect(loaded).toEqual(obj);
        const allIds = await folder.allNames();
        expect(allIds).toHaveLength(1);
    }, timeoutMs);
});
//# sourceMappingURL=storage.objectFolder.spec.js.map