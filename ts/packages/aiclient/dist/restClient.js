"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRetryAfterMs = exports.fetchWithRetry = exports.readResponseStream = exports.getBlob = exports.getHtml = exports.getJson = exports.callJsonApi = exports.callApi = void 0;
const typechat_1 = require("typechat");
const debug_1 = __importDefault(require("debug"));
const debugUrl = (0, debug_1.default)("typeagent:rest:url");
const debugHeader = (0, debug_1.default)("typeagent:rest:header");
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
function callApi(headers, url, params, retryMaxAttempts, retryPauseMs, timeout, throttler) {
    const options = {
        method: "POST",
        body: JSON.stringify({
            ...params,
        }),
        headers: {
            "content-type": "application/json",
            ...headers,
        },
    };
    return fetchWithRetry(url, options, retryMaxAttempts, retryPauseMs, timeout, throttler);
}
exports.callApi = callApi;
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
async function callJsonApi(headers, url, params, retryMaxAttempts, retryPauseMs, timeout, throttler) {
    const result = await callApi(headers, url, params, retryMaxAttempts, retryPauseMs, timeout, throttler);
    if (result.success) {
        try {
            return (0, typechat_1.success)(await result.data.json());
        }
        catch (e) {
            return (0, typechat_1.error)(`callJsonApi(): .json(): ${e.message}`);
        }
    }
    return result;
}
exports.callJsonApi = callJsonApi;
/**
 * Get Json from a url
 * @param headers
 * @param url
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @param timeout
 * @returns
 */
async function getJson(headers, url, retryMaxAttempts, retryPauseMs, timeout) {
    const options = {
        method: "GET",
        headers: {
            "content-type": "application/json",
            ...headers,
        },
    };
    const result = await fetchWithRetry(url, options, retryMaxAttempts, retryPauseMs, timeout);
    if (result.success) {
        return (0, typechat_1.success)(await result.data.json());
    }
    return result;
}
exports.getJson = getJson;
/**
 * Get Html from a url
 * @param url
 * @param retryMaxAttempts
 * @param retryPauseMs
 * @param timeout
 * @returns
 */
async function getHtml(url, retryMaxAttempts, retryPauseMs, timeout) {
    const result = await fetchWithRetry(url, undefined, retryMaxAttempts, retryPauseMs, timeout);
    if (result.success) {
        return (0, typechat_1.success)(await result.data.text());
    }
    return result;
}
exports.getHtml = getHtml;
async function getBlob(url, retryMaxAttempts, retryPauseMs, timeout) {
    const result = await fetchWithRetry(url, undefined, retryMaxAttempts, retryPauseMs, timeout);
    if (result.success) {
        return (0, typechat_1.success)(await result.data.blob());
    }
    return result;
}
exports.getBlob = getBlob;
/**
 * An iterator that reads a fetch response stream, decodes it and returns text chunks
 * @param response
 */
async function* readResponseStream(response) {
    const reader = response.body?.getReader();
    if (reader) {
        const utf8Decoder = new TextDecoder("utf-8");
        const options = { stream: true };
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const text = utf8Decoder.decode(value, options);
            if (text.length > 0) {
                yield text;
            }
        }
    }
}
exports.readResponseStream = readResponseStream;
async function callFetch(url, options, timeout, throttler) {
    return throttler
        ? throttler(() => fetchWithTimeout(url, options, timeout))
        : fetchWithTimeout(url, options, timeout);
}
async function getErrorMessage(response) {
    let bodyMessage = "";
    try {
        bodyMessage = (await response.json()).error;
        if (typeof bodyMessage === "object") {
            if (bodyMessage.message) {
                bodyMessage = bodyMessage.message;
            }
            else {
                bodyMessage = JSON.stringify(bodyMessage);
            }
        }
    }
    catch (e) { }
    return `${response.status}: ${response.statusText}${bodyMessage ? `: ${bodyMessage}` : ""}`;
}
/**
 * fetch that automatically retries transient Http errors
 * @param url
 * @param options
 * @param retryMaxAttempts (optional) maximum number of retry attempts
 * @param retryPauseMs (optional) # of milliseconds to pause before retrying
 * @param timeout (optional) set custom timeout in milliseconds
 * @returns Response object
 */
