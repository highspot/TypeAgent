// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Args, Command, Flags } from "@oclif/core";
import { createDispatcher } from "agent-dispatcher";
import { createActionConfigProvider, getCacheFactory, getSchemaNamesForActionConfigProvider, } from "agent-dispatcher/internal";
import { getClientId, getInstanceDir } from "agent-dispatcher/helpers/data";
import { getDefaultAppAgentProviders } from "default-agent-provider";
import chalk from "chalk";
import { getChatModelNames } from "aiclient";
import { readFileSync, existsSync } from "fs";
const modelNames = await getChatModelNames();
const instanceDir = getInstanceDir();
const defaultAppAgentProviders = getDefaultAppAgentProviders(instanceDir);
const schemaNames = getSchemaNamesForActionConfigProvider(await createActionConfigProvider(defaultAppAgentProviders));
class RequestCommand extends Command {
    async run() {
        const { args, flags } = await this.parse(RequestCommand);
        const dispatcher = await createDispatcher("cli run request", {
            appAgentProviders: defaultAppAgentProviders,
            agents: {
                schemas: flags.schema,
                actions: flags.schema,
                commands: ["dispatcher"],
            },
            translation: { model: flags.model },
            explainer: flags.explainer
                ? { enabled: true, name: flags.explainer }
                : { enabled: false },
            cache: { enabled: false },
            persistDir: instanceDir,
            dblogging: true,
            clientId: getClientId(),
        });
        await dispatcher.processCommand(`@dispatcher request ${args.request}`, undefined, this.loadAttachment(args.attachment));
        await dispatcher.close();
        // Some background network (like monogo) might keep the process live, exit explicitly.
        process.exit(0);
    }
    loadAttachment(fileName) {
        if (fileName === undefined) {
            return undefined;
        }
        if (!existsSync(fileName)) {
            console.error(chalk.red(`ERROR: The file '${fileName}' does not exist.`));
            throw Error(`ERROR: The file '${fileName}' does not exist.`);
        }
        let retVal = new Array();
        retVal.push(Buffer.from(readFileSync(fileName)).toString("base64"));
        return retVal;
    }
}
RequestCommand.args = {
    request: Args.string({
        description: "Request to translate and get an explanation of the translation",
        required: true,
    }),
    attachment: Args.string({
        description: "A path to a file to attach with the request",
        required: false,
    }),
};
RequestCommand.flags = {
    schema: Flags.string({
        description: "Schema name",
        options: schemaNames,
        multiple: true,
    }),
    explainer: Flags.string({
        description: "Explainer name (defaults to the explainer associated with the translator)",
        options: getCacheFactory().getExplainerNames(),
        required: false,
    }),
    model: Flags.string({
        description: "Translation model to use",
        options: modelNames,
    }),
};
RequestCommand.description = "Translate a request into action and explain it";
RequestCommand.example = [
    `$ <%= config.bin %> <%= command.id %> 'play me some bach'`,
];
export default RequestCommand;
//# sourceMappingURL=request.js.map