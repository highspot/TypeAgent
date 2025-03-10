// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createDatabase } from "../src/sqlite/common.js";
import { ensureTestDir, testFilePath } from "./testCore.js";
import { createKeyValueTable } from "../src/sqlite/keyValueTable.js";
describe("sqlite.keyValueTable", () => {
    const testTimeout = 1000 * 60 * 5;
    let db;
    beforeAll(async () => {
        await ensureTestDir();
        db = await createDatabase(testFilePath("kvIndex.db"), true);
    });
    afterAll(() => {
        if (db) {
            db.close();
        }
    });
    test("string_string", async () => {
        const index = createKeyValueTable(db, "string_string", "TEXT", "TEXT");
        const idsForKey = makeStringIds(4, 4);
        const maxK = 4;
        for (let k = 0; k < maxK; ++k) {
            await index.put(idsForKey[k], k.toString());
        }
        verifyTable(index, maxK, idsForKey);
    }, testTimeout);
    test("string_number", async () => {
        const index = createKeyValueTable(db, "string_number", "TEXT", "INTEGER");
        7;
        const idsForKey = makeNumberIds(4, 4);
        const maxK = 4;
        for (let k = 0; k < maxK; ++k) {
            await index.put(idsForKey[k], k.toString());
        }
        verifyTable(index, maxK, idsForKey);
    }, testTimeout);
    test("number_number", async () => {
        const index = createKeyValueTable(db, "number_number", "INTEGER", "INTEGER");
        7;
        const idsForKey = makeNumberIds(4, 4);
        const maxK = 4;
        for (let k = 0; k < maxK; ++k) {
            await index.put(idsForKey[k], k);
        }
        verifyTable(index, maxK, idsForKey);
    }, testTimeout);
    async function verifyTable(index, maxK, idsForKey) {
        for (let k = 0; k < maxK; ++k) {
            const ids = await index.get(k.toString());
            expect(ids).toBeDefined();
            if (ids) {
                let expectedIds = idsForKey[k];
                expect(ids.length).toEqual(idsForKey[k].length);
                for (let v = 0; v < ids.length; ++v) {
                    expect(ids[v]).toEqual(expectedIds[v]);
                }
            }
        }
    }
    function makeStringIds(keyCount, valueCount) {
        let kv = [];
        for (let k = 0; k < keyCount; ++k) {
            kv.push(makeIds(k, valueCount));
        }
        return kv;
        function makeIds(k, count) {
            let values = [];
            for (let v = 0; v < 4; ++v) {
                values.push(`${k}_${v}`);
            }
            return values;
        }
    }
    function makeNumberIds(keyCount, valueCount) {
        let kv = [];
        for (let k = 0; k < keyCount; ++k) {
            kv.push(makeIds(k, valueCount));
        }
        return kv;
        function makeIds(k, count) {
            let values = [];
            for (let v = 0; v < 4; ++v) {
                values.push(k * 1000 + v);
            }
            return values;
        }
    }
});
//# sourceMappingURL=sqlite.keyValueTable.spec.js.map