// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import registerDebug from "debug";
const debug = registerDebug("typeagent:rpc");
const debugError = registerDebug("typeagent:rpc:error");
export function createRpc(transport, invokeHandlers, callHandlers) {
    const pending = new Map();
    const cb = (message) => {
        debug("message", message);
        if (isCallMessage(message)) {
            const f = callHandlers?.[message.name];
            if (f === undefined) {
                debugError("No call handler", message);
            } else {
                f(message.param);
            }
            return;
        }
        if (isInvokeMessage(message)) {
            const f = invokeHandlers?.[message.name];
            if (f === undefined) {
                transport.send({
                    type: "invokeError",
                    callId: message.callId,
                    error: "No invoke handler",
                });
            } else {
                f(message.param).then(
                    (result) => {
                        transport.send({
                            type: "invokeResult",
                            callId: message.callId,
                            result,
                        });
                    },
                    (error) => {
                        transport.send({
                            type: "invokeError",
                            callId: message.callId,
                            error: error.message,
                        });
                    },
                );
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
        } else {
            r.reject(new Error(message.error));
        }
    };
    transport.on("message", cb);
    transport.once("disconnect", () => {
        debugError("disconnect");
        transport.off("message", cb);
        const errorFunc = () => {
            throw new Error("Agent process disconnected");
        };
        for (const r of pending.values()) {
            r.reject(new Error("Agent process disconnected"));
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
                transport.send(message, (err) => {
                    if (err !== null) {
                        reject(err);
                    }
                });
                pending.set(message.callId, { resolve, reject });
            });
        },
        send: (name, param) => {
            const message = {
                type: "call",
                callId: nextCallId++,
                name,
                param,
            };
            transport.send(message);
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
