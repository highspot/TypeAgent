// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Args, Command, Flags } from "@oclif/core";
import { composeTranslatorSchemas } from "common-utils";
import { getAssistantSelectionSchemas, getFullSchemaText, getActionSchema, createActionConfigProvider, getSchemaNamesForActionConfigProvider, } from "agent-dispatcher/internal";
import { getInstanceDir } from "agent-dispatcher/helpers/data";
import { generateSchemaTypeDefinition } from "action-schema";
import { getDefaultAppAgentProviders } from "default-agent-provider";
const provider = await createActionConfigProvider(getDefaultAppAgentProviders(getInstanceDir()));
const schemaNames = getSchemaNamesForActionConfigProvider(provider);
class Schema extends Command {
    async run() {
        const { args, flags } = await this.parse(Schema);
        if (!flags.assistant) {
            if (args.actionName) {
                const actionSchema = getActionSchema({
                    translatorName: args.translator,
                    actionName: args.actionName,
                }, provider);
                if (actionSchema) {
                    console.log(generateSchemaTypeDefinition(actionSchema));
                }
                else {
                    console.error(`Action ${args.actionName} not found in translator ${args.translator}`);
                }
                return;
            }
            console.log(getFullSchemaText(args.translator, provider, flags.active, flags.change, flags.multiple, flags.generated));
        }
        else {
            const schemas = getAssistantSelectionSchemas(schemaNames, provider).map((entry) => entry.schema);
            console.log(composeTranslatorSchemas("AllAssistantSelection", schemas));
        }
    }
}
Schema.description = "Show schema used by translators";
Schema.flags = {
    active: Flags.string({
        description: "Active schemas to include for consideration (inject and inline switch)",
        multiple: true,
    }),
    change: Flags.boolean({
        description: "Include inline change assistant schema",
        default: false,
    }),
    multiple: Flags.boolean({
        description: "Include multiple action schema",
        default: false,
    }),
    assistant: Flags.boolean({
        description: "Show all assistant selection schema",
        default: false,
    }),
    generated: Flags.boolean({
        description: "Generated schema",
        allowNo: true,
        default: true,
    }),
};
Schema.args = {
    translator: Args.string({
        description: "Translator name",
        required: true,
        options: schemaNames,
    }),
    actionName: Args.string({
        description: "Action name",
        required: false,
    }),
};
export default Schema;
//# sourceMappingURL=schema.js.map