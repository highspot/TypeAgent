// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { displayResult } from "@typeagent/agent-sdk/helpers/display";
import { getColorElapsedString } from "common-utils";
import { translateRequest } from "../../../translation/translateRequest.js";
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
        const translationResult = await translateRequest(params.args.request, context);
        if (translationResult) {
            const elapsedStr = getColorElapsedString(translationResult.elapsedMs);
            const usageStr = translationResult.tokenUsage
                ? `(Tokens: ${translationResult.tokenUsage.prompt_tokens} + ${translationResult.tokenUsage.completion_tokens} = ${translationResult.tokenUsage.total_tokens})`
                : "";
            displayResult(`${translationResult.requestAction} ${elapsedStr}${usageStr}\n\nJSON:\n${JSON.stringify(translationResult.requestAction.actions, undefined, 2)}`, context);
        }
    }
}
//# sourceMappingURL=translateCommandHandler.js.map