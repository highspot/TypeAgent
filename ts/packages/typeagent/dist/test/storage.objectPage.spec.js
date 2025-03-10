"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const objectPage_1 = require("../src/storage/objectPage");
const common_1 = require("./common");
describe("storage.objectHashFolder", () => {
    const timeoutMs = 30000;
    const folderPath = (0, common_1.testDirectoryPath)("./data/test/objectHash");
    test("end2end", async () => {
        const hashFolder = await (0, objectPage_1.createHashObjectFolder)(folderPath, true);
        const values = ["One", "Two", "Three", "Four", "Foo", "Bar"];
        for (const value of values) {
            await hashFolder.put(value, value);
        }
        for (const value of values) {
            const stored = await hashFolder.get(value);
            expect(stored).toEqual(value);
        }
    }, timeoutMs);
    test("numbers", async () => {
        await testNumbers(17);
    }, timeoutMs);
    test("numbersWithCache", async () => {
        await testNumbers(17, 4);
    }, timeoutMs);
    async function testNumbers(numBuckets, cacheSize) {
        const hashFolder = await (0, objectPage_1.createHashObjectFolder)(folderPath, true, numBuckets, {
            cacheSize,
        });
        let count = 256;
        for (let i = 0; i < count; ++i) {
            await hashFolder.put(i.toString(), i);
        }
        await hashFolder.save();
        for (let i = 0; i < count; ++i) {
            const value = await hashFolder.get(i.toString());
            expect(value).toEqual(i);
        }
    }
});
//# sourceMappingURL=storage.objectPage.spec.js.map