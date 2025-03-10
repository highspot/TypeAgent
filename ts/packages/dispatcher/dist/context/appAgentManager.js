// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { convertToActionConfig, } from "../translation/actionConfig.js";
import { getAppAgentName } from "../translation/agentTranslators.js";
import { createSessionContext } from "../execute/actionHandlers.js";
import registerDebug from "debug";
import { DispatcherName } from "./dispatcher/dispatcherUtils.js";
import { ActionSchemaSemanticMap, } from "../translation/actionSchemaSemanticMap.js";
import { ActionSchemaFileCache } from "../translation/actionSchemaFileCache.js";
import path from "path";
import { callEnsureError } from "../utils/exceptions.js";
const debug = registerDebug("typeagent:dispatcher:agents");
const debugError = registerDebug("typeagent:dispatcher:agents:error");
export const appAgentStateKeys = ["schemas", "actions", "commands"];
function computeStateChange(settings, kind, name, defaultEnabled, failed) {
    const alwaysEnabled = alwaysEnabledAgents[kind].includes(name);
    const effectiveEnabled = settings?.[kind]?.[name] ?? defaultEnabled;
    if (alwaysEnabled && !effectiveEnabled) {
        failed.push([
            name,
            effectiveEnabled,
            new Error(`Cannot disable ${kind} for '${name}'`),
        ]);
    }
    return alwaysEnabled || effectiveEnabled;
}
export const alwaysEnabledAgents = {
    schemas: [DispatcherName],
    actions: [DispatcherName],
    commands: ["system"],
};
export class AppAgentManager {
    constructor(cacheDir) {
        this.agents = new Map();
        this.actionConfigs = new Map();
        this.injectedSchemaForActionName = new Map();
        this.emojis = {};
        this.transientAgents = {};
        this.actionSchemaFileCache = new ActionSchemaFileCache(cacheDir
            ? path.join(cacheDir, "actionSchemaFileCache.json")
            : undefined);
        try {
            this.actionSemanticMap = new ActionSchemaSemanticMap();
        }
        catch (e) {
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
    isAppAgentName(appAgentName) {
        return this.agents.get(appAgentName) !== undefined;
    }
    // Throws if schemaName is invalid.
    isSchemaEnabled(schemaName) {
        const appAgentName = getAppAgentName(schemaName);
        const record = this.getRecord(appAgentName);
        return record.schemas.has(schemaName);
    }
    // Throws if schemaName is invalid.
    isSchemaActive(schemaName) {
        return (this.isSchemaEnabled(schemaName) &&
            this.transientAgents[schemaName] !== false);
    }
    getActiveSchemas() {
        return this.getSchemaNames().filter((name) => this.isSchemaActive(name));
    }
    // Throws if schemaName is invalid.
    isActionActive(schemaName) {
        return (this.isActionEnabled(schemaName) &&
            this.transientAgents[schemaName] !== false);
    }
    // Throws if schemaName is invalid.
    isActionEnabled(schemaName) {
        const appAgentName = getAppAgentName(schemaName);
        const record = this.getRecord(appAgentName);
        return record.actions.has(schemaName);
    }
    // Throws if appAgentName is invalid.
    isCommandEnabled(appAgentName) {
        const record = this.getRecord(appAgentName);
        return record.commands && record.appAgent?.executeCommand !== undefined;
    }
    // Return undefined if we don't know because the agent isn't loaded yet.
    // Return null if the agent doesn't support commands.
    // Throws if appAgentName is invalid.
    getCommandEnabledState(appAgentName) {
        const record = this.getRecord(appAgentName);
        return record.appAgent !== undefined
            ? record.appAgent.executeCommand !== undefined
                ? record.commands
                : null
            : undefined;
    }
    getEmojis() {
        return this.emojis;
    }
    async semanticSearchActionSchema(request, maxMatches = 1, filter = (schemaName) => this.isSchemaActive(schemaName)) {
        return this.actionSemanticMap?.nearestNeighbors(request, maxMatches, filter);
    }
    async addProvider(provider, actionEmbeddingCache) {
        const semanticMapP = [];
        for (const name of provider.getAppAgentNames()) {
            // TODO: detect duplicate names
            const manifest = await provider.getAppAgentManifest(name);
            this.addAgentManifest(name, manifest, semanticMapP, provider, actionEmbeddingCache);
        }
        debug("Waiting for action embeddings");
        await Promise.all(semanticMapP);
        debug("Finish action embeddings");
    }
    addAgentManifest(appAgentName, manifest, semanticMapP, provider, actionEmbeddingCache) {
        // TODO: detect duplicate names
        const actionConfigs = convertToActionConfig(appAgentName, manifest);
        const entries = Object.entries(actionConfigs);
        try {
            for (const [schemaName, config] of entries) {
                debug(`Adding action config: ${schemaName}`);
                this.actionConfigs.set(schemaName, config);
                this.emojis[schemaName] = config.emojiChar;
                const actionSchemaFile = this.actionSchemaFileCache.getActionSchemaFile(config);
                if (this.actionSemanticMap) {
                    semanticMapP.push(this.actionSemanticMap.addActionSchemaFile(config, actionSchemaFile, actionEmbeddingCache));
                }
                if (config.transient) {
                    this.transientAgents[schemaName] = false;
                }
                if (config.injected) {
                    for (const actionName of actionSchemaFile.actionSchemas.keys()) {
                        this.injectedSchemaForActionName.set(actionName, schemaName);
                    }
                }
            }
            this.emojis[appAgentName] = manifest.emojiChar;
        }
        catch (e) {
            // Clean up what we did.
            this.cleanupAgent(appAgentName);
            throw e;
        }
        const record = {
            name: appAgentName,
            provider,
            actions: new Set(),
            schemas: new Set(),
            commands: false,
            hasSchemas: entries.length > 0,
            manifest,
        };
        this.agents.set(appAgentName, record);
        return record;
    }
    async addDynamicAgent(appAgentName, manifest, appAgent) {
        if (this.agents.has(appAgentName)) {
            throw new Error(`App agent '${appAgentName}' already exists`);
        }
        // REVIEW: action embedding is not cached.
        const semanticMapP = [];
        const record = this.addAgentManifest(appAgentName, manifest, semanticMapP);
        record.appAgent = appAgent;
        debug("Waiting for action embeddings");
        await Promise.all(semanticMapP);
        debug("Finish action embeddings");
    }
    cleanupAgent(appAgentName) {
        delete this.emojis[appAgentName];
        for (const [schemaName, config] of this.actionConfigs) {
            if (getAppAgentName(schemaName) !== appAgentName) {
                continue;
            }
            delete this.emojis[schemaName];
            this.actionConfigs.delete(schemaName);
            this.actionSchemaFileCache.unloadActionSchemaFile(schemaName);
            this.actionSemanticMap?.removeActionSchemaFile(schemaName);
            if (config.transient) {
                delete this.transientAgents[schemaName];
            }
            if (config.injected) {
                const injectedMap = this.injectedSchemaForActionName;
                for (const [actionName, name] of injectedMap) {
                    if (name === schemaName) {
                        injectedMap.delete(actionName);
                    }
                }
            }
        }
    }
    async removeAgent(appAgentName) {
        const record = this.getRecord(appAgentName);
        this.agents.delete(appAgentName);
        this.cleanupAgent(appAgentName);
        await this.closeSessionContext(record);
        if (record.appAgent !== undefined) {
            record.provider?.unloadAppAgent(record.name);
        }
    }
    getActionEmbeddings() {
        return this.actionSemanticMap?.embeddings();
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
        return Array.from(this.actionConfigs.values());
    }
    getAppAgent(appAgentName) {
        const record = this.getRecord(appAgentName);
        if (record.appAgent === undefined) {
            throw new Error(`App agent' ${appAgentName}' is not initialized`);
        }
        return record.appAgent;
    }
    getSessionContext(appAgentName) {
        const record = this.getRecord(appAgentName);
        if (record.sessionContext === undefined) {
            throw new Error(`Session context for '${appAgentName}' is not initialized`);
        }
        return record.sessionContext;
    }
    async setState(context, settings) {
        const changedSchemas = [];
        const failedSchemas = [];
        const changedActions = [];
        const failedActions = [];
        const changedCommands = [];
        const failedCommands = [];
        const p = [];
        for (const [name, config] of this.actionConfigs) {
            const record = this.getRecord(getAppAgentName(name));
            const enableSchema = computeStateChange(settings, "schemas", name, config.schemaDefaultEnabled, failedSchemas);
            if (enableSchema !== record.schemas.has(name)) {
                if (enableSchema) {
                    record.schemas.add(name);
                    changedSchemas.push([name, enableSchema]);
                    debug(`Schema enabled ${name}`);
                }
                else {
                    record.schemas.delete(name);
                    changedSchemas.push([name, enableSchema]);
                    debug(`Schema disabled ${name}`);
                }
            }
            const enableAction = computeStateChange(settings, "actions", name, config.actionDefaultEnabled, failedActions);
            if (enableAction !== record.actions.has(name)) {
                p.push((async () => {
                    try {
                        await this.updateAction(name, record, enableAction, context);
                        changedActions.push([name, enableAction]);
                    }
                    catch (e) {
                        failedActions.push([name, enableAction, e]);
                    }
                })());
            }
        }
        for (const record of this.agents.values()) {
            const enableCommands = computeStateChange(settings, "commands", record.name, record.manifest.commandDefaultEnabled ??
                record.manifest.defaultEnabled ??
                true, failedCommands);
            if (enableCommands !== record.commands) {
                if (enableCommands) {
                    p.push((async () => {
                        try {
                            await this.ensureSessionContext(record, context);
                            record.commands = true;
                            changedCommands.push([
                                record.name,
                                enableCommands,
                            ]);
                            debug(`Command enabled ${record.name}`);
                        }
                        catch (e) {
                            failedCommands.push([
                                record.name,
                                enableCommands,
                                e,
                            ]);
                        }
                    })());
                }
                else {
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
                schemas: failedSchemas,
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
        debug(`Toggle transient agent '${schemaName}' to ${enable ? "enabled" : "disabled"}`);
        this.transientAgents[schemaName] = enable;
    }
    async close() {
        const closeP = [];
        for (const record of this.agents.values()) {
            closeP.push((async () => {
                record.actions.clear();
                record.commands = false;
                await this.closeSessionContext(record);
                if (record.appAgent !== undefined) {
                    record.provider?.unloadAppAgent(record.name);
                }
                record.appAgent = undefined;
            })());
        }
        await Promise.all(closeP);
    }
    async updateAction(schemaName, record, enable, context) {
        if (enable) {
            if (record.actions.has(schemaName)) {
                return;
            }
            record.actions.add(schemaName);
            try {
                const sessionContext = await this.ensureSessionContext(record, context);
                await callEnsureError(() => record.appAgent.updateAgentContext?.(enable, sessionContext, schemaName));
            }
            catch (e) {
                // Rollback if there is a exception
                record.actions.delete(schemaName);
                throw e;
            }
            debug(`Action enabled ${schemaName}`);
        }
        else {
            if (!record.actions.has(schemaName)) {
                return;
            }
            record.actions.delete(schemaName);
            const sessionContext = await record.sessionContextP;
            try {
                await callEnsureError(() => record.appAgent.updateAgentContext?.(enable, sessionContext, schemaName));
            }
            finally {
                // Assume that it is disabled even when there is an exception
                debug(`Action disabled ${schemaName}`);
                await this.checkCloseSessionContext(record);
            }
        }
    }
    async ensureSessionContext(record, context) {
        if (record.sessionContextP === undefined) {
            record.sessionContextP = this.initializeSessionContext(record, context);
        }
        return record.sessionContextP;
    }
    async initializeSessionContext(record, context) {
        const appAgent = await this.ensureAppAgent(record);
        const agentContext = await callEnsureError(() => appAgent.initializeAgentContext?.());
        record.sessionContext = createSessionContext(record.name, agentContext, context, record.name === "browser");
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
            }
            catch (e) {
                debugError(`Failed to close session context for ${record.name}. Error ignored`, e);
                // Ignore error
            }
        }
    }
    async ensureAppAgent(record) {
        if (record.appAgent === undefined) {
            if (record.provider === undefined) {
                throw new Error(`Internal error: no provider to load the app agent: ${record.name}`);
            }
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
export function getAppAgentStateSettings(settings, agents) {
    if (settings === undefined) {
        return undefined;
    }
    const result = {};
    if (typeof settings === "boolean" || Array.isArray(settings)) {
        const entries = agents
            .getAppAgentNames()
            .map((name) => [
            name,
            typeof settings === "boolean"
                ? settings
                : settings.includes(name),
        ]);
        for (const key of appAgentStateKeys) {
            const state = Object.fromEntries(entries);
            for (const name of alwaysEnabledAgents[key]) {
                if (state[name] === false) {
                    state[name] = true;
                }
            }
            result[key] = state;
        }
        return result;
    }
    for (const key of appAgentStateKeys) {
        const state = settings[key];
        if (state === undefined) {
            continue;
        }
        const alwaysEnabled = alwaysEnabledAgents[key];
        const entries = agents
            .getAppAgentNames()
            .map((name) => [
            name,
            alwaysEnabled.includes(name)
                ? true
                : typeof state === "boolean"
                    ? state
                    : state.includes(name),
        ]);
        result[key] = Object.fromEntries(entries);
    }
    return Object.keys(result).length === 0 ? undefined : result;
}
//# sourceMappingURL=appAgentManager.js.map