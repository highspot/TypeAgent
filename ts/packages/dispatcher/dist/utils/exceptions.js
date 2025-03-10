// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function throwEnsureError(e) {
    if (typeof e === "string") {
        throw new Error(e);
    }
    if (typeof e === "object") {
        throw e;
    }
    throw new Error(`Unknown error: ${JSON.stringify(e)}`);
}
export function callEnsureError(fn) {
    try {
        return fn();
    }
    catch (e) {
        throwEnsureError(e);
    }
}
//# sourceMappingURL=exceptions.js.map