"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../src/lib");
describe("collections.strings", () => {
    test("chunks", () => {
        const strings = [];
        strings.push("1".repeat(10));
        strings.push("2".repeat(10));
        let chunks = [...(0, lib_1.getStringChunks)(strings, 2, 20)];
        expect(chunks).toHaveLength(1);
        expect(totalCharsInChunks(chunks)).toEqual(totalChars(strings));
        strings.push("3".repeat(10));
        chunks = [...(0, lib_1.getStringChunks)(strings, 2, 20)];
        expect(chunks).toHaveLength(2);
        expect(totalCharsInChunks(chunks)).toEqual(totalChars(strings));
        strings.push("4".repeat(7));
        strings.push("5".repeat(7));
        // 44 chars so far
        chunks = [...(0, lib_1.getStringChunks)(strings, 2, 20)];
        expect(chunks).toHaveLength(3);
        expect(totalCharsInChunks(chunks)).toEqual(totalChars(strings));
        chunks = [...(0, lib_1.getStringChunks)(strings, 3, 15)];
        expect(chunks).toHaveLength(4);
        expect(totalCharsInChunks(chunks)).toEqual(totalChars(strings));
        strings.push("6".repeat(1));
        // 45 chars, 6 strings
        chunks = [...(0, lib_1.getStringChunks)(strings, 3, 15)];
        expect(chunks).toHaveLength(4);
        expect(totalCharsInChunks(chunks)).toEqual(totalChars(strings));
        strings.push("7".repeat(5));
        chunks = [...(0, lib_1.getStringChunks)(strings, 3, 15)];
        expect(chunks).toHaveLength(5);
        expect(totalCharsInChunks(chunks)).toEqual(totalChars(strings));
    });
    function totalChars(strings) {
        return strings.reduce((acc, str) => acc + str.length, 0);
    }
    function totalCharsInChunks(chunks) {
        let total = 0;
        for (const chunk of chunks) {
            for (const str of chunk) {
                total += str.length;
            }
        }
        return total;
    }
});
//# sourceMappingURL=lib.strings.spec.js.map