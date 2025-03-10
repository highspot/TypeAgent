// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { openai } from "aiclient";
import { displayHelp } from "interactive-app";
export async function createStudio() {
    const model = openai.createChatModelDefault("schemaStudio");
    const studio = {
        model,
        commands: {
            help,
            "--help": help,
            "--?": help,
        },
    };
    async function help(args, io) {
        displayHelp(args, studio.commands, io);
    }
    help.metadata = "help [commandName]";
    return studio;
}
//# sourceMappingURL=studio.js.map
