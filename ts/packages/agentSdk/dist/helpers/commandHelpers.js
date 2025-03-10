// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export { resolveFlag, getFlagMultiple, getFlagType, } from "./parameterHelpers.js";
function isCommandHandlerNoParams(handler) {
    return handler.parameters === undefined || handler.parameters === false;
}
function getDefaultSubCommand(table) {
    if (typeof table.defaultSubCommand === "string") {
        const defaultSubCommand = table.commands[table.defaultSubCommand];
        if (defaultSubCommand !== undefined &&
            isCommandDescriptorTable(defaultSubCommand)) {
            return undefined;
        }
        return defaultSubCommand;
    }
    return table.defaultSubCommand;
}
function hasCompletion(handlers) {
    if (isCommandDescriptorTable(handlers)) {
        const defaultSubCommand = getDefaultSubCommand(handlers);
        return ((defaultSubCommand !== undefined &&
            hasCompletion(defaultSubCommand)) ||
            Object.values(handlers.commands).some(hasCompletion));
    }
    return handlers.getCompletion !== undefined;
}
export function isCommandDescriptorTable(entry) {
    return entry.commands !== undefined;
}
function getCommandHandler(handlers, commands) {
    let curr = handlers;
    const commandPrefix = [];
    for (const command of commands) {
        commandPrefix.push(command);
        if (!isCommandDescriptorTable(curr)) {
            throw new Error(`Unknown subcommand '${commands.join(" ")}' in '@${commandPrefix.join(" ")}'`);
        }
        const next = curr.commands[command];
        if (next === undefined) {
            throw new Error(`Unknown command '${command}' in '@${commandPrefix.join(" ")}'`);
        }
        curr = next;
    }
    if (!isCommandDescriptorTable(curr)) {
        return curr;
    }
    const defaultSubCommand = getDefaultSubCommand(curr);
    if (defaultSubCommand === undefined) {
        throw new Error(`Command '@${commandPrefix.join(" ")}' requires a subcommand`);
    }
    return defaultSubCommand;
}
export function getCommandInterface(handlers) {
    const commandInterface = {
        getCommands: async () => handlers,
        executeCommand: async (commands, params, context, attachments) => {
            const handler = getCommandHandler(handlers, commands);
            if (isCommandHandlerNoParams(handler)) {
                if (params !== undefined) {
                    throw new Error(`Command '@${commands.join(" ")}' does not accept parameters`);
                }
                await handler.run(context, undefined, attachments);
                return;
            }
            else {
                if (params === undefined) {
                    throw new Error(`Command '@${commands.join(" ")}' expects parameters`);
                }
                await handler.run(context, params, attachments);
            }
        },
    };
    if (hasCompletion(handlers)) {
        commandInterface.getCommandCompletion = async (commands, params, names, context) => {
            const handler = getCommandHandler(handlers, commands);
            return handler.getCompletion?.(context, params, names) ?? [];
        };
    }
    return commandInterface;
}
//# sourceMappingURL=commandHelpers.js.map