"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runExe = exports.sleep = exports.millisecondsToString = exports.StopWatch = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
/**
 * Timer for perf measurements
 */
class StopWatch {
    constructor() {
        this._startTime = 0;
        this._elapsedMs = 0;
    }
    get elapsedMs() {
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
        return `[${millisecondsToString(this._elapsedMs, inSeconds ? "s" : "ms")}]`;
    }
    /**
     * start the stop watch
     */
    start() {
        this._startTime = performance.now();
        this._elapsedMs = 0;
    }
    /**
     * stop the watch
     * @returns elapsed time in milliseconds
     */
    stop(io) {
        const endTime = performance.now();
        this._elapsedMs = endTime - this._startTime;
        if (io) {
            io.writer.write(this.elapsedString());
        }
        return this._elapsedMs;
    }
    reset() {
        this._startTime = this._elapsedMs = 0;
    }
}
exports.StopWatch = StopWatch;
function millisecondsToString(ms, format) {
    let time = ms;
    switch (format) {
        default:
            break;
        case "s":
            time /= 1000;
            break;
        case "m":
            time /= 1000 * 60;
            break;
    }
    return `${time.toFixed(3)}${format}`;
}
exports.millisecondsToString = millisecondsToString;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function runExe(exePath, args, io) {
    if (!fs_1.default.existsSync(exePath)) {
        return Promise.resolve(false);
    }
    return new Promise((resolve, reject) => {
        try {
            const process = (0, child_process_1.spawn)(exePath, args);
            process.stdout.on("data", (text) => {
                io.writer.write(text);
            });
            process.stderr.on("data", (text) => {
                io.writer.write(text);
            });
            process.on("error", (error) => {
                reject(error);
            });
            process.on("close", (code) => {
                if (code === 0) {
                    resolve(true);
                }
                else {
                    reject(`Exit with code ${code}`);
                }
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.runExe = runExe;
//# sourceMappingURL=core.js.map