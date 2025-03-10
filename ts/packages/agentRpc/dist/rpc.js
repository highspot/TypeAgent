// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import registerDebug from "debug";
const debugIn = registerDebug("typeagent:rpc:in");
const debugOut = registerDebug("typeagent:rpc:out");
const debugError = registerDebug("typeagent:rpc:error");
export function createRpc(channel, invokeHandlers, callHandlers) {
    const pending = new Map();
    const out = (message, cbErr) => {
        debugOut(message);
        channel.send(message, cbErr);
    };
    const cb = (message) => {
        debugIn(message);
        if (isCallMessage(message)) {
            const f = callHandlers?.[message.name];
            if (f === undefined) {
                debugError("No call handler", message);
            }
            else {
                f(message.param);
            }
            return;
        }
        if (isInvokeMessage(message)) {
            const f = invokeHandlers?.[message.name];
            if (f === undefined) {
                out({
                    type: "invokeError",
                    callId: message.callId,
                    error: "No invoke handler",
                });
            }
            else {
                f(message.param).then((result) => {
                    out({
                        type: "invokeResult",
                        callId: message.callId,
                        result,
                    });
                }, (error) => {
                    out({
                        type: "invokeError",
                        callId: message.callId,
                        error: error.message,
                    });
                });
            }
            return;
        }
        if (!isInvokeResult(message) && !isInvokeError(message)) {
            return;
        }
        const r = pending.get(message.callId);
        if (r === undefined) {
            debugError("Invalid callId", message);
            return;
        }
        pending.delete(message.callId);
        if (isInvokeResult(message)) {
            r.resolve(message.result);
        }
        else {
            r.reject(new Error(message.error));
        }
    };
    channel.on("message", cb);
    channel.once("disconnect", () => {
        debugError("disconnect");
        channel.off("message", cb);
        const errorFunc = () => {
            throw new Error("Agent channel disconnected");
        };
        for (const r of pending.values()) {
            r.reject(new Error("Agent channel disconnected"));
        }
        pending.clear();
        rpc.invoke = errorFunc;
        rpc.send = errorFunc;
    });
    let nextCallId = 0;
    const rpc = {
        invoke: async function (name, param) {
            const message = {
                type: "invoke",
                callId: nextCallId++,
                name,
                param,
            };
            return new Promise((resolve, reject) => {
                out(message, (err) => {
                    if (err !== null) {
                        reject(err);
                    }
                });
                pending.set(message.callId, { resolve, reject });
            });
        },
        send: (name, param) => {
            out({
                type: "call",
                callId: nextCallId++,
                name,
                param,
            });
        },
    };
    return rpc;
}
function isCallMessage(message) {
    return message.type === "call";
}
function isInvokeMessage(message) {
    return message.type === "invoke";
}
function isInvokeResult(message) {
    return message.type === "invokeResult";
}
function isInvokeError(message) {
    return message.type === "invokeError";
}
//# sourceMappingURL=rpc.js.map