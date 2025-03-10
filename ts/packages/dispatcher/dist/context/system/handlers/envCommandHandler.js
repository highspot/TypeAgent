// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { displayError, displayResult, } from "@typeagent/agent-sdk/helpers/display";
export class EnvCommandHandler {
    constructor() {
        this.description = "Echos environment variables to the user interface.";
    }
    async run(context) {
        const table = [["Variable Name", "Value"]];
        const keys = Object.keys(process.env);
        const values = Object.values(process.env);
        for (let i = 0; i < keys.length; i++) {
            if (values[i] !== undefined) {
                if ((keys[i].toLowerCase().indexOf("key") > -1 &&
                    values[i]?.toLowerCase() != "identity") ||
                    keys[i].toLowerCase().indexOf("secret") > -1) {
                    table.push([keys[i], "__redacted__"]);
                }
                else {
                    table.push([keys[i], values[i]]);
                }
            }
            else {
                table.push([keys[i], ""]);
            }
        }
        displayResult(table, context);
    }
}
export class EnvVarCommandHandler {
    constructor() {
        this.description = "Echos the value of a named environment variable to the user interface";
        this.parameters = {
            args: {
                name: {
                    description: "The name of the environment variable.",
                },
            },
        };
    }
    async run(context, params) {
        if (process.env[params.args.name]) {
            displayResult(process.env[params.args.name], context);
        }
        else {
            displayError(`The environment variable ${params.args.name} does not exist.`, context);
        }
    }
}
export function getEnvCommandHandlers() {
    return {
        description: "Environment variable commands",
        defaultSubCommand: "all",
        commands: {
            all: new EnvCommandHandler(),
            get: new EnvVarCommandHandler(),
        },
    };
}
//# sourceMappingURL=envCommandHandler.js.map