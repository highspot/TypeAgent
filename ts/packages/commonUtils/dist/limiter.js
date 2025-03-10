// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function createLimiter(limit) {
    let current = 0;
    let resolve = undefined;
    let p = undefined;
    return async (callback) => {
        while (current >= limit) {
            if (p === undefined) {
                p = new Promise((res) => (resolve = res));
            }
            await p;
        }
        current++;
        try {
            return await callback();
        }
        finally {
            current--;
            if (resolve !== undefined) {
                resolve();
                resolve = undefined;
                p = undefined;
            }
        }
    };
}
//# sourceMappingURL=limiter.js.map