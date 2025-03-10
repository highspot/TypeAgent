// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import WebSocket from "isomorphic-ws";
import registerDebug from "debug";
import findConfig from "find-config";
import dotenv from "dotenv";
import fs from "node:fs";
const debug = registerDebug("typeagent:websockets");
export async function createWebSocket(channel, role, clientId) {
    return new Promise((resolve, reject) => {
        let endpoint = "ws://localhost:8080";
        if (process.env["WEBSOCKET_HOST"]) {
            endpoint = process.env["WEBSOCKET_HOST"];
        }
        else {
            const dotEnvPath = findConfig(".env");
            if (dotEnvPath) {
                const vals = dotenv.parse(fs.readFileSync(dotEnvPath));
                if (vals["WEBSOCKET_HOST"]) {
                    endpoint = vals["WEBSOCKET_HOST"];
                }
            }
        }
        endpoint += `?channel=${channel}&role=${role}`;
        if (clientId) {
            endpoint += `&clientId=${clientId}`;
        }
        const webSocket = new WebSocket(endpoint);
        webSocket.onopen = (event) => {
            debug("websocket open");
            resolve(webSocket);
        };
        webSocket.onmessage = (event) => { };
        webSocket.onclose = (event) => {
            debug("websocket connection closed");
            resolve(undefined);
        };
        webSocket.onerror = (event) => {
            debug("websocket error");
            resolve(undefined);
        };
    });
}
export function keepWebSocketAlive(webSocket, source) {
    const keepAliveIntervalId = setInterval(() => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(JSON.stringify({
                source: `${source}`,
                target: "none",
                messageType: "keepAlive",
                body: {},
            }));
        }
        else {
            debug("Clearing keepalive retry interval");
            clearInterval(keepAliveIntervalId);
        }
    }, 20 * 1000);
}
//# sourceMappingURL=webSockets.js.map