"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooleanArg = exports.getNumberArg = exports.getArg = exports.displayCommands = exports.addStandardHandlers = exports.commandHandler = exports.searchCommands = exports.displayHelp = exports.dispatchCommand = exports.createCommand = exports.parseNamedArguments = exports.createNamedArgs = exports.argNum = exports.argBool = exports.arg = exports.parseCommandLine = exports.runConsole = exports.runBatch = void 0;
const fs_1 = __importDefault(require("fs"));
const InteractiveIo_1 = require("./InteractiveIo");
const process_1 = require("process");
const readline_1 = __importDefault(require("readline"));
/**
 * Run batch file app
 * @param settings app settings
 */
async function runBatch(settings) {
    const app = new InteractiveApp((0, InteractiveIo_1.getInteractiveIO)(), settings);
    settings.handlers ??= {};
    settings.handlers.batch = batch;
    settings.handlers.batch.metadata = batchDef();
    process.argv[2] = `${settings.commandPrefix}batch`;
    await app.runApp();
    function batchDef() {
        return {
            description: "Run a batch file",
            args: {
                filePath: {
                    description: "Batch file path.",
                    type: "path",
                },
            },
            options: {
                echo: {
                    description: "Echo on or off",
                    defaultValue: true,
                    type: "boolean",
                },
                commentPrefix: {
                    description: "Comments are prefix by this string",
                    defaultValue: "#",
                },
                logFilePath: {
                    description: "Write commands and results to this file.",
                    type: "path",
                },
            },
        };
    }
    settings.handlers.batch.metadata = batchDef();
    async function batch(args, io) {
        const namedArgs = parseNamedArguments(args, batchDef());
        const lines = (await fs_1.default.promises.readFile(namedArgs.filePath, "utf-8")).split(/\r?\n/);
        for (const line of lines) {
            if (line && !line.startsWith(namedArgs.commentPrefix)) {
                if (namedArgs.echo) {
                    io.writer.writeLine(line);
                }
                if (!(await app.processInput(line))) {
                    break;
                }
                io.writer.writeLine();
            }
        }
    }
}
exports.runBatch = runBatch;
/**
 * Run an interactive Console app
 * @param settings app settings
 */
async function runConsole(settings) {
    const args = process.argv;
    if (getArg(args, 2, "") === "batch") {
        await runBatch(settings);
        (0, process_1.exit)();
    }
    else {
        const app = new InteractiveApp((0, InteractiveIo_1.getInteractiveIO)(), settings);
        await app.runApp();
    }
}
exports.runConsole = runConsole;
/**
 * An Interactive App. You can inherit from this, but typically you just call RunConsole
 */
