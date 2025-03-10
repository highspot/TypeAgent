// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createNpmAppAgentProvider } from "agent-dispatcher/helpers/npmAgentProvider";
import path from "node:path";
import fs from "node:fs";
import { getConfig } from "./utils/config.js";
let builtinAppAgentProvider;
export function getBuiltinAppAgentProvider() {
    if (builtinAppAgentProvider === undefined) {
        builtinAppAgentProvider = createNpmAppAgentProvider(getConfig().agents, import.meta.url);
    }
    return builtinAppAgentProvider;
}
function getExternalAgentsConfigPath(instanceDir) {
    return path.join(instanceDir, "externalAgentsConfig.json");
}
function getExternalAgentsConfig(instanceDir) {
    const configPath = getExternalAgentsConfigPath(instanceDir);
    return fs.existsSync(configPath)
        ? JSON.parse(fs.readFileSync(configPath, "utf8"))
        : { agents: {} };
}
function getExternalAppAgentProvider(instanceDir) {
    return createNpmAppAgentProvider(getExternalAgentsConfig(instanceDir).agents, path.join(instanceDir, "externalagents/package.json"));
}
export function getDefaultAppAgentProviders(instanceDir) {
    const providers = [getBuiltinAppAgentProvider()];
    if (instanceDir !== undefined) {
        providers.push(getExternalAppAgentProvider(instanceDir));
    }
    return providers;
}
// Return installer for external app agent provider
export function getDefaultAppAgentInstaller(instanceDir) {
    return {
        install: (name, moduleName, packagePath) => {
            const config = getExternalAgentsConfig(instanceDir);
            if (config.agents[name] !== undefined) {
                throw new Error(`Agent '${name}' already exists`);
            }
            config.agents[name] = {
                name: moduleName,
                path: packagePath,
            };
            fs.writeFileSync(getExternalAgentsConfigPath(instanceDir), JSON.stringify(config, null, 2));
            return createNpmAppAgentProvider({
                [name]: { name: moduleName, path: packagePath },
            }, path.join(instanceDir, "externalagents/package.json"));
        },
        uninstall: (name) => {
            const config = getExternalAgentsConfig(instanceDir);
            if (config.agents[name] === undefined) {
                throw new Error(`Agent '${name}' not found`);
            }
            delete config.agents[name];
            fs.writeFileSync(getExternalAgentsConfigPath(instanceDir), JSON.stringify(config, null, 2));
        },
    };
}
//# sourceMappingURL=defaultAgentProviders.js.map