"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.pause = exports.getResultWithRetry = exports.callWithRetry = void 0;
/**
 * Call an async function with automatic retry in the case of exceptions
 * @param asyncFn Use closures to pass parameters
 * @param retryMaxAttempts maximum retry attempts. Default is 2
 * @param retryPauseMs Pause between attempts. Default is 1000 ms. Uses exponential backoff
 * @param shouldAbort (Optional) Inspect the error and abort
 * @returns Result<T>
 */
async function callWithRetry(asyncFn, retryMaxAttempts = 2, retryPauseMs = 1000, shouldAbort) {
    let retryCount = 0;
    while (true) {
        try {
            return await asyncFn();
        }
        catch (e) {
            if (retryCount >= retryMaxAttempts ||
                (shouldAbort && shouldAbort(e))) {
                throw e;
            }
        }
        await pause(retryPauseMs);
        retryCount++;
        retryPauseMs *= 2; // Use exponential backoff for retries
    }
}
exports.callWithRetry = callWithRetry;
/**
 * Get a result by calling a function with automatic retry
 * @param asyncFn
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @returns
 */
async function getResultWithRetry(asyncFn, retryMaxAttempts = 2, retryPauseMs = 1000) {
    let retryCount = 0;
    while (true) {
        const result = await asyncFn();
        if (result.success || retryCount >= retryMaxAttempts) {
            return result;
        }
        await pause(retryPauseMs);
        retryCount++;
        retryPauseMs *= 2; // Use exponential backoff for retries
    }
}
exports.getResultWithRetry = getResultWithRetry;
/**
 * Pause for given # of ms before resuming async execution
 * @param ms
 * @returns
 */
function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.pause = pause;
//# sourceMappingURL=async.js.map