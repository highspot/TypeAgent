// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { convertToActionConfig, } from "../translation/agentTranslators.js";
import { createNpmAppAgentProvider, } from "../agentProvider/npmAgentProvider.js";
import { getDispatcherConfig } from "./config.js";
import path from "node:path";
import fs from "node:fs";
import { ActionSchemaFileCache, createSchemaInfoProvider, } from "../translation/actionSchemaFileCache.js";
import { getInstanceDir } from "./userData.js";
let builtinAppAgentProvider;
export function getBuiltinAppAgentProvider() {
    if (builtinAppAgentProvider === undefined) {
        builtinAppAgentProvider = createNpmAppAgentProvider(getDispatcherConfig().agents, import.meta.url);
    }
    return builtinAppAgentProvider;
}
let externalAppAgentsConfig;
function getExternalAgentsConfig(instanceDir) {
    if (externalAppAgentsConfig === undefined) {
        if (fs.existsSync(path.join(instanceDir, "externalAgentsConfig.json"))) {
            externalAppAgentsConfig = JSON.parse(fs.readFileSync(path.join(instanceDir, "externalAgentsConfig.json"), "utf8"));
        }
        else {
            externalAppAgentsConfig = { agents: {} };
        }
    }
    return externalAppAgentsConfig;
}
let externalAppAgentProvider;
function getExternalAppAgentProvider(instanceDir) {
    if (externalAppAgentProvider === undefined) {
        externalAppAgentProvider = createNpmAppAgentProvider(getExternalAgentsConfig(instanceDir).agents, path.join(instanceDir, "externalagents/package.json"));
    }
    return externalAppAgentProvider;
}
export function getDefaultAppAgentProviders() {
    return [
        getBuiltinAppAgentProvider(),
        getExternalAppAgentProvider(getInstanceDir()),
    ];
}
let appAgentConfigs;
async function getDefaultAppAgentManifests() {
    if (appAgentConfigs === undefined) {
        appAgentConfigs = new Map();
        const appAgentProviders = getDefaultAppAgentProviders();
        for (const provider of appAgentProviders) {
            for (const name of provider.getAppAgentNames()) {
                const manifest = await provider.getAppAgentManifest(name);
                appAgentConfigs.set(name, manifest);
            }
        }
    }
    return appAgentConfigs;
}
const actionConfigs = await (async () => {
    const configs = {};
    const appAgentConfigs = await getDefaultAppAgentManifests();
    for (const [name, config] of appAgentConfigs.entries()) {
        convertToActionConfig(name, config, configs);
    }
    return configs;
})();
export function getSchemaNamesFromDefaultAppAgentProviders() {
    return Object.keys(actionConfigs);
}
let actionConfigProvider;
export function getActionConfigProviderFromDefaultAppAgentProviders() {
    if (actionConfigProvider === undefined) {
        const actionSchemaFileCache = new ActionSchemaFileCache();
        actionConfigProvider = {
            tryGetActionConfig(schemaName) {
                return actionConfigs[schemaName];
            },
            getActionConfig(schemaName) {
                const config = actionConfigs[schemaName];
                if (!config) {
                    throw new Error(`Unknown schema name: ${schemaName}`);
                }
                return config;
            },
            getActionConfigs() {
                return Object.entries(actionConfigs);
            },
            getActionSchemaFileForConfig(actionConfig) {
                return actionSchemaFileCache.getActionSchemaFile(actionConfig);
            },
        };
    }
    return actionConfigProvider;
}
export function createSchemaInfoProviderFromDefaultAppAgentProviders() {
    return createSchemaInfoProvider(getActionConfigProviderFromDefaultAppAgentProviders());
}
//# sourceMappingURL=defaultAppProviders.js.map