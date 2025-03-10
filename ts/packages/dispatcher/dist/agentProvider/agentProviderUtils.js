// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { convertToActionConfig, } from "../translation/actionConfig.js";
import { ActionSchemaFileCache } from "../translation/actionSchemaFileCache.js";
async function getAppAgentManifests(providers) {
    const appAgentConfigs = new Map();
    for (const provider of providers) {
        for (const name of provider.getAppAgentNames()) {
            const manifest = await provider.getAppAgentManifest(name);
            appAgentConfigs.set(name, manifest);
        }
    }
    return appAgentConfigs;
}
async function getActionConfigs(providers) {
    const configs = {};
    const appAgentConfigs = await getAppAgentManifests(providers);
    for (const [name, config] of appAgentConfigs.entries()) {
        convertToActionConfig(name, config, configs);
    }
    return configs;
}
export async function createActionConfigProvider(providers) {
    const actionConfigs = await getActionConfigs(providers);
    const actionSchemaFileCache = new ActionSchemaFileCache();
    const actionConfigProvider = {
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
            return Object.values(actionConfigs);
        },
        getActionSchemaFileForConfig(actionConfig) {
            return actionSchemaFileCache.getActionSchemaFile(actionConfig);
        },
    };
    return actionConfigProvider;
}
export function getSchemaNamesForActionConfigProvider(provider) {
    return provider
        .getActionConfigs()
        .map((actionConfig) => actionConfig.schemaName);
}
//# sourceMappingURL=agentProviderUtils.js.map