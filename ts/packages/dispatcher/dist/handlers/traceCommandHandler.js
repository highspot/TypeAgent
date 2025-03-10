// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import registerDebug from "debug";
import { displaySuccess } from "@typeagent/agent-sdk/helpers/display";
function toNamespace(regexp) {
    return regexp
        .toString()
        .substring(2, regexp.toString().length - 2)
        .replace(/\.\*\?/g, "*");
}
function getCurrentTraceSettings() {
    return [
        ...registerDebug.names.map(toNamespace),
        ...registerDebug.skips
            .map(toNamespace)
            .map((namespace) => "-" + namespace),
    ];
}
export class TraceCommandHandler {
    constructor() {
        this.description = "Enable or disable trace namespaces";
        this.parameters = {
            flags: {
                clear: {
                    char: "*",
                    description: "Clear all trace namespaces",
                    type: "boolean",
                    default: false,
                },
            },
            args: {
                namespaces: {
                    description: "Namespaces to enable",
                    type: "string",
                    multiple: true,
                    optional: true,
                },
            },
        };
    }
    async run(context, params) {
        if (params.flags.clear) {
            registerDebug.disable();
            displaySuccess("All trace namespaces cleared", context);
        }
        if (params.args.namespaces !== undefined) {
            registerDebug.enable(
                getCurrentTraceSettings()
                    .concat(params.args.namespaces)
                    .join(","),
            );
        }
        displaySuccess(
            `Current trace settings: ${getCurrentTraceSettings().join(",")}`,
            context,
        );
    }
}
//# sourceMappingURL=traceCommandHandler.js.map
