"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAzureTokenProvider = exports.AzureTokenScopes = void 0;
const identity_1 = require("@azure/identity");
const typechat_1 = require("typechat");
var AzureTokenScopes;
(function (AzureTokenScopes) {
    AzureTokenScopes["CogServices"] = "https://cognitiveservices.azure.com/.default";
    AzureTokenScopes["AzureMaps"] = "https://atlas.microsoft.com/.default";
})(AzureTokenScopes || (exports.AzureTokenScopes = AzureTokenScopes = {}));
function createAzureTokenProvider(scope, expirationBufferMs = 5 * 60 * 1000) {
    const credential = new identity_1.DefaultAzureCredential();
    let accessToken;
    let refreshPromise;
    return {
        getAccessToken,
        refreshToken,
    };
    // Function to get the access token
    async function getAccessToken() {
        if (!accessToken || isTokenExpired()) {
            return beginRefresh();
        }
        return (0, typechat_1.success)(accessToken.token);
    }
    async function refreshToken() {
        try {
            const tokenResponse = await credential.getToken(scope);
            tokenResponse.expiresOnTimestamp -= expirationBufferMs;
            accessToken = tokenResponse;
            return (0, typechat_1.success)(accessToken.token);
        }
        catch (e) {
            return (0, typechat_1.error)(`azure token error:\n${e}`);
        }
    }
    // Prevents multiple calls to refresh while one is pending
    function beginRefresh() {
        if (refreshPromise === undefined) {
            refreshPromise = new Promise((resolve) => {
                refreshToken()
                    .then((result) => {
                    resolve(result);
                })
                    .catch((e) => {
                    resolve((0, typechat_1.error)(`refreshToken error ${e}`));
                });
            }).finally(() => {
                refreshPromise = undefined;
            });
        }
        return refreshPromise;
    }
    function isTokenExpired() {
        if (!accessToken) {
            return true;
        }
        const now = Date.now();
        return accessToken.expiresOnTimestamp <= now;
    }
}
exports.createAzureTokenProvider = createAzureTokenProvider;
//# sourceMappingURL=auth.js.map