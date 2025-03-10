/**
 * Timer for perf measurements
 */
export declare class StopWatch {
    private _startTime;
    private _elapsedMs;
    constructor(start?: boolean);
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
    start(label?: string): void;
    /**
     * stop the watch
     * @returns elapsed time in milliseconds
     */
    stop(label?: string): number;
    reset(): void;
    log(label: string, inSeconds?: boolean): void;
}
//# sourceMappingURL=stopWatch.d.ts.map