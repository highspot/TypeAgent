// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from "node:fs";
import { installAppProvider, } from "../../commandHandlerContext.js";
import path from "node:path";
import os from "node:os";
import { displayResult } from "@typeagent/agent-sdk/helpers/display";
function expandHome(pathname) {
    if (pathname[0] != "~")
        return pathname;
    return path.join(os.homedir() + pathname.substring(1));
}
export class InstallCommandHandler {
    constructor() {
        this.description = "Install an agent";
        this.parameters = {
            args: {
                name: {
                    description: "Name of the agent",
                    type: "string",
                },
                agent: {
                    description: "Path of agent package directory or tar file to install",
                    type: "string",
                },
            },
        };
    }
    async run(context, params) {
        const systemContext = context.sessionContext.agentContext;
        const installer = systemContext.agentInstaller;
        if (installer === undefined) {
            throw new Error("Agent installer not available");
        }
        const { args } = params;
        const { name, agent } = args;
        const fullPath = path.resolve(expandHome(agent));
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Agent path '${fullPath}' does not exist`);
        }
        const packageJsonPath = path.join(fullPath, "package.json");
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error(`Agent path '${fullPath}' is not a NPM package. Missing 'package.json'`);
        }
        const moduleName = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")).name;
        const provider = installer.install(name, moduleName, fullPath);
        await installAppProvider(systemContext, provider);
        displayResult(`Agent '${name}' installed.`, context);
    }
}
export class UninstallCommandHandler {
    constructor() {
        this.description = "Uninstall an agent";
        this.parameters = {
            args: {
                name: {
                    description: "Name of the agent",
                    type: "string",
                },
            },
        };
    }
    async run(context, params) {
        const systemContext = context.sessionContext.agentContext;
        const installer = systemContext.agentInstaller;
        if (installer === undefined) {
            throw new Error("Agent installer not available");
        }
        const name = params.args.name;
        installer.uninstall(name);
        await systemContext.agents.removeAgent(name);
        displayResult(`Agent '${name}' uninstalled.`, context);
    }
}
//# sourceMappingURL=installCommandHandlers.js.map