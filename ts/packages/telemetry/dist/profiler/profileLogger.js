"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfileLogger = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("typeagent:profiler");
function createProfileLogger() {
    return new ProfilerImpl();
}
exports.createProfileLogger = createProfileLogger;
class ProfilerImpl {
    constructor() {
        this.readEntries = [];
        this.unreadEntries = [];
        this.nextMeasureId = 0;
        this.nextReadId = 0;
    }
    addEntry(entry) {
        debug(entry);
        this.unreadEntries.push(entry);
    }
    createMeasure(name, start, data, parentId) {
        let started = false;
        let stopped = false;
        const measureId = this.nextMeasureId++;
        const profiler = {
            start: (data) => {
                if (started) {
                    return false;
                }
                started = true;
                this.addEntry({
                    type: "start",
                    measureId,
                    timestamp: performance.now(),
                    data,
                    parentId,
                    name,
                });
                return true;
            },
            measure: (name, start = true, data) => {
                return this.createMeasure(name, start, data, measureId);
            },
            mark: (name, data) => {
                // continue to allow marks after stop
                if (!started) {
                    return false;
                }
                this.addEntry({
                    type: "mark",
                    measureId,
                    timestamp: performance.now(),
                    data,
                    name,
                });
                return true;
            },
            stop: (data) => {
                if (!started || stopped) {
                    return false;
                }
                stopped = true;
                this.addEntry({
                    type: "stop",
                    measureId,
                    timestamp: performance.now(),
                    data,
                });
                return true;
            },
        };
        if (start) {
            profiler.start(data);
        }
        return profiler;
    }
    measure(name, start = true, data) {
        return this.createMeasure(name, start, data);
    }
    getUnreadEntries() {
        const entries = this.unreadEntries;
        if (entries.length === 0) {
            return undefined;
        }
        const id = this.nextReadId++;
        debug(`Reading ${entries.length} entries (${id})`);
        this.readEntries.push(entries);
        this.unreadEntries = [];
        return {
            id,
            entries,
        };
    }
}
//# sourceMappingURL=profileLogger.js.map