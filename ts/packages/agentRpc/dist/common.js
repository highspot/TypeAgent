// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import registerDebug from "debug";
const debug = registerDebug("typeagent:rpc");
const debugError = registerDebug("typeagent:rpc:error");
// A generic channel to wrap any transport by providing a send function.
// Returns RpcChannel and functions to trigger `message` and `disconnect` events.
export function createGenericChannel(sendFunc) {
    const data = {
        handlers: {
            message: [],
            disconnect: [],
        },
        once: {
            message: [],
            disconnect: [],
        },
    };
    const channel = {
        on(event, cb) {
            data.handlers[event].push(cb);
        },
        once(event, cb) {
            data.once[event].push(cb);
        },
        off(event, cb) {
            data.handlers[event] = data.handlers[event].filter((h) => h !== cb);
            data.once[event] = data.handlers[event].filter((h) => h !== cb);
        },
        send(message, cb) {
            sendFunc(message, cb);
        },
    };
    const message = (message) => {
        data.handlers.message.forEach((h) => h(message));
        const callbacks = data.once.message;
        data.once.message = [];
        callbacks.forEach((h) => h(message));
    };
    const disconnect = () => {
        data.handlers.disconnect.forEach((h) => h());
        const callbacks = data.once.disconnect;
        data.once.disconnect = [];
        callbacks.forEach((h) => h());
    };
    return {
        message,
        disconnect,
        channel,
    };
}
export function createGenericChannelProvider(sendFunc) {
    const genericSharedChannel = createGenericChannel(sendFunc);
    return {
        ...createChannelProvider(genericSharedChannel.channel),
        message: genericSharedChannel.message,
        disconnect: genericSharedChannel.disconnect,
    };
}
export function createChannelProvider(sharedChannel) {
    const channels = new Map();
    sharedChannel.on("message", (message) => {
        if (message.name === undefined) {
            debugError("Missing channel name in message");
            return;
        }
        const channel = channels.get(message.name);
        if (channel === undefined) {
            debugError(`Invalid channel name ${message.name} in message`);
            return;
        }
        channel.message(message.message);
    });
    sharedChannel.on("disconnect", () => {
        for (const channel of channels.values()) {
            channel.disconnect();
        }
    });
    function createChannel(name) {
        debug(`createChannel ${name}`);
        if (channels.has(name)) {
            throw new Error(`Channel ${name} already exists`);
        }
        const genericChannel = createGenericChannel((message, cb) => {
            sharedChannel.send({
                name,
                message,
            }, cb);
        });
        channels.set(name, genericChannel);
        return genericChannel.channel;
    }
    function deleteChannel(name) {
        debug(`deleteChannel ${name}`);
        if (!channels.delete(name)) {
            throw new Error(`Channel ${name} does not exists`);
        }
    }
    return {
        createChannel,
        deleteChannel,
    };
}
//# sourceMappingURL=common.js.map