class InteractiveApp {
    constructor(stdio, settings) {
        this._stdio = stdio;
        this._settings = this.initSettings(settings);
        this.lineReader = this._stdio.readline;
        this.lineReader.setPrompt(this._settings.prompt);
        if (fs_1.default.existsSync("command_history.json")) {
            const history = JSON.parse(fs_1.default.readFileSync("command_history.json", { encoding: "utf-8" }));
            this.lineReader.history = history.commands;
        }
    }
    get stdio() {
        return this._stdio;
    }
    async runApp() {
        const commandLine = this.getCommandLine();
        const hasCommandLine = commandLine && commandLine.length > 0;
        if (!hasCommandLine) {
            this.writeWelcome();
        }
        if (this._settings.onStart) {
            this._settings.onStart(this._stdio);
        }
        if (hasCommandLine) {
            await this.processInput(commandLine);
            (0, process_1.exit)();
        }
        this.lineReader.prompt();
        const lines = [];
        process.stdin.setRawMode(true);
        process.stdin.on("keypress", (_, key) => {
            if (key.name === "escape") {
                // clear the input line
                this.lineReader.write(null, { ctrl: true, name: "u" });
            }
        });
        process.stdin.resume();
        readline_1.default.emitKeypressEvents(process.stdin);
        this.lineReader
            .on("line", async (line) => {
            if (this._settings.multiline) {
                if (!this.isEOLMulti(line)) {
                    lines.push(line);
                    return;
                }
                line = lines.join("\n");
                lines.splice(0);
            }
            if (await this.processInput(line)) {
                this.lineReader.prompt();
            }
            else {
                this.lineReader.close();
            }
        })
            .on("close", () => {
            this.lineReader.close();
            fs_1.default.writeFileSync("command_history.json", JSON.stringify({
                commands: this.lineReader.history,
            }));
        });
    }
    async processInput(line) {
        line = line.trim();
        if (line.length == 0) {
            return true;
        }
        try {
            const cmdLine = this.getCommand(line);
            if (cmdLine) {
                if (this._settings.stopCommands.includes(cmdLine)) {
                    // Done.
                    return false;
                }
                if (this._settings.commandHandler) {
                    await this._settings.commandHandler(cmdLine, this._stdio);
                }
                else if (this._settings.handlers) {
                    await dispatchCommand(cmdLine, this._settings.handlers, this._stdio, true, ["--?"]);
                }
            }
            else {
                await this._settings.inputHandler(line, this._stdio);
            }
        }
        catch (error) {
            this._stdio.writer.writeLine(`${error instanceof Error ? error.message : error}`);
            if (this._settings.stopOnError) {
                return false;
            }
        }
        return true;
    }
    getCommand(line) {
        if (line.startsWith(this._settings.commandPrefix)) {
            const cmd = line
                .substring(this._settings.commandPrefix.length)
                .trim();
            return cmd.length > 0 ? cmd : undefined;
        }
        return undefined;
    }
    isEOLMulti(line) {
        return line.startsWith(this._settings.multilineTerminator);
    }
    initSettings(settings) {
        settings.prompt ??= "🤖> ";
        settings.commandPrefix ??= "@";
        settings.stopCommands ??= ["quit", "exit"];
        settings.multiline ??= false;
        settings.multilineTerminator ??= "@@";
        return settings;
    }
    getCommandLine() {
        const args = process.argv;
        if (args.length > 2) {
            let line = "";
            for (let i = 2; i < args.length; ++i) {
                line += i > 2 ? ` "${args[i]}"` : args[i];
            }
            return line;
        }
        return undefined;
    }
    writeLine(line) {
        this._stdio.stdout.write(line);
        this._stdio.stdout.write("\n");
    }
    writeWelcome() {
        if (this._settings.stopCommands) {
            this._stdio.stdout.write(`Type ${this._settings.stopCommands.map((s) => this._settings.commandPrefix + s).join(" OR ")} to exit.\n`);
        }
        if (this._settings.commandPrefix) {
            this._stdio.stdout.write(`To run a command, prefix its name with: ${this._settings.commandPrefix}\n`);
        }
        if (this._settings.handlers) {
            if (this._settings.handlers.help !== undefined) {
                this.stdio.stdout.write("Type @help to get help on available commands.\n");
            }
        }
    }
}
/**
 * Parse a command line string into an argument array. Supports quoted arguments
 * @param cmdLine command line to parse
 * @returns parsed arguments
 */
