// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createRequire } from "module";
import path from "node:path";
import { createAgentProcess, } from "./process/agentProcessShim.js";
function patchPaths(manifest, dir) {
    if (manifest.schema && typeof manifest.schema.schemaFile === "string") {
        manifest.schema.schemaFile = path.resolve(dir, manifest.schema.schemaFile);
    }
    if (manifest.subActionManifests) {
        for (const subManifest of Object.values(manifest.subActionManifests)) {
            patchPaths(subManifest, dir);
        }
    }
}
function getRequire(info, requirePath) {
    // path.sep at the at is necessary for it to work.
    // REVIEW: adding package.json is necessary for jest-resolve to work in tests for some reason.
    const loadPath = `${info.path ? `${path.resolve(info.path)}${path.sep}package.json` : requirePath}`;
    return createRequire(loadPath);
}
async function loadManifest(info, requirePath) {
    const require = getRequire(info, requirePath);
    const manifestPath = require.resolve(`${info.name}/agent/manifest`);
    const config = require(manifestPath);
    patchPaths(config, path.dirname(manifestPath));
    return config;
}
function enableExecutionMode() {
    return process.env.TYPEAGENT_EXECMODE !== "0";
}
async function loadModuleAgent(info, appAgentName, requirePath) {
    const require = getRequire(info, requirePath);
    // file:// is require so that on windows the drive name doesn't get confused with the protocol name for `import()`
    const handlerPath = `file://${require.resolve(`${info.name}/agent/handlers`)}`;
    const execMode = info.execMode ?? "separate" /* ExecutionMode.SeparateProcess */;
    if (enableExecutionMode() && execMode === "separate" /* ExecutionMode.SeparateProcess */) {
        return createAgentProcess(appAgentName, handlerPath);
    }
    const module = await import(handlerPath);
    if (typeof module.instantiate !== "function") {
        throw new Error(`Failed to load agent '${appAgentName}' package '${info.name}': missing 'instantiate' function.`);
    }
    return {
        appAgent: module.instantiate(),
        process: undefined,
        count: 1,
    };
}
export function createNpmAppAgentProvider(configs, requirePath) {
    const moduleAgents = new Map();
    const manifests = new Map();
    return {
        getAppAgentNames() {
            return Object.keys(configs);
        },
        async getAppAgentManifest(appAgentName) {
            const manifest = manifests.get(appAgentName);
            if (manifest !== undefined) {
                return manifest;
            }
            const config = configs[appAgentName];
            if (config === undefined) {
                throw new Error(`Invalid app agent: ${appAgentName}`);
            }
            const newManifests = await loadManifest(config, requirePath);
            manifests.set(appAgentName, newManifests);
            return newManifests;
        },
        async loadAppAgent(appAgentName) {
            const existing = moduleAgents.get(appAgentName);
            if (existing) {
                existing.count++;
                return existing.appAgent;
            }
            const config = configs[appAgentName];
            if (config === undefined) {
                throw new Error(`Invalid app agent: ${appAgentName}`);
            }
            // Load on demand
            const agent = await loadModuleAgent(config, appAgentName, requirePath);
            moduleAgents.set(appAgentName, agent);
            return agent.appAgent;
        },
        unloadAppAgent(appAgentName) {
            const agent = moduleAgents.get(appAgentName);
            if (!agent) {
                throw new Error(`Invalid app agent: ${appAgentName}`);
            }
            if (--agent.count === 0) {
                agent.process?.kill();
                moduleAgents.delete(appAgentName);
            }
        },
    };
}
//# sourceMappingURL=npmAgentProvider.js.map