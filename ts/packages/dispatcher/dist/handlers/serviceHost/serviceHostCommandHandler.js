// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import chalk from "chalk";
import { fork } from "child_process";
import { getPackageFilePath } from "../../utils/getPackageFilePath.js";
export async function createServiceHost() {
    return new Promise((resolve, reject) => {
        const serviceRoot = getPackageFilePath(
            "./dist/handlers/serviceHost/service.js",
        );
        const childProcess = fork(serviceRoot);
        childProcess.on("message", function (message) {
            if (message === "Success") {
                resolve(childProcess);
            } else {
                resolve(undefined);
            }
        });
    });
}
export function getServiceHostCommandHandlers() {
    return {
        description: "Configure Service Hosting",
        commands: {
            off: {
                description: "Turn off Service hosting integration",
                run: async (context) => {
                    const systemContext = context.sessionContext.agentContext;
                    if (systemContext.serviceHost) {
                        systemContext.serviceHost?.kill();
                        systemContext.serviceHost = undefined;
                    }
                },
            },
            on: {
                description: "Turn on Service hosting integration.",
                run: async (context) => {
                    const systemContext = context.sessionContext.agentContext;
                    if (systemContext.serviceHost) {
                        return;
                    }
                    systemContext.serviceHost = await createServiceHost();
                    console.log(chalk.blue(`Service hosting enabled.`));
                },
            },
        },
    };
}
//# sourceMappingURL=serviceHostCommandHandler.js.map
