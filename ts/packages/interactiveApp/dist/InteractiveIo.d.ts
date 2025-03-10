/// <reference types="node" />
/// <reference types="node" />
import readline from "readline/promises";
/**
 * Standard IO streams
 */
export type InteractiveIo = {
    stdin: NodeJS.ReadStream;
    stdout: NodeJS.WriteStream;
    readline: readline.Interface;
    writer: ConsoleWriter;
};
export declare function getInteractiveIO(): InteractiveIo;
export declare function createInteractiveIO(): InteractiveIo;
export type ListOptions = {
    title?: string | undefined;
    type: "ol" | "ul" | "plain" | "csv";
};
/**
 * ConsoleWriter has easy wrappers like writeLine that are missing in standard io interfaces
 */
export declare class ConsoleWriter {
    stdout: NodeJS.WriteStream;
    indent: string;
    constructor(stdout: NodeJS.WriteStream, indent?: string);
    write(text?: string): ConsoleWriter;
    writeInline(text: string, prevText?: string): ConsoleWriter;
    writeLine(value?: string | number): ConsoleWriter;
    writeJson(obj: any, indented?: boolean): ConsoleWriter;
    jsonString(obj: any): string;
    writeList(list?: string | string[] | (string | undefined)[] | Set<string>, options?: ListOptions): ConsoleWriter;
    writeTable(table: string[][]): ConsoleWriter;
    writeNameValue(name: string, value: any, paddedNameLength?: number, indent?: string): ConsoleWriter;
    writeRecord<T = string>(record: Record<string, T>, sort?: boolean, stringifyValue?: (value: T) => string | string[], indent?: string): number;
    writeLink(url: string): ConsoleWriter;
    private listItemToString;
    private getMaxLength;
}
export declare function askYesNo(io: InteractiveIo, question: string): Promise<boolean>;
export declare class ProgressBar {
    writer: ConsoleWriter;
    total: number;
    count: number;
    private _lastText;
    constructor(writer: ConsoleWriter, total: number, count?: number);
    advance(amount?: number): void;
    complete(): void;
    reset(total?: number): void;
}
//# sourceMappingURL=InteractiveIo.d.ts.map