/// <reference types="node" />
import { Result } from "typechat";
/**
 * Call an API using a JSON message body
 * @param headers
 * @param url
 * @param params
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @param timeout
 * @returns
 */
export declare function callApi(headers: Record<string, string>, url: string, params: any, retryMaxAttempts?: number, retryPauseMs?: number, timeout?: number, throttler?: FetchThrottler): Promise<Result<Response>>;
/**
 * Call a REST API using a JSON message body
 * Returns a Json response
 * @param headers
 * @param url
 * @param params
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @param timeout
 * @returns
 */
export declare function callJsonApi(headers: Record<string, string>, url: string, params: any, retryMaxAttempts?: number, retryPauseMs?: number, timeout?: number, throttler?: FetchThrottler): Promise<Result<unknown>>;
/**
 * Get Json from a url
 * @param headers
 * @param url
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @param timeout
 * @returns
 */
export declare function getJson(headers: Record<string, string>, url: string, retryMaxAttempts?: number, retryPauseMs?: number, timeout?: number): Promise<Result<unknown>>;
/**
 * Get Html from a url
 * @param url
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @param timeout
 * @returns
 */
export declare function getHtml(url: string, retryMaxAttempts?: number, retryPauseMs?: number, timeout?: number): Promise<Result<string>>;
export declare function getBlob(url: string, retryMaxAttempts?: number, retryPauseMs?: number, timeout?: number): Promise<Result<Blob>>;
/**
 * An iterator that reads a fetch response stream, decodes it and returns text chunks
 * @param response
 */
export declare function readResponseStream(response: Response): AsyncIterableIterator<string>;
export type FetchThrottler = (fn: () => Promise<Response>) => Promise<Response>;
/**
 * fetch that automatically retries transient Http errors
 * @param url
 * @param options
 * @param retryMaxAttempts (optional) maximum number of retry attempts
 * @param retryPauseMs (optional) # of milliseconds to pause before retrying
 * @param timeout (optional) set custom timeout in milliseconds
 * @returns Response object
 */
export declare function fetchWithRetry(url: string, options?: RequestInit, retryMaxAttempts?: number, retryPauseMs?: number, timeout?: number, throttler?: FetchThrottler): Promise<import("typechat").Error | import("typechat").Success<Response>>;
/**
 * When servers return a 429, they can include a Retry-After header that says how long the caller
 * should wait before retrying
 * @param result
 * @param defaultValue
 * @returns How many milliseconds to pause before retrying
 */
export declare function getRetryAfterMs(result: Response, defaultValue: number): number;
//# sourceMappingURL=restClient.d.ts.map