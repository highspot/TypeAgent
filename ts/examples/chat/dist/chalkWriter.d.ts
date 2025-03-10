import { ConsoleWriter, InteractiveIo, ListOptions, StopWatch } from "interactive-app";
import { ChalkInstance } from "chalk";
export type ChalkColor = {
    foreColor?: ChalkInstance | undefined;
    backColor?: ChalkInstance | undefined;
};
export declare class ChalkWriter extends ConsoleWriter {
    private _io;
    private _color;
    constructor(io: InteractiveIo);
    get io(): InteractiveIo;
    getColor(): ChalkColor;
    setForeColor(color?: ChalkInstance): ChalkInstance | undefined;
    setBackColor(color?: ChalkInstance): ChalkInstance | undefined;
    setColor(color: ChalkColor): ChalkColor;
    write(text?: string, isStyled?: boolean): ChalkWriter;
    writeLine(text?: string, isStyled?: boolean): ChalkWriter;
    log(text: string): ChalkWriter;
    writeLines(lines: string[]): ChalkWriter;
    writeBullet(line: string): ChalkWriter;
    writeInColor(color: ChalkInstance, writable: string | number | (() => void)): void;
    writeHeading(text: string): ChalkWriter;
    writeUnderline(text: string): ChalkWriter;
    writeBold(text: string): ChalkWriter;
    writeTiming(color: ChalkInstance, clock: StopWatch, label?: string): void;
    writeError(message: string): void;
    writeListInColor(color: ChalkInstance, list?: string | string[] | (string | undefined)[] | Set<string>, options?: ListOptions): void;
}
//# sourceMappingURL=chalkWriter.d.ts.map