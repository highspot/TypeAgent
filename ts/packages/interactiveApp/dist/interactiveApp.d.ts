import { InteractiveIo } from "./InteractiveIo";
/**
 * Handler of command line inputs
 */
export type InputHandler = (request: string, io: InteractiveIo) => Promise<void>;
/**
 * Settings for an interactive app
 */
export type InteractiveAppSettings = {
    /**
     * Callback called when apps starts
     * @param io
     * @returns
     */
    onStart?: (io: InteractiveIo) => void;
    /**
     * Invoked when input is available
     */
    inputHandler: InputHandler;
    /**
     * Invoked when an interactive command is issued
     */
    commandHandler?: InputHandler;
    /**
     * Standard command line prompt
     */
    prompt?: string;
    /**
     * Commands are detected by looking for this prefix. Default is '@'
     */
    commandPrefix?: string;
    /**
     * Commands that cause the app to exit. Default is 'exit' and 'quit'
     */
    stopCommands?: string[];
    /**
     * Stop on exception
     */
    stopOnError?: boolean;
    /**
     * Can user do multi-line input entry? Useful for chats and other interactive scenarios
     */
    multiline?: boolean;
    /**
     * How user terminates multiline input. Default is @@
     */
    multilineTerminator?: string;
    /**
     * Handler table for this app
     */
    handlers?: Record<string, CommandHandler> | undefined;
};
/**
 * Run batch file app
 * @param settings app settings
 */
export declare function runBatch(settings: InteractiveAppSettings): Promise<void>;
/**
 * Run an interactive Console app
 * @param settings app settings
 */
export declare function runConsole(settings: InteractiveAppSettings): Promise<void>;
/**
 * Parse a command line string into an argument array. Supports quoted arguments
 * @param cmdLine command line to parse
 * @returns parsed arguments
 */
export declare function parseCommandLine(cmdLine: string): string[] | null;
export type ArgType = "string" | "number" | "integer" | "boolean" | "path";
export interface ArgDef {
    type?: ArgType | undefined;
    description?: string | undefined;
    defaultValue?: any | undefined;
}
export declare function arg(description: string, defaultValue?: string | undefined): ArgDef;
export declare function argBool(description?: string | undefined, defaultValue?: boolean | undefined): ArgDef;
export declare function argNum(description: string, defaultValue?: number | undefined): ArgDef;
/**
 * Named command line arguments
 */
export interface NamedArgs extends Record<string, any> {
    /**
     * Returns a value, converting it to type if necessary
     * @param key
     * @param type
     */
    value(key: string, type: ArgType, required?: boolean): any | undefined;
    number(key: string, required?: boolean): number | undefined;
    integer(key: string, required?: boolean): number | undefined;
    boolean(key: string, required?: boolean): number | undefined;
    path(key: string, required?: boolean): string | undefined;
    bind(defs: Record<string, ArgDef>, required: boolean): void;
    shift(key: string): any | undefined;
}
export declare function createNamedArgs(): NamedArgs;
/**
 * Parse named args, like commandX --option1 A --option2 B
 * @param args
 * @param namePrefix prefix for argNames. Default is --
 * @param shortNamePrefix prefix for short version of argNames. Default is -
 * @returns An JSON object, where property name is the key, and value is the argument value
 */
export declare function parseNamedArguments(args: string | string[] | NamedArgs, argDefs?: CommandMetadata, namePrefix?: string, shortNamePrefix?: string): NamedArgs;
export type CommandMetadata = {
    description?: string;
    args?: Record<string, ArgDef>;
    options?: Record<string, ArgDef>;
};
export type CommandResult = string | undefined | void;
export type CommandHandler = CommandHandler1 | CommandHandler2;
/**
 * Command handler
 */
export interface CommandHandler1 {
    (args: string[], io: InteractiveIo): Promise<CommandResult>;
    metadata?: string | CommandMetadata;
    usage?: string | {
        (io: InteractiveIo): void;
    };
}
/**
 * Command handler
 */
export interface CommandHandler2 {
    (args: string[] | NamedArgs, io: InteractiveIo): Promise<CommandResult>;
    metadata?: string | CommandMetadata;
    usage?: string | {
        (io: InteractiveIo): void;
    };
}
export declare function createCommand(fn: (args: string[], io: InteractiveIo) => Promise<CommandResult>, metadata?: string | CommandMetadata, usage?: string): CommandHandler1;
/**
 * Dispatches a commandLine.
 * Splits the command line into command and arguments
 * @param cmdLine command line string
 * @param handlers a table of handlers
 * @param io how handler can perform IO
 * @param caseSensitive If command names are case sensitive
 * @param helpFlags if command args terminate in one of these flags, trigger help. By default, "--?"
 */
export declare function dispatchCommand(cmdLine: string, handlers: Record<string, CommandHandler>, io: InteractiveIo, caseSensitive?: boolean, helpFlags?: string[]): Promise<void>;
export declare function displayHelp(args: string[], handlers: Record<string, CommandHandler>, io: InteractiveIo): void;
export declare function searchCommands(args: string[], handlers: Record<string, CommandHandler>, io: InteractiveIo): boolean;
export declare function commandHandler(handlers: Record<string, CommandHandler>, line: string, io: InteractiveIo): Promise<void>;
export declare function addStandardHandlers(handlers: Record<string, CommandHandler>): void;
export declare function displayCommands(handlers: Record<string, CommandHandler>, io: InteractiveIo, title?: string): void;
/**
 * Return the argument at the given position.
 * If no argument available, return the default.
 * If no default available, throw
 * @param args
 * @param position
 * @param defaultValue
 * @returns
 */
export declare function getArg(args: string[] | undefined | null, position: number, defaultValue?: string): string;
/**
 * Return the number argument at the given position
 * @param args
 * @param position
 * @param defaultValue
 */
export declare function getNumberArg(args: string[] | undefined | null, position: number, defaultValue?: number): number;
export declare function getBooleanArg(args: string[] | undefined | null, position: number, defaultValue?: boolean): boolean;
//# sourceMappingURL=interactiveApp.d.ts.map