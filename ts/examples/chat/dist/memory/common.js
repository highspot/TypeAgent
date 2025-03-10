// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { askYesNo, parseNamedArguments, } from "interactive-app";
import { asyncArray, dateTime, getFileName, } from "typeagent";
import path from "path";
export async function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function getMessages(cm, maxTurns) {
    return maxTurns !== undefined && maxTurns > 0
        ? await asyncArray.toArray(cm.conversation.messages.entries(), maxTurns)
        : cm.conversation.messages.entries();
}
export async function getMessagesAndCount(cm, maxTurns) {
    const items = await getMessages(cm, maxTurns);
    const count = Array.isArray(items)
        ? items.length
        : await cm.conversation.messages.size();
    return [items, count];
}
export function indexingStatsToCsv(stats) {
    let csv = "";
    if (Array.isArray(stats)) {
        const hasName = stats.some((v) => v.name !== undefined);
        if (hasName) {
            csv += "Name, ";
        }
        csv +=
            "Time Ms, Char Count, Prompt Tokens, Completion Tokens, Total Tokens\n";
        for (const stat of stats) {
            csv += statsToCsv(stat, hasName) + "\n";
        }
    }
    else {
        csv = statsToCsv(stats, stats.name !== undefined);
    }
    return csv;
    function statsToCsv(stats, includeName) {
        let csv = includeName ? `${stats.name}, ` : "";
        csv += `${stats.timeMs},${stats.charCount},`;
        csv += completionStatsToCsv(stats.tokenStats);
        return csv;
    }
}
export function completionStatsToCsv(stats) {
    return `${stats.prompt_tokens},${stats.completion_tokens},${stats.total_tokens}`;
}
export function addFileNameSuffixToPath(sourcePath, suffix) {
    return path.join(path.dirname(sourcePath), getFileName(sourcePath) + suffix);
}
export function argSourceFile(defaultValue) {
    return {
        description: "Path to source file",
        type: "path",
        defaultValue,
    };
}
export function argSourceFolder(defaultValue) {
    return {
        description: "Path to source folder",
        type: "path",
        defaultValue,
    };
}
export function argSourceFileOrFolder(defaultValue) {
    return {
        description: "Path to source file or folder",
        type: "path",
        defaultValue,
    };
}
export function argDestFile(defaultValue) {
    return {
        description: "Path to output file",
        type: "string",
        defaultValue,
    };
}
export function argDestFolder(defaultValue) {
    return {
        description: "Path to destination folder",
        type: "string",
        defaultValue,
    };
}
export function argConcurrency(value) {
    return {
        description: "Concurrency",
        type: "number",
        defaultValue: value,
    };
}
export function argMinScore(value) {
    return {
        description: "Minimum score",
        type: "number",
        defaultValue: value,
    };
}
export function argUniqueMessage(defaultValue = false) {
    return {
        description: "Ensure that this message was not already imported",
        type: "boolean",
        defaultValue,
    };
}
export function argClean(defaultValue = false) {
    return {
        description: "Clean",
        type: "boolean",
        defaultValue,
    };
}
export function argPause(defaultValue = 0) {
    return {
        type: "number",
        defaultValue,
        description: "Pause for given milliseconds after each iteration",
    };
}
export function argChunkSize(defaultValue) {
    return {
        type: "number",
        defaultValue,
        description: "Text chunk size",
    };
}
export function keyValuesFromNamedArgs(args, metadata) {
    const record = {};
    const keys = Object.keys(args);
    for (const key of keys) {
        const value = args[key];
        if (typeof value !== "function") {
            record[key] = value;
        }
    }
    if (metadata !== undefined) {
        if (metadata.args) {
            removeKeysFromRecord(record, Object.keys(metadata.args));
        }
        if (metadata.options) {
            removeKeysFromRecord(record, Object.keys(metadata.options));
        }
    }
    return record;
}
function removeKeysFromRecord(record, keys) {
    for (const key of keys) {
        delete record[key];
    }
}
export function argToDate(value) {
    return value ? dateTime.stringToDate(value) : undefined;
}
export function parseFreeAndNamedArguments(args, argDefs) {
    const namedArgsStartAt = args.findIndex((v) => v.startsWith("--"));
    if (namedArgsStartAt < 0) {
        return [args, parseNamedArguments([], argDefs)];
    }
    return [
        args.slice(0, namedArgsStartAt),
        parseNamedArguments(args.slice(namedArgsStartAt), argDefs),
    ];
}
export function createChatUx(io, inputColor) {
    return {
        showMessage,
        askYesNo: (q) => askYesNo(io, q),
        getInput,
    };
    async function showMessage(message) {
        io.writer.writeLine(message);
    }
    async function getInput(message) {
        if (inputColor) {
            message = inputColor(message);
        }
        return io.readline.question(message + "\n");
    }
}
export function getSearchQuestion(result) {
    if (result.action && result.action.actionName === "getAnswer") {
        const params = result.action.parameters;
        return params.question;
    }
    return undefined;
}
export async function manageConversationAlias(cm, printer, name, alias) {
    const aliases = (await cm.conversation.getEntityIndex()).nameAliases;
    if (name && alias) {
        await aliases.addAlias(alias, name);
    }
    else if (alias) {
        const names = await aliases.getByAlias(alias);
        if (names) {
            printer.writeLines(names);
        }
    }
    else {
        for await (const entry of aliases.entries()) {
            printer.writeLine(entry.name);
            printer.writeList(entry.value, { type: "ul" });
        }
    }
}
//# sourceMappingURL=common.js.map