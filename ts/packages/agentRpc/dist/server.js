// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createRpc } from "./rpc.js";
import { createLimiter } from "common-utils";
export function createAgentRpcServer(name, agent, channelProvider) {
    const channel = channelProvider.createChannel(name);
    const agentInvokeHandlers = {
        async initializeAgentContext() {
            if (agent.initializeAgentContext === undefined) {
                throw new Error("Invalid invocation of initializeAgentContext");
            }
            const agentContext = await agent.initializeAgentContext?.();
            return {
                contextId: registerAgentContext(agentContext),
            };
        },
        async updateAgentContext(param) {
            if (agent.updateAgentContext === undefined) {
                throw new Error(`Invalid invocation of updateAgentContext`);
            }
            return agent.updateAgentContext(param.enable, getSessionContextShim(param), param.schemaName);
        },
        async executeAction(param) {
            if (agent.executeAction === undefined) {
                throw new Error("Invalid invocation of executeAction");
            }
            return agent.executeAction(param.action, getActionContextShim(param));
        },
        async validateWildcardMatch(param) {
            if (agent.validateWildcardMatch === undefined) {
                throw new Error("Invalid invocation of validateWildcardMatch");
            }
            return agent.validateWildcardMatch(param.action, getSessionContextShim(param));
        },
        async getDynamicDisplay(param) {
            if (agent.getDynamicDisplay === undefined) {
                throw new Error("Invalid invocation of getDynamicDisplay");
            }
            return agent.getDynamicDisplay(param.type, param.displayId, getSessionContextShim(param));
        },
        async closeAgentContext(param) {
            const result = await agent.closeAgentContext?.(getSessionContextShim(param));
            unregisterAgentContext(param.agentContextId);
            return result;
        },
        async getCommands(param) {
            if (agent.getCommands === undefined) {
                throw new Error("Invalid invocation of getCommands");
            }
            return agent.getCommands(getSessionContextShim(param));
        },
        async getCommandCompletion(param) {
            if (agent.getCommandCompletion === undefined) {
                throw new Error("Invalid invocation of getCommandCompletion");
            }
            return agent.getCommandCompletion(param.commands, param.params, param.names, getSessionContextShim(param));
        },
        async executeCommand(param) {
            if (agent.executeCommand === undefined) {
                throw new Error("Invalid invocation of executeCommand");
            }
            return agent.executeCommand(param.commands, param.params, getActionContextShim(param));
        },
        async getTemplateSchema(param) {
            if (agent.getTemplateSchema === undefined) {
                throw new Error("Invalid invocation of getTemplateSchema");
            }
            return agent.getTemplateSchema(param.templateName, param.data, getSessionContextShim(param));
        },
        async getTemplateCompletion(param) {
            if (agent.getTemplateCompletion === undefined) {
                throw new Error("Invalid invocation of getTemplateCompletion");
            }
            return agent.getTemplateCompletion(param.templateName, param.data, param.propertyName, getSessionContextShim(param));
        },
        async getActionCompletion(param) {
            if (agent.getActionCompletion === undefined) {
                throw new Error("Invalid invocation of getActionCompletion");
            }
            return agent.getActionCompletion(param.partialAction, param.propertyName, getSessionContextShim(param));
        },
    };
    const agentCallHandlers = {
        async streamPartialAction(param) {
            if (agent.streamPartialAction === undefined) {
                throw new Error("Invalid invocation of streamPartialAction");
            }
            return agent.streamPartialAction(param.actionName, param.name, param.value, param.delta, getActionContextShim(param));
        },
    };
    const rpc = createRpc(channel, agentInvokeHandlers, agentCallHandlers);
    function getStorage(contextId, session) {
        const tokenCachePersistence = {
            load: async () => {
                return rpc.invoke("tokenCacheRead", {
                    contextId,
                    session,
                });
            },
            save: async (token) => {
                return rpc.invoke("tokenCacheWrite", {
                    contextId,
                    session,
                    token,
                });
            },
        };
        return {
            read: (storagePath, options) => {
                return rpc.invoke("storageRead", {
                    contextId,
                    session,
                    storagePath,
                    options,
                });
            },
            write: (storagePath, data) => {
                return rpc.invoke("storageWrite", {
                    contextId,
                    session,
                    storagePath,
                    data,
                });
            },
            list: (storagePath, options) => {
                return rpc.invoke("storageList", {
                    contextId,
                    session,
                    storagePath,
                    options,
                });
            },
            exists: (storagePath) => {
                return rpc.invoke("storageExists", {
                    contextId,
                    session,
                    storagePath,
                });
            },
            delete: (storagePath) => {
                return rpc.invoke("storageDelete", {
                    contextId,
                    session,
                    storagePath,
                });
            },
            getTokenCachePersistence: async () => {
                return tokenCachePersistence;
            },
        };
    }
    function createSessionContextShim(contextId, hasInstanceStorage, hasSessionStorage, context) {
        const dynamicAgentRpcServer = new Map();
        const dynamicAgentLock = createLimiter(1);
        return {
            agentContext: context,
            sessionStorage: hasSessionStorage
                ? getStorage(contextId, true)
                : undefined,
            instanceStorage: hasInstanceStorage
                ? getStorage(contextId, false)
                : undefined,
            notify: (event, message) => {
                rpc.send("notify", {
                    contextId,
                    event,
                    message,
                });
            },
            toggleTransientAgent: async (name, enable) => {
                return rpc.invoke("toggleTransientAgent", {
                    contextId,
                    name,
                    enable,
                });
            },
            addDynamicAgent: async (name, manifest, agent) => 
            // State for dynamic agent needs to be serialized.
            dynamicAgentLock(async () => {
                if (dynamicAgentRpcServer.has(name)) {
                    throw new Error(`Duplicate agent name: ${name}`);
                }
                // Trigger the addDynamicAgent on the client side
                const p = rpc.invoke("addDynamicAgent", {
                    contextId,
                    name,
                    manifest,
                });
                // Create the agent RPC server to send the "initialized" message
                const closeFn = createAgentRpcServer(name, agent, channelProvider);
                try {
                    // Wait for dispatcher to finish adding the agent
                    await p;
                    dynamicAgentRpcServer.set(name, closeFn);
                }
                catch (e) {
                    closeFn();
                    throw e;
                }
            }),
            removeDynamicAgent: async (name) => dynamicAgentLock(async () => {
                const closeFn = dynamicAgentRpcServer.get(name);
                if (closeFn === undefined) {
                    throw new Error(`Invalid agent name: ${name}`);
                }
                try {
                    dynamicAgentRpcServer.delete(name);
                    await rpc.invoke("removeDynamicAgent", {
                        contextId,
                        name,
                    });
                }
                finally {
                    closeFn();
                }
            }),
        };
    }
    let nextAgentContextId = 0;
    const agentContexts = new Map();
    function registerAgentContext(agentContext) {
        const agentContextId = nextAgentContextId++;
        agentContexts.set(agentContextId, agentContext);
        return agentContextId;
    }
    function unregisterAgentContext(agentContextId) {
        agentContexts.delete(agentContextId);
    }
    function getAgentContext(agentContextId) {
        const agentContext = agentContexts.get(agentContextId);
        if (agentContext === undefined) {
            throw new Error(`Invalid agent context ID: ${agentContextId}`);
        }
        return agentContext;
    }
    function getSessionContextShim(param) {
        const { contextId, hasInstanceStorage, hasSessionStorage, agentContextId, } = param;
        if (contextId === undefined) {
            throw new Error("Invalid context param: missing contextId");
        }
        if (hasInstanceStorage === undefined) {
            throw new Error("Invalid context param: missing hasInstanceStorage");
        }
        if (hasSessionStorage === undefined) {
            throw new Error("Invalid context param: missing hasSessionStorage");
        }
        const agentContext = agentContextId !== undefined
            ? getAgentContext(agentContextId)
            : undefined;
        return createSessionContextShim(contextId, hasInstanceStorage, hasSessionStorage, agentContext);
    }
    function getActionContextShim(param) {
        const actionContextId = param.actionContextId;
        if (actionContextId === undefined) {
            throw new Error("Invalid action context param: missing actionContextId");
        }
        const sessionContext = getSessionContextShim(param);
        const actionIO = {
            setDisplay(content) {
                rpc.send("setDisplay", {
                    actionContextId,
                    content,
                });
            },
            appendDiagnosticData(data) {
                rpc.send("appendDiagnosticData", { actionContextId, data });
            },
            appendDisplay(content, mode) {
                rpc.send("appendDisplay", {
                    actionContextId,
                    content,
                    mode,
                });
            },
            takeAction(action, data) {
                rpc.send("takeAction", {
                    actionContextId,
                    action,
                    data,
                });
            },
        };
        return {
            // streamingContext is only used by the agent, so it is not mirrored back to the dispatcher.
            streamingContext: undefined,
            get sessionContext() {
                return sessionContext;
            },
            get actionIO() {
                return actionIO;
            },
        };
    }
    const allAgentInterface = Object.keys(agentInvokeHandlers).concat(Object.keys(agentCallHandlers));
    channel.send({
        type: "initialized",
        agentInterface: allAgentInterface.filter((a) => agent[a] !== undefined ||
            (a === "closeAgentContext" &&
                agent.initializeAgentContext !== undefined)),
    });
    return () => {
        channelProvider.deleteChannel(name);
    };
}
//# sourceMappingURL=server.js.map