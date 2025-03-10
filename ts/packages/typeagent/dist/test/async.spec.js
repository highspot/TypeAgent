"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const async_1 = require("../src/async");
describe("async", () => {
    const timeoutMs = 1000 * 5 * 60;
    test("callWithRetry", async () => {
        let expectedResult = "Yay";
        let callNumber = 0;
        let callsToFail = 2;
        const result = await (0, async_1.callWithRetry)(async () => api(), 2, 1000);
        expect(result).toBe(expectedResult);
        callNumber = 0;
        callsToFail = 3; // Fail all retries. Make sure exception falls through
        let lastError;
        try {
            await (0, async_1.callWithRetry)(async () => api(), 2, 1000);
        }
        catch (e) {
            lastError = e;
        }
        expect(lastError).toBeDefined();
        async function api() {
            ++callNumber;
            if (callNumber <= callsToFail) {
                throw new Error("Too many requests");
            }
            return expectedResult;
        }
    }, timeoutMs);
});
//# sourceMappingURL=async.spec.js.map