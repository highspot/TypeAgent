// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { printProcessExplanationResult } from "agent-cache";
export class CorrectCommandHandler {
    constructor() {
        this.description = "Correct the last explanation";
        this.parameters = {
            args: {
                correction: {
                    description: "Correction for the last explanation",
                    implicitQuotes: true,
                },
            },
        };
    }
    async run(context, params) {
        const systemContext = context.sessionContext.agentContext;
        if (systemContext.lastRequestAction === undefined) {
            throw new Error("No last request action to correct");
        }
        if (systemContext.lastExplanation === undefined) {
            throw new Error("No last explanation to correct");
        }
        const result = await systemContext.agentCache.correctExplanation(
            systemContext.lastRequestAction,
            systemContext.lastExplanation,
            params.args.correction,
        );
        printProcessExplanationResult(result);
    }
}
//# sourceMappingURL=correctCommandHandler.js.map
