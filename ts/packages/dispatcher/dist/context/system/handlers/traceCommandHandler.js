// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import registerDebug from "debug";
import { displaySuccess } from "@typeagent/agent-sdk/helpers/display";
if (registerDebug.inspectOpts !== undefined) {
    const inspectOpts = registerDebug.inspectOpts;
    inspectOpts.maxStringLength = null;
    inspectOpts.maxArrayLength = null;
    inspectOpts.depth = null;
    const formatters = registerDebug.formatters;
    const newFormatters = {
        o: function (v) {
            const self = this;
            self.inspectOpts = { ...registerDebug.inspectOpts };
            return formatters.o.call(this, v);
        },
        O: function (v) {
            const self = this;
            self.inspectOpts = { ...registerDebug.inspectOpts };
            return formatters.O.call(this, v);
        },
    };
    registerDebug.formatters = newFormatters;
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
        let settings = registerDebug.disable();
        if (params.flags.clear) {
            settings = "";
            displaySuccess("All trace namespaces cleared", context);
        }
        if (params.args.namespaces !== undefined) {
            settings = (settings
                ? [settings, ...params.args.namespaces]
                : params.args.namespaces).join(",");
            registerDebug.enable(settings);
        }
        displaySuccess(`Current trace settings: ${settings}`, context);
    }
}
//# sourceMappingURL=traceCommandHandler.js.map