function parseCommandLine(cmdLine) {
    const regex = /("[^"]+"|[^"\s]+)/g;
    let args = cmdLine.match(regex);
    if (args) {
        args = args.map((a) => a.replaceAll('"', ""));
    }
    return args;
}
exports.parseCommandLine = parseCommandLine;
function makeArg(description, type, defaultValue) {
    let arg = {
        type,
    };
    if (description) {
        arg.description = description;
    }
    if (defaultValue !== undefined) {
        arg.defaultValue = defaultValue;
    }
    return arg;
}
function arg(description, defaultValue) {
    return makeArg(description, "string", defaultValue);
}
exports.arg = arg;
function argBool(description, defaultValue) {
    return makeArg(description, "boolean", defaultValue == undefined ? false : defaultValue);
}
exports.argBool = argBool;
function argNum(description, defaultValue) {
    return makeArg(description, "number", defaultValue);
}
exports.argNum = argNum;
function createNamedArgs() {
    const namedArgs = {
        value,
        number: (key, required) => value(key, "number", required),
        integer: (key, required) => value(key, "integer", required),
        boolean: (key, required) => value(key, "boolean", required),
        path: (key, required) => value(key, "path", required),
        bind,
        shift,
    };
    return namedArgs;
    function value(key, type, required) {
        let value = namedArgs[key];
        if (value === undefined) {
            if (required) {
                throw Error(`A value for required arg '${key}' was not supplied`);
            }
            return value;
        }
        return convert(key, value, type ?? "string");
    }
    function bind(argDefs, required) {
        for (const key in argDefs) {
            let def = argDefs[key];
            let type = def.type ?? "string";
            let arg = value(key, type, required); // This will do type conversions
            if (arg === undefined) {
                if (def.defaultValue !== undefined) {
                    arg = def.defaultValue;
                }
                else if (required) {
                    throw Error(`${key} requires a ${type} value`);
                }
            }
            namedArgs[key] = arg;
        }
    }
    function convert(key, value, type) {
        try {
            switch (type) {
                default:
                    return typeof value === "string" ? value : String(value);
                case "number":
                    return typeof value === "number" ? value : Number(value);
                case "integer":
                    value = typeof value === "number" ? value : Number(value);
                    if (!Number.isInteger(value)) {
                        throw Error(`integer expected`);
                    }
                    return value;
                case "boolean":
                    return typeof value === "boolean"
                        ? value
                        : value.toLowerCase() === "true";
                case "path":
                    value = typeof value === "string" ? value : String(value);
                    checkPath(value);
                    return value;
            }
        }
        catch (e) {
            throw Error(`Argument ${key}: ${e instanceof Error ? e.message : e}`);
        }
    }
    function shift(key) {
        const value = namedArgs[key];
        if (value) {
            delete namedArgs[key];
        }
        return value;
    }
    function checkPath(value) {
        if (typeof value !== "string" /*|| !fs.existsSync(value)*/) {
            throw Error(`Path ${value} does not exist`);
        }
        return value;
    }
}
exports.createNamedArgs = createNamedArgs;
/**
 * Parse named args, like commandX --option1 A --option2 B
 * @param args
 * @param namePrefix prefix for argNames. Default is --
 * @param shortNamePrefix prefix for short version of argNames. Default is -
 * @returns An JSON object, where property name is the key, and value is the argument value
 */
function parseNamedArguments(args, argDefs, namePrefix = "--", shortNamePrefix = "-") {
    if (typeof args === "object" && !(args instanceof Array)) {
        return args;
    }
    const rawArgs = typeof args === "string" ? parseCommandLine(args) : args;
    let namedArgs = createNamedArgs();
    if (!rawArgs) {
        return namedArgs;
    }
    // First, collect all name, value pairs on the command line
    let name;
    for (const rawArg of rawArgs) {
        var value = rawArg.trim();
        //
        // Names of arguments have a prefix
        //
        if (value.length > namePrefix.length && value.startsWith(namePrefix)) {
            // We have a new name
            name = value.substring(namePrefix.length); // Save the name, awaiting its value
            namedArgs[name] = "";
        }
        else if (value.length === shortNamePrefix.length + 1 &&
            value.startsWith(shortNamePrefix)) {
            name = value.substring(shortNamePrefix.length);
            namedArgs[name] = "";
        }
        else if (name) {
            // A previous name on the stack...assign value to it
            namedArgs[name] = value;
            name = undefined;
        }
        else {
            // We will treat the value as a raw named arg
            namedArgs[value] = "";
        }
    }
    // If argument metadata was provided, bind the arguments...
    if (argDefs) {
        if (argDefs.args) {
            namedArgs.bind(argDefs.args, true);
        }
        if (argDefs.options) {
            namedArgs.bind(argDefs.options, false);
        }
    }
    return namedArgs;
}
exports.parseNamedArguments = parseNamedArguments;
function createCommand(fn, metadata, usage) {
    const handler = fn;
    if (metadata) {
        handler.metadata = metadata;
    }
    if (usage) {
        handler.usage = usage;
    }
    return handler;
}
exports.createCommand = createCommand;
/**
 * Dispatches a commandLine.
 * Splits the command line into command and arguments
 * @param cmdLine command line string
 * @param handlers a table of handlers
 * @param io how handler can perform IO
 * @param caseSensitive If command names are case sensitive
 * @param helpFlags if command args terminate in one of these flags, trigger help. By default, "--?"
 */
