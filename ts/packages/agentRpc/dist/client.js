// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createRpc } from "./rpc.js";
function createContextMap() {
    let nextContextId = 0;
    let contextIdMap = new Map();
    let contextMap = new Map();
    function getId(context) {
        let contextId = contextIdMap.get(context);
        if (contextId === undefined) {
            contextId = nextContextId++;
            contextIdMap.set(context, contextId);
            contextMap.set(contextId, context);
        }
        return contextId;
    }
    function get(contextId) {
        const context = contextMap.get(contextId);
        if (context === undefined) {
            throw new Error(`Internal error: Invalid contextId ${contextId}${contextId < nextContextId ? " used out of scope" : ""}`);
        }
        return context;
    }
    function close(context) {
        const contextId = contextIdMap.get(context);
        if (contextId !== undefined) {
            contextIdMap.delete(context);
            contextMap.delete(contextId);
        }
    }
    return {
        getId,
        get,
        close,
    };
}
export async function createAgentRpcClient(name, channelProvider) {
    const channel = channelProvider.createChannel(name);
    const agentInterface = await new Promise((resolve, reject) => {
        channel.once("message", (message) => {
            if (message.type === "initialized") {
                resolve(message.agentInterface);
            }
            else {
                reject(new Error(`Unexpected message: ${JSON.stringify(message)}`));
            }
        });
    });
    const contextMap = createContextMap();
    function getContextParam(context) {
        return {
            contextId: contextMap.getId(context),
            hasInstanceStorage: context.instanceStorage !== undefined,
            hasSessionStorage: context.sessionStorage !== undefined,
            agentContextId: context.agentContext?.contextId,
        };
    }
    const actionContextMap = createContextMap();
    function withActionContext(actionContext, fn) {
        try {
            return fn({
                actionContextId: actionContextMap.getId(actionContext),
                ...getContextParam(actionContext.sessionContext),
            });
        }
        finally {
            actionContextMap.close(actionContext);
        }
    }
    async function withActionContextAsync(actionContext, fn) {
        try {
            return await fn({
                actionContextId: actionContextMap.getId(actionContext),
                ...getContextParam(actionContext.sessionContext),
            });
        }
        finally {
            actionContextMap.close(actionContext);
        }
    }
    function getStorage(param, context) {
        const storage = param.session
            ? context.sessionStorage
            : context.instanceStorage;
        if (storage === undefined) {
            throw new Error("Storage not available");
        }
        return storage;
    }
    const agentContextInvokeHandlers = {
        toggleTransientAgent: async (param) => {
            const context = contextMap.get(param.contextId);
            return context.toggleTransientAgent(param.name, param.enable);
        },
        addDynamicAgent: async (param) => {
            const context = contextMap.get(param.contextId);
            try {
                await context.addDynamicAgent(param.name, param.manifest, await createAgentRpcClient(param.name, channelProvider));
            }
            catch (e) {
                // Clean up the channel if adding the agent fails
                channelProvider.deleteChannel(param.name);
                throw e;
            }
        },
        removeDynamicAgent: async (param) => {
            const context = contextMap.get(param.contextId);
            await context.removeDynamicAgent(param.name);
            channelProvider.deleteChannel(param.name);
        },
        storageRead: async (param) => {
            const context = contextMap.get(param.contextId);
            return getStorage(param, context).read(param.storagePath, param.options);
        },
        storageWrite: async (param) => {
            const context = contextMap.get(param.contextId);
            return getStorage(param, context).write(param.storagePath, param.data);
        },
        storageList: async (param) => {
            const context = contextMap.get(param.contextId);
            return getStorage(param, context).list(param.storagePath, param.options);
        },
        storageExists: async (param) => {
            const context = contextMap.get(param.contextId);
            return getStorage(param, context).exists(param.storagePath);
        },
        storageDelete: async (param) => {
            const context = contextMap.get(param.contextId);
            return getStorage(param, context).delete(param.storagePath);
        },
        tokenCacheRead: async (param) => {
            const context = contextMap.get(param.contextId);
            const storage = getStorage(param, context);
            return (await storage.getTokenCachePersistence()).load();
        },
        tokenCacheWrite: async (param) => {
            const context = contextMap.get(param.contextId);
            const storage = getStorage(param, context);
            return (await storage.getTokenCachePersistence()).save(param.token);
        },
    };
    const agentContextCallHandlers = {
        notify: (param) => {
            contextMap.get(param.contextId).notify(param.event, param.message);
        },
        setDisplay: (param) => {
            actionContextMap
                .get(param.actionContextId)
                .actionIO.setDisplay(param.content);
        },
        appendDiagnosticData: (param) => {
            actionContextMap
                .get(param.actionContextId)
                .actionIO.appendDiagnosticData(param.data);
        },
        appendDisplay: (param) => {
            actionContextMap
                .get(param.actionContextId)
                .actionIO.appendDisplay(param.content, param.mode);
        },
        takeAction: (param) => {
            actionContextMap
                .get(param.actionContextId)
                .actionIO.takeAction(param.action, param.data);
        },
    };
    const rpc = createRpc(channel, agentContextInvokeHandlers, agentContextCallHandlers);
    // The shim needs to implement all the APIs regardless whether the actual agent
    // has that API.  We remove remove it the one that is not necessary below.
    const agent = {
        initializeAgentContext() {
            return rpc.invoke("initializeAgentContext", undefined);
        },
        updateAgentContext(enable, context, schemaName) {
            return rpc.invoke("updateAgentContext", {
                ...getContextParam(context),
                enable,
                schemaName,
            });
        },
        executeAction(action, context) {
            return withActionContextAsync(context, (contextParams) => rpc.invoke("executeAction", {
                ...contextParams,
                action,
            }));
        },
        validateWildcardMatch(action, context) {
            return rpc.invoke("validateWildcardMatch", {
                ...getContextParam(context),
                action,
            });
        },
        streamPartialAction(actionName, name, value, delta, context) {
            return withActionContext(context, (contextParams) => rpc.send("streamPartialAction", {
                ...contextParams,
                actionName,
                name,
                value,
                delta,
            }));
        },
        getDynamicDisplay(type, displayId, context) {
            return rpc.invoke("getDynamicDisplay", {
                ...getContextParam(context),
                type,
                displayId,
            });
        },
        closeAgentContext(context) {
            return rpc.invoke("closeAgentContext", getContextParam(context));
        },
        getCommands(context) {
            return rpc.invoke("getCommands", getContextParam(context));
        },
        getCommandCompletion(commands, params, names, context) {
            return rpc.invoke("getCommandCompletion", {
                ...getContextParam(context),
                commands,
                params,
                names,
            });
        },
        executeCommand(commands, params, context) {
            return withActionContextAsync(context, (contextParams) => rpc.invoke("executeCommand", {
                ...contextParams,
                commands,
                params,
            }));
        },
        getTemplateSchema(templateName, data, context) {
            return rpc.invoke("getTemplateSchema", {
                ...getContextParam(context),
                templateName,
                data,
            });
        },
        getTemplateCompletion(templateName, data, propertyName, context) {
            return rpc.invoke("getTemplateCompletion", {
                ...getContextParam(context),
                templateName,
                data,
                propertyName,
            });
        },
        getActionCompletion(partialAction, propertyName, context) {
            return rpc.invoke("getActionCompletion", {
                ...getContextParam(context),
                partialAction,
                propertyName,
            });
        },
    };
    // Now pick out the one that is actually implemented
    const result = Object.fromEntries(agentInterface.map((name) => [name, agent[name]]));
    const invokeCloseAgentContext = result.closeAgentContext;
    result.closeAgentContext = async (context) => {
        const result = await invokeCloseAgentContext?.(context);
        contextMap.close(context);
        return result;
    };
    return result;
}
//# sourceMappingURL=client.js.map