"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuery = exports.searchImages = exports.searchWeb = exports.createBingSearch = exports.apiSettingsFromEnv = exports.EnvVars = void 0;
const typechat_1 = require("typechat");
const restClient_1 = require("./restClient");
const common_1 = require("./common");
var EnvVars;
(function (EnvVars) {
    EnvVars["BING_API_KEY"] = "BING_API_KEY";
})(EnvVars || (exports.EnvVars = EnvVars = {}));
function apiSettingsFromEnv(env) {
    env ??= process.env;
    return {
        apiKey: (0, common_1.getEnvSetting)(env, EnvVars.BING_API_KEY),
    };
}
exports.apiSettingsFromEnv = apiSettingsFromEnv;
/**
 * Create a Bing Search client. Requires a Bing API key.
 * If no API key provided in settings, tries to load BING_API_KEY from environment.
 * If no API key available, returns an error.
 * @param settings Api Settings. If not supplied, initialized from Environment
 * @returns Bing client if success, else error.
 */
async function createBingSearch(settings) {
    try {
        settings ??= apiSettingsFromEnv();
    }
    catch (e) {
        return (0, typechat_1.error)(`Could not create Bing Client:\n${e}`);
    }
    const baseUrl = "https://api.bing.microsoft.com/v7.0";
    const webEndpoint = baseUrl + "/search";
    const imageEndpoint = baseUrl + "/images/search";
    const headers = createApiHeaders(settings);
    return (0, typechat_1.success)({
        webSearch,
        imageSearch,
        search,
    });
    /**
     *
     * @param query If multiple strings supplied, turns them into an 'OR' by default
     * @param options
     * @returns
     */
    async function webSearch(query, options) {
        const queryText = typeof query === "string" ? query : buildQuery(query, "OR");
        const response = await search(queryText, options, "WebPages");
        if (response.success) {
            const webPages = response.data.webPages?.value ?? [];
            return (0, typechat_1.success)(webPages);
        }
        return response;
    }
    async function imageSearch(query, options) {
        let queryString = "?q=" + encodeURIComponent(query);
        if (options) {
            queryString = optionsToQS(queryString, options);
        }
        const response = await (0, restClient_1.getJson)(headers, imageEndpoint + queryString, settings.maxRetryAttempts, settings.retryPauseMs);
        if (response.success) {
            const searchResponse = response.data;
            return (0, typechat_1.success)(searchResponse.value);
        }
        return response;
    }
    // Types of response filter:
    // https://learn.microsoft.com/en-us/bing/search-apis/bing-web-search/reference/response-objects
    async function search(query, options, responseFilter) {
        let queryString = "?q=" + encodeURIComponent(query);
        if (responseFilter) {
            responseFilter =
                "&responseFilter=" + encodeURIComponent(responseFilter);
        }
        if (options) {
            queryString = optionsToQS(queryString, options);
        }
        const response = await (0, restClient_1.getJson)(headers, webEndpoint + queryString, settings.maxRetryAttempts, settings.retryPauseMs);
        if (response.success) {
            return (0, typechat_1.success)(response.data);
        }
        return response;
    }
    function optionsToQS(query, options) {
        for (const key in options) {
            query = appendNV(query, key, options[key]);
        }
        return query;
    }
}
exports.createBingSearch = createBingSearch;
/**
 * Bing Web Search.
 * REQUIRED: Environment variable: BING_API_KEY
 * @param query query to run
 * @param count number of matches
 * @returns
 */
async function searchWeb(query, count) {
    const options = count ? { count } : undefined;
    // Automatically uses Environment variable: BING_API_KEY
    const clientResult = await createBingSearch();
    if (!clientResult.success) {
        return [];
    }
    const client = clientResult.data;
    const results = await client.webSearch(query, options);
    return results.success ? results.data : [];
}
exports.searchWeb = searchWeb;
/**
 * Bing Image Search.
 * REQUIRED: Environment variable: BING_API_KEY
 * @param query query to run
 * @param count number of matches
 * @returns
 */
async function searchImages(query, count) {
    const options = count ? { count } : undefined;
    // Automatically uses Environment variable: BING_API_KEY
    const clientResult = await createBingSearch();
    if (!clientResult.success) {
        return [];
    }
    const client = clientResult.data;
    const results = await client.imageSearch(query, options);
    return results.success ? results.data : [];
}
exports.searchImages = searchImages;
function buildQuery(queries, operator) {
    if (queries.length === 1) {
        return queries[0];
    }
    let query = "";
    let operatorText = ` ${operator} `;
    for (let i = 0; i < queries.length; ++i) {
        if (i > 0) {
            query += operatorText;
        }
        query += `(${queries[i]})`;
    }
    return query;
}
exports.buildQuery = buildQuery;
function createApiHeaders(settings) {
    return {
        "Ocp-Apim-Subscription-Key": settings.apiKey,
    };
}
function appendNV(text, name, value) {
    if (text.length > 0) {
        text += "&";
    }
    if (value) {
        text += `${name}=${value}`;
    }
    return text;
}
//# sourceMappingURL=bing.js.map