async function dispatchCommand(cmdLine, handlers, io, caseSensitive = false, helpFlags) {
    let args = parseCommandLine(cmdLine);
    if (args) {
        let commandName = getArg(args, 0);
        if (commandName === undefined) {
            return;
        }
        commandName = caseSensitive ? commandName : commandName.toLowerCase();
        const handler = handlers[commandName];
        if (handler) {
            // Check if the user asked for help
            const inlineHelpCommand = getInlineHelpCommand(args, caseSensitive, helpFlags);
            if (inlineHelpCommand) {
                const helpHandler = handlers[inlineHelpCommand];
                if (helpHandler) {
                    await helpHandler(args, io);
                    return;
                }
            }
            // Call command
            args.shift();
            const result = await handler(args, io);
            if (result) {
                io.stdout.write(result + "\n");
            }
        }
        else {
            io.stdout.write(`${commandName} not found.\n\n`);
            const [matches, matchCount] = filterCommandsByName(commandName + "*", handlers);
            if (matchCount > 0) {
                displayCommands(matches, io, "Closest matches:");
            }
        }
    }
    function getInlineHelpCommand(args, caseSensitive, helpCommandNames) {
        // Check if the user asked for help
        if (helpCommandNames && args.length > 1) {
            let inlineHelpArg = getArg(args, args.length - 1, "");
            if (inlineHelpArg && inlineHelpArg.length > 0) {
                inlineHelpArg = caseSensitive
                    ? inlineHelpArg
                    : inlineHelpArg.toLowerCase();
                return helpCommandNames.find((h) => h === inlineHelpArg);
            }
        }
        return undefined;
    }
}
exports.dispatchCommand = dispatchCommand;
function displayHelp(args, handlers, io) {
    if (args.length === 0) {
        displayCommands(handlers, io);
        const helpArgs = "\nHelp Arguments:\n" +
            "<commandName>\n" +
            "<commandName*>  Help for all commands with this prefix";
        io.writer.writeLine(helpArgs);
        return;
    }
    const commandName = args[0];
    const handler = handlers[commandName];
    if (!handler) {
        if (!searchCommands(args, handlers, io)) {
            io.writer.writeLine(`${args[0]} not found.\n`);
            displayCommands(handlers, io);
        }
        return;
    }
    const description = getDescription(handler);
    if (description) {
        io.writer.writeLine(description);
        io.writer.writeLine();
    }
    if (handler.usage) {
        if (typeof handler.usage === "string") {
            io.writer.writeLine(handler.usage);
        }
        else {
            handler.usage(io);
        }
    }
    else {
        displayMetadata(commandName, handler, io);
    }
}
exports.displayHelp = displayHelp;
function searchCommands(args, handlers, io) {
    let name = getArg(args, 0);
    if (!name) {
        return false;
    }
    const [matches, matchCount] = filterCommandsByName(name, handlers);
    if (matchCount > 0) {
        displayCommands(matches, io);
    }
    return matchCount > 0;
}
exports.searchCommands = searchCommands;
async function commandHandler(handlers, line, io) {
    return dispatchCommand(line, handlers, io, true, ["--?"]);
}
exports.commandHandler = commandHandler;
function addStandardHandlers(handlers) {
    handlers.help = help;
    handlers.help.metadata = "Display help";
    handlers["--?"] = help;
    handlers.commands = commands;
    handlers.commands.metadata = "List all commands";
    handlers.cls = cls;
    handlers.cls.metadata = "Clear the screen";
    async function help(args, io) {
        displayHelp(args, handlers, io);
    }
    async function commands(args, io) {
        displayCommands(handlers, io);
    }
    async function cls(args, io) {
        // console.clear() doesn't clear the back scroll on windows
        //console.clear();
        // From: https://stackoverflow.com/questions/9006988/node-js-on-windows-how-to-clear-console
        process.stdout.write("\x1Bc");
    }
}
exports.addStandardHandlers = addStandardHandlers;
function getDescription(handler) {
    return handler.metadata
        ? typeof handler.metadata === "string"
            ? handler.metadata
            : handler.metadata.description
        : undefined;
}
function displayCommands(handlers, io, title) {
    const indent = "  ";
    if (title === undefined) {
        title = "COMMANDS";
    }
    if (title) {
        io.writer.writeLine(title);
    }
    io.writer.writeRecord(handlers, true, (v) => getDescription(v) ?? "", indent);
}
exports.displayCommands = displayCommands;
function displayMetadata(commandName, handler, io) {
    if (handler.metadata === undefined ||
        typeof handler.metadata === "string") {
        return;
    }
    displayUsage(commandName, handler.metadata, io);
    const indent = "  ";
    if (handler.metadata.args) {
        io.writer.writeLine();
        io.writer.writeLine("ARGUMENTS");
        displayArgs(handler.metadata.args, io, indent);
    }
    if (handler.metadata.options) {
        io.writer.writeLine();
        io.writer.writeLine("OPTIONS");
        displayArgs(handler.metadata.options, io, indent);
    }
}
function displayUsage(commandName, metadata, io) {
    // commandName --arg1 <value> --arg2 <value> [OPTIONS]
    const args = [];
    args.push(commandName);
    if (metadata.args) {
        for (const k in metadata.args) {
            const argDef = metadata.args[k];
            args.push(`--${k} <${argDef.type ?? "string"}>`);
        }
    }
    if (metadata.options) {
        args.push("[OPTIONS]");
    }
    io.writer.writeLine("USAGE");
    io.writer.writeList(args, { type: "plain" });
}
function displayArgs(args, io, indent) {
    io.writer.writeRecord(args, true, (v) => {
        let text = v.description;
        if (v.defaultValue !== undefined) {
            const defText = `(default): ${v.defaultValue}`;
            return text ? [text, defText] : defText;
        }
        return text ?? "";
    }, indent);
}
/**
 * Return the argument at the given position.
 * If no argument available, return the default.
 * If no default available, throw
 * @param args
 * @param position
 * @param defaultValue
 * @returns
 */
