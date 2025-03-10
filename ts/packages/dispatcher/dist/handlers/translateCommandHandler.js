// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { translateRequest } from "./requestCommandHandler.js";
import { displayResult } from "@typeagent/agent-sdk/helpers/display";
import { getColorElapsedString } from "common-utils";
export class TranslateCommandHandler {
    constructor() {
        this.description = "Translate a request";
        this.parameters = {
            args: {
                request: {
                    description: "Request to translate",
                    implicitQuotes: true,
                },
            },
        };
    }
    async run(context, params) {
        const translationResult = await translateRequest(
            params.args.request,
            context,
        );
        if (translationResult) {
            displayResult(
                `${translationResult.requestAction} ${getColorElapsedString(translationResult.elapsedMs)}\n\nJSON:\n${JSON.stringify(translationResult.requestAction.actions, undefined, 2)}`,
                context,
            );
        }
    }
}
//# sourceMappingURL=translateCommandHandler.js.map
