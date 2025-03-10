// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import {
    convertToActionConfig,
    getAppAgentName,
} from "../translation/agentTranslators.js";
import { createSessionContext } from "../action/actionHandlers.js";
import registerDebug from "debug";
import { DispatcherName } from "../handlers/common/interactiveIO.js";
import { ActionSchemaSementicMap } from "../translation/actionSchemaSemanticMap.js";
import { ActionSchemaFileCache } from "../translation/actionSchemaFileCache.js";
import path from "path";
import { callEnsureError } from "../utils/exceptions.js";
const debug = registerDebug("typeagent:dispatcher:agents");
const debugError = registerDebug("typeagent:dispatcher:agents:error");
// For force, if the option kind is null or the app agent value is null or missing, default to false.
// For overrides, if the options kind or app agent value is null, use the agent default.
// If it is missing, then either use the default value based on the 'useDefault' parameter, or the current value.
function getEffectiveValue(
    force,
    overrides,
    kind,
    name,
    useDefault,
    defaultValue,
    currentValue,
) {
    const forceState = force?.[kind];
    if (forceState !== undefined) {
        // false if forceState is null or the value is missing.
        return forceState?.[name] ?? false;
    }
    const enabled = overrides?.[kind]?.[name];
    if (enabled === undefined) {
        return useDefault ? defaultValue : currentValue;
    }
    // null means default value
    return enabled ?? defaultValue;
}
function computeStateChange(
    force,
    overrides,
    kind,
    name,
    useDefault,
    defaultEnabled,
    currentEnabled,
    failed,
) {
    const alwaysEnabled = alwaysEnabledAgents[kind].includes(name);
    const effectiveEnabled = getEffectiveValue(
        force,
        overrides,
        kind,
        name,
        useDefault,
        defaultEnabled,
        currentEnabled,
    );
    if (alwaysEnabled && !effectiveEnabled) {
        // error message is user explicitly say false. (instead of using "null")
        if (
            force?.[kind]?.[name] === false ||
            overrides?.[kind]?.[name] === false
        ) {
            failed.push([
                name,
                effectiveEnabled,
                new Error(`Cannot disable ${kind} for '${name}'`),
            ]);
        }
    }
    const enable = alwaysEnabled || effectiveEnabled;
    if (enable !== currentEnabled) {
        return enable;
    }
    return undefined;
}
export const alwaysEnabledAgents = {
    schemas: [DispatcherName],
    actions: [DispatcherName],
    commands: ["system"],
};
export class AppAgentManager {
    constructor(cacheDirPath) {
        this.agents = new Map();
        this.actionConfigs = new Map();
        this.injectedSchemaForActionName = new Map();
        this.emojis = {};
        this.transientAgents = {};
        this.actionSchemaFileCache = new ActionSchemaFileCache(
            cacheDirPath
                ? path.join(cacheDirPath, "actionSchemaFileCache.json")
                : undefined,
        );
        try {
            this.actionSementicMap = new ActionSchemaSementicMap();
        } catch (e) {
            if (process.env.NODE_ENV !== "test") {
                console.log("Failed to create action semantic map", e);
            }
        }
    }
    getAppAgentNames() {
        return Array.from(this.agents.keys());
    }
    getAppAgentDescription(appAgentName) {
        const record = this.getRecord(appAgentName);
        return record.manifest.description;
    }
    isSchemaEnabled(schemaName) {
        const appAgentName = getAppAgentName(schemaName);
        const record = this.getRecord(appAgentName);
        return record.schemas.has(schemaName);
    }
    isSchemaActive(schemaName) {
        return (
            this.isSchemaEnabled(schemaName) &&
            this.transientAgents[schemaName] !== false
        );
    }
    getActiveSchemas() {
        return this.getSchemaNames().filter((name) =>
            this.isSchemaActive(name),
        );
    }
    isActionActive(schemaName) {
        return (
            this.isActionEnabled(schemaName) &&
            this.transientAgents[schemaName] !== false
        );
    }
    isActionEnabled(schemaName) {
        const appAgentName = getAppAgentName(schemaName);
        const record = this.getRecord(appAgentName);
        return record.actions.has(schemaName);
    }
    isCommandEnabled(appAgentName) {
        const record = this.agents.get(appAgentName);
        return record !== undefined
            ? record.commands && record.appAgent?.executeCommand !== undefined
            : false;
    }
    // Return undefined if we don't know because the agent isn't loaded yet.
    // Return null if the agent doesn't support commands.
    getCommandEnabledState(appAgentName) {
        const record = this.agents.get(appAgentName);
        return record !== undefined && record.appAgent !== undefined
            ? record.appAgent.executeCommand !== undefined
                ? record.commands
                : null
            : undefined;
    }
    getEmojis() {
        return this.emojis;
    }
    async semanticSearchActionSchema(
        request,
        maxMatches = 1,
        filter = (schemaName) => this.isSchemaActive(schemaName),
    ) {
        return this.actionSementicMap?.nearestNeighbors(
            request,
            maxMatches,
            filter,
        );
    }
    async addProvider(provider, actionEmbeddingCache) {
        const semanticMapP = [];
        for (const name of provider.getAppAgentNames()) {
            // TODO: detect duplicate names
            const manifest = await provider.getAppAgentManifest(name);
            this.emojis[name] = manifest.emojiChar;
            // TODO: detect duplicate names
            const actionConfigs = convertToActionConfig(name, manifest);
            const entries = Object.entries(actionConfigs);
            for (const [name, config] of entries) {
                debug(`Adding action config: ${name}`);
                this.actionConfigs.set(name, config);
                this.emojis[name] = config.emojiChar;
                const actionSchemaFile =
                    this.actionSchemaFileCache.getActionSchemaFile(config);
                if (this.actionSementicMap) {
                    semanticMapP.push(
                        this.actionSementicMap.addActionSchemaFile(
                            config,
                            actionSchemaFile,
                            actionEmbeddingCache,
                        ),
                    );
                }
                if (config.transient) {
                    this.transientAgents[name] = false;
                }
                if (config.injected) {
                    for (const actionName of actionSchemaFile.actionSchemas.keys()) {
                        this.injectedSchemaForActionName.set(actionName, name);
                    }
                }
            }
            const record = {
                name,
                provider,
                actions: new Set(),
                schemas: new Set(),
                commands: false,
                hasSchemas: entries.length > 0,
                manifest,
            };
            this.agents.set(name, record);
        }
        debug("Waiting for action embeddings");
        await Promise.all(semanticMapP);
        debug("Finish action embeddings");
    }
    getActionEmbeddings() {
        return this.actionSementicMap?.embeddings();
    }
    tryGetActionConfig(mayBeSchemaName) {
        return this.actionConfigs.get(mayBeSchemaName);
    }
    getActionConfig(schemaName) {
        const config = this.tryGetActionConfig(schemaName);
        if (config === undefined) {
            throw new Error(`Unknown schema name: ${schemaName}`);
        }
        return config;
    }
    getSchemaNames() {
        return Array.from(this.actionConfigs.keys());
    }
    getActionConfigs() {
        return Array.from(this.actionConfigs.entries());
    }
    getInjectedSchemaForActionName(actionName) {
        return this.injectedSchemaForActionName.get(actionName);
    }
    getAppAgent(appAgentName) {
        const record = this.getRecord(appAgentName);
        if (record.appAgent === undefined) {
            throw new Error(`App agent ${appAgentName} is not initialized`);
        }
        return record.appAgent;
    }
    getSessionContext(appAgentName) {
        const record = this.getRecord(appAgentName);
        if (record.sessionContext === undefined) {
            throw new Error(
                `Session context for ${appAgentName} is not initialized`,
            );
        }
        return record.sessionContext;
    }
    async setState(context, overrides, force, useDefault = true) {
        const changedSchemas = [];
        const failedSchemas = [];
        const changedActions = [];
        const failedActions = [];
        const changedCommands = [];
        const failedCommands = [];
        const p = [];
        for (const [name, config] of this.actionConfigs) {
            const record = this.getRecord(getAppAgentName(name));
            const enableSchema = computeStateChange(
                force,
                overrides,
                "schemas",
                name,
                useDefault,
                config.translationDefaultEnabled,
                record.schemas.has(name),
                failedSchemas,
            );
            if (enableSchema !== undefined) {
                if (enableSchema) {
                    record.schemas.add(name);
                    changedSchemas.push([name, enableSchema]);
                    debug(`Schema enabled ${name}`);
                } else {
                    record.schemas.delete(name);
                    changedSchemas.push([name, enableSchema]);
                    debug(`Schema disnabled ${name}`);
                }
            }
            const enableAction = computeStateChange(
                force,
                overrides,
                "actions",
                name,
                useDefault,
                config.actionDefaultEnabled,
                record.actions.has(name),
                failedActions,
            );
            if (enableAction !== undefined) {
                p.push(
                    (async () => {
                        try {
                            await this.updateAction(
                                name,
                                record,
                                enableAction,
                                context,
                            );
                            changedActions.push([name, enableAction]);
                        } catch (e) {
                            failedActions.push([name, enableAction, e]);
                        }
                    })(),
                );
            }
        }
        for (const record of this.agents.values()) {
            const enableCommands = computeStateChange(
                force,
                overrides,
                "commands",
                record.name,
                useDefault,
                record.manifest.commandDefaultEnabled ??
                    record.manifest.defaultEnabled ??
                    true,
                record.commands,
                failedCommands,
            );
            if (enableCommands !== undefined) {
                if (enableCommands) {
                    p.push(
                        (async () => {
                            try {
                                await this.ensureSessionContext(
                                    record,
                                    context,
                                );
                                record.commands = true;
                                changedCommands.push([
                                    record.name,
                                    enableCommands,
                                ]);
                                debug(`Command enabled ${record.name}`);
                            } catch (e) {
                                failedCommands.push([
                                    record.name,
                                    enableCommands,
                                    e,
                                ]);
                            }
                        })(),
                    );
                } else {
                    debug(`Command disabled ${record.name}`);
                    record.commands = false;
                    changedCommands.push([record.name, enableCommands]);
                    await this.checkCloseSessionContext(record);
                }
            }
        }
        await Promise.all(p);
        return {
            changed: {
                schemas: changedSchemas,
                actions: changedActions,
                commands: changedCommands,
            },
            failed: {
                actions: failedActions,
                commands: failedCommands,
            },
        };
    }
    getTransientState(schemaName) {
        return this.transientAgents[schemaName];
    }
    toggleTransient(schemaName, enable) {
        if (this.transientAgents[schemaName] === undefined) {
            throw new Error(`Transient sub agent not found: ${schemaName}`);
        }
        debug(
            `Toggle transient agent '${schemaName}' to ${enable ? "enabled" : "disabled"}`,
        );
        this.transientAgents[schemaName] = enable;
    }
    async close() {
        for (const record of this.agents.values()) {
            record.actions.clear();
            record.commands = false;
            await this.closeSessionContext(record);
            if (record.appAgent !== undefined) {
                record.provider.unloadAppAgent(record.name);
            }
            record.appAgent = undefined;
        }
    }
    async updateAction(schemaName, record, enable, context) {
        if (enable) {
            if (record.actions.has(schemaName)) {
                return;
            }
            record.actions.add(schemaName);
            try {
                const sessionContext = await this.ensureSessionContext(
                    record,
                    context,
                );
                await callEnsureError(() =>
                    record.appAgent.updateAgentContext?.(
                        enable,
                        sessionContext,
                        schemaName,
                    ),
                );
            } catch (e) {
                // Rollback if there is a exception
                record.actions.delete(schemaName);
                throw e;
            }
            debug(`Action enabled ${schemaName}`);
        } else {
            if (!record.actions.has(schemaName)) {
                return;
            }
            record.actions.delete(schemaName);
            const sessionContext = await record.sessionContextP;
            try {
                await callEnsureError(() =>
                    record.appAgent.updateAgentContext?.(
                        enable,
                        sessionContext,
                        schemaName,
                    ),
                );
            } finally {
                // Assume that it is disabled even when there is an exception
                debug(`Action disabled ${schemaName}`);
                await this.checkCloseSessionContext(record);
            }
        }
    }
    async ensureSessionContext(record, context) {
        if (record.sessionContextP === undefined) {
            record.sessionContextP = this.initializeSessionContext(
                record,
                context,
            );
        }
        return record.sessionContextP;
    }
    async initializeSessionContext(record, context) {
        const appAgent = await this.ensureAppAgent(record);
        const agentContext = await callEnsureError(() =>
            appAgent.initializeAgentContext?.(),
        );
        record.sessionContext = createSessionContext(
            record.name,
            agentContext,
            context,
        );
        debug(`Session context created for ${record.name}`);
        return record.sessionContext;
    }
    async checkCloseSessionContext(record) {
        if (record.actions.size === 0 && !record.commands) {
            await this.closeSessionContext(record);
        }
    }
    async closeSessionContext(record) {
        if (record.sessionContextP !== undefined) {
            const sessionContext = await record.sessionContextP;
            record.sessionContext = undefined;
            record.sessionContextP = undefined;
            try {
                await record.appAgent.closeAgentContext?.(sessionContext);
                // TODO: unload agent as well?
                debug(`Session context closed for ${record.name}`);
            } catch (e) {
                debugError(
                    `Failed to close session context for ${record.name}. Error ignored`,
                    e,
                );
                // Ignore error
            }
        }
    }
    async ensureAppAgent(record) {
        if (record.appAgent === undefined) {
            record.appAgent = await record.provider.loadAppAgent(record.name);
        }
        return record.appAgent;
    }
    getRecord(appAgentName) {
        const record = this.agents.get(appAgentName);
        if (record === undefined) {
            throw new Error(`Unknown app agent: ${appAgentName}`);
        }
        return record;
    }
    tryGetActionSchemaFile(schemaName) {
        const config = this.tryGetActionConfig(schemaName);
        if (config === undefined) {
            return undefined;
        }
        return this.getActionSchemaFileForConfig(config);
    }
    getActionSchemaFileForConfig(config) {
        return this.actionSchemaFileCache.getActionSchemaFile(config);
    }
}
//# sourceMappingURL=appAgentManager.js.map