function getArg(args, position, defaultValue) {
    let value;
    if (args && position < args.length) {
        value = args[position];
    }
    value ??= defaultValue;
    if (value === undefined) {
        throw new Error(`No argument at position ${position}`);
    }
    return value;
}
exports.getArg = getArg;
/**
 * Return the number argument at the given position
 * @param args
 * @param position
 * @param defaultValue
 */
function getNumberArg(args, position, defaultValue) {
    let value;
    if (args && position < args.length) {
        value = args[position] ?? defaultValue;
    }
    if (!value) {
        throw new Error(`No argument at position ${position}`);
    }
    return Number(value);
}
exports.getNumberArg = getNumberArg;
function getBooleanArg(args, position, defaultValue) {
    let value;
    if (args && position < args.length) {
        value = args[position] ?? defaultValue;
    }
    if (!value) {
        throw new Error(`No argument at position ${position}`);
    }
    return typeof value === "boolean" ? value : value.toLowerCase() === "true";
}
exports.getBooleanArg = getBooleanArg;
function filterCommandsByName(name, handlers) {
    name = name.toLowerCase();
    const prefixMatch = name.endsWith("*");
    if (prefixMatch) {
        name = name.slice(0, name.length - 1);
    }
    const suffixMatch = name.startsWith("*");
    if (suffixMatch) {
        name = name.slice(1);
    }
    let matchCount = 0;
    let matches = {};
    for (const key in handlers) {
        const handlerName = key.toLowerCase();
        if (name === handlerName ||
            (prefixMatch && handlerName.startsWith(name)) ||
            (suffixMatch && handlerName.endsWith(name))) {
            matches[key] = handlers[key];
            ++matchCount;
        }
    }
    return [matches, matchCount];
}
//# sourceMappingURL=interactiveApp.js.map