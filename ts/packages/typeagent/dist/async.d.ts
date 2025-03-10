import { Result } from "typechat";
/**
 * Call an async function with automatic retry in the case of exceptions
 * @param asyncFn Use closures to pass parameters
 * @param retryMaxAttempts maximum retry attempts. Default is 2
 * @param retryPauseMs Pause between attempts. Default is 1000 ms. Uses exponential backoff
 * @param shouldAbort (Optional) Inspect the error and abort
 * @returns Result<T>
 */
export declare function callWithRetry<T = any>(asyncFn: () => Promise<T>, retryMaxAttempts?: number, retryPauseMs?: number, shouldAbort?: (error: any) => boolean | undefined): Promise<T>;
/**
 * Get a result by calling a function with automatic retry
 * @param asyncFn
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @returns
 */
export declare function getResultWithRetry<T = any>(asyncFn: () => Promise<Result<T>>, retryMaxAttempts?: number, retryPauseMs?: number): Promise<Result<T>>;
/**
 * Pause for given # of ms before resuming async execution
 * @param ms
 * @returns
 */
export declare function pause(ms: number): Promise<void>;
//# sourceMappingURL=async.d.ts.map