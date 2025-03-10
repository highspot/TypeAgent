// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Args, Command } from "@oclif/core";
import { readExplanationTestData } from "agent-dispatcher/internal";
class ExplanationDataListCommand extends Command {
    async run() {
        const { args } = await this.parse(ExplanationDataListCommand);
        const data = await readExplanationTestData(args.file);
        for (const entry of data.entries) {
            console.log(entry.request);
        }
    }
}
ExplanationDataListCommand.args = {
    file: Args.file({
        description: "Data file",
        exists: true,
    }),
};
ExplanationDataListCommand.description = "List all requests in the explanation data file";
export default ExplanationDataListCommand;
//# sourceMappingURL=list.js.map