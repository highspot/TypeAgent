import { InteractiveIo } from "./InteractiveIo";
/**
 * Timer for perf measurements
 */
export declare class StopWatch {
    private _startTime;
    private _elapsedMs;
    constructor();
    get elapsedMs(): number;
    get elapsedSeconds(): number;
    /**
     * Return time elapsed as a printable string
     * @param inSeconds default is true
     * @returns printable string for time elapsed
     */
    elapsedString(inSeconds?: boolean): string;
    /**
     * start the stop watch
     */
    start(): void;
    /**
     * stop the watch
     * @returns elapsed time in milliseconds
     */
    stop(io?: InteractiveIo): number;
    reset(): void;
}
export declare function millisecondsToString(ms: number, format: "ms" | "s" | "m"): string;
export declare function sleep(ms: number): Promise<void>;
export declare function runExe(exePath: string, args: string[] | undefined, io: InteractiveIo): Promise<boolean>;
//# sourceMappingURL=core.d.ts.map