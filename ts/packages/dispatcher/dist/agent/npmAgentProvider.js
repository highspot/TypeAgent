// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createRequire } from "module";
import path from "node:path";
import { createAgentProcess } from "./process/agentProcessShim.js";
function patchPaths(manifest, dir) {
    if (manifest.schema) {
        manifest.schema.schemaFile = path.resolve(
            dir,
            manifest.schema.schemaFile,
        );
    }
    if (manifest.subActionManifests) {
        for (const subManfiest of Object.values(manifest.subActionManifests)) {
            patchPaths(subManfiest, dir);
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
async function loadModuleAgent(info, requirePath) {
    const require = getRequire(info, requirePath);
    // file:// is require so that on windows the drive name doesn't get confused with the protocol name for `import()`
    const handlerPath = `file://${require.resolve(`${info.name}/agent/handlers`)}`;
    const execMode =
        info.execMode ?? "separate"; /* ExecutionMode.SeparateProcess */
    if (
        enableExecutionMode() &&
        execMode === "separate" /* ExecutionMode.SeparateProcess */
    ) {
        return createAgentProcess(handlerPath);
    }
    const module = await import(handlerPath);
    if (typeof module.instantiate !== "function") {
        throw new Error(
            `Failed to load module agent ${info.name}: missing 'instantiate' function.`,
        );
    }
    return {
        appAgent: module.instantiate(),
        process: undefined,
        count: 1,
    };
}
async function loadAppAgentManifest(config, requirePath) {
    const appAgents = new Map();
    for (const [name, info] of Object.entries(config)) {
        appAgents.set(name, await loadManifest(info, requirePath));
    }
    return appAgents;
}
export function createNpmAppAgentProvider(configs, requirePath) {
    const moduleAgents = new Map();
    let manifests;
    return {
        getAppAgentNames() {
            return Object.keys(configs);
        },
        async getAppAgentManifest(appAgentName) {
            if (manifests === undefined) {
                manifests = await loadAppAgentManifest(configs, requirePath);
            }
            const manifest = manifests.get(appAgentName);
            if (manifest === undefined) {
                throw new Error(`Invalid app agent: ${appAgentName}`);
            }
            return manifest;
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
            const agent = await loadModuleAgent(config, requirePath);
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
