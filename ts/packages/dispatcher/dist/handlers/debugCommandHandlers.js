// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import inspector from "node:inspector";
import {
    displayStatus,
    displaySuccess,
    displayWarn,
} from "@typeagent/agent-sdk/helpers/display";
export class DebugCommandHandler {
    constructor() {
        this.description = "Start node inspector";
        this.debugging = false;
    }
    async run(context) {
        if (this.debugging) {
            displayWarn("Node inspector already started.", context);
            return;
        }
        displayStatus("Waiting for debugger to attach", context);
        inspector.open(undefined, undefined, true);
        this.debugging = true;
        displaySuccess("Debugger attached", context);
    }
}
//# sourceMappingURL=debugCommandHandlers.js.map