async function fetchWithRetry(url, options, retryMaxAttempts, retryPauseMs, timeout, throttler) {
    retryMaxAttempts ??= 3;
    retryPauseMs ??= 1000;
    let retryCount = 0;
    try {
        while (true) {
            const result = await callFetch(url, options, timeout, throttler);
            if (result === undefined) {
                throw new Error("fetch: No response");
            }
            debugHeader(result.status, result.statusText);
            debugHeader(result.headers);
            if (result.status === 200) {
                return (0, typechat_1.success)(result);
            }
            if (!isTransientHttpError(result.status) ||
                retryCount >= retryMaxAttempts) {
                return (0, typechat_1.error)(`fetch error: ${await getErrorMessage(result)}`);
            }
            else if (debugHeader.enabled) {
                debugHeader(await getErrorMessage(result));
            }
            // See if the service tells how long to wait to retry
            const pauseMs = getRetryAfterMs(result, retryPauseMs);
            await sleep(pauseMs);
            retryCount++;
        }
    }
    catch (e) {
        return (0, typechat_1.error)(`fetch error: ${e.cause?.message ?? e.message}`);
    }
}
exports.fetchWithRetry = fetchWithRetry;
/**
 * When servers return a 429, they can include a Retry-After header that says how long the caller
 * should wait before retrying
 * @param result
 * @param defaultValue
 * @returns How many milliseconds to pause before retrying
 */
function getRetryAfterMs(result, defaultValue) {
    try {
        let pauseHeader = result.headers.get("Retry-After");
        if (pauseHeader !== null) {
            // console.log(`Retry-After: ${pauseHeader}`);
            pauseHeader = pauseHeader.trim();
            if (pauseHeader) {
                let seconds = parseInt(pauseHeader);
                let pauseMs;
                if (isNaN(seconds)) {
                    const retryDate = new Date(pauseHeader);
                    pauseMs = retryDate.getTime() - Date.now(); // Already in ms
                }
                else {
                    pauseMs = seconds * 1000;
                }
                if (pauseMs > 0) {
                    return pauseMs;
                }
            }
        }
    }
    catch (err) {
        console.log(`Failed to parse Retry-After header ${err}`);
    }
    return defaultValue;
}
exports.getRetryAfterMs = getRetryAfterMs;
async function fetchWithTimeout(url, options, timeoutMs) {
    debugUrl(url);
    if (!timeoutMs || timeoutMs <= 0) {
        return fetch(url, options);
    }
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, options
            ? {
                ...options,
                signal: controller.signal,
            }
            : {
                signal: controller.signal,
            });
        return response;
    }
    catch (e) {
        const ex = e;
        if (ex.name && ex.name === "AbortError") {
            throw new Error(`fetch timeout ${timeoutMs}ms`);
        }
        else {
            throw e;
        }
    }
    finally {
        clearTimeout(id);
    }
}
var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["TooManyRequests"] = 429] = "TooManyRequests";
    HttpStatusCode[HttpStatusCode["InternalServerError"] = 500] = "InternalServerError";
    HttpStatusCode[HttpStatusCode["BadGateway"] = 502] = "BadGateway";
    HttpStatusCode[HttpStatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpStatusCode[HttpStatusCode["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpStatusCode || (HttpStatusCode = {}));
/**
 * Returns true of the given HTTP status code represents a transient error.
 */
function isTransientHttpError(code) {
    switch (code) {
        case HttpStatusCode.TooManyRequests:
        case HttpStatusCode.InternalServerError:
        case HttpStatusCode.BadGateway:
        case HttpStatusCode.ServiceUnavailable:
        case HttpStatusCode.GatewayTimeout:
            return true;
    }
    return false;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=restClient.js.map