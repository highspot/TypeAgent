"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopWatch = void 0;
/**
 * Timer for perf measurements
 */
class StopWatch {
    constructor(start = false) {
        this._startTime = 0;
        this._elapsedMs = 0;
        if (start) {
            this.start();
        }
    }
    get elapsedMs() {
        if (this._startTime > 0 && this._elapsedMs == 0) {
            return performance.now() - this._startTime;
        }
        return this._elapsedMs;
    }
    get elapsedSeconds() {
        return this._elapsedMs / 1000;
    }
    /**
     * Return time elapsed as a printable string
     * @param inSeconds default is true
     * @returns printable string for time elapsed
     */
    elapsedString(inSeconds = true) {
        return inSeconds
            ? `${this.elapsedSeconds.toFixed(3)}s`
            : `${this._elapsedMs.toFixed(3)}ms`;
    }
    /**
     * start the stop watch
     */
    start(label) {
        if (label) {
            console.log(label);
        }
        this._startTime = performance.now();
        this._elapsedMs = 0;
    }
    /**
     * stop the watch
     * @returns elapsed time in milliseconds
     */
    stop(label) {
        const endTime = performance.now();
        this._elapsedMs = endTime - this._startTime;
        if (label) {
            this.log(label);
        }
        return this._elapsedMs;
    }
    reset() {
        this._startTime = this._elapsedMs = 0;
    }
    log(label, inSeconds = true) {
        import("chalk").then((chalk) => {
            let elapsed = `[${this.elapsedString(inSeconds)}]`;
            let text = `${chalk.default.gray(label)} ${chalk.default.green(elapsed)}`;
            console.log(text);
        });
    }
}
exports.StopWatch = StopWatch;
//# sourceMappingURL=stopWatch.js.map