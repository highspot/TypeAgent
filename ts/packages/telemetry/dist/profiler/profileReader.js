"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileReader = void 0;
const debug_1 = __importDefault(require("debug"));
const debugError = (0, debug_1.default)("typeagent:profiler:reader:error");
class ProfileReader {
    constructor() {
        this.readId = 0;
        this.rootMeasures = [];
        this.pendingEntries = new Map();
        this.measuresById = new Map();
        this.measuresByName = new Map();
    }
    addEntries(entries) {
        if (entries.id === this.readId) {
            this.readId++;
            this.processEntries(entries.entries);
            while (this.pendingEntries.has(this.readId)) {
                const nextEntries = this.pendingEntries.get(this.readId);
                this.pendingEntries.delete(this.readId);
                this.readId++;
                this.processEntries(nextEntries);
            }
        }
        else {
            this.pendingEntries.set(entries.id, entries.entries);
        }
    }
    getMeasures(name, filter) {
        const measures = this.measuresByName.get(name);
        if (measures !== undefined && filter !== undefined) {
            return measures.filter(typeof filter === "function"
                ? (m) => filter(m.startData)
                : (m) => m.startData === filter);
        }
        return measures;
    }
    processEntries(entries) {
        for (const entry of entries) {
            switch (entry.type) {
                case "start":
                    this.processStart(entry);
                    break;
                case "mark":
                    this.processMark(entry);
                    break;
                case "stop":
                    this.processStop(entry);
                    break;
            }
        }
    }
    processStart(entry) {
        const id = entry.measureId;
        const measure = this.measuresById.get(id);
        if (measure === undefined) {
            const newMeasure = {
                name: entry.name,
                start: entry.timestamp,
                marks: [],
                measures: [],
                startData: entry.data,
            };
            this.measuresById.set(id, newMeasure);
            const measureEntries = this.measuresByName.get(entry.name);
            if (measureEntries === undefined) {
                this.measuresByName.set(entry.name, [newMeasure]);
            }
            else {
                measureEntries.push(newMeasure);
            }
            if (entry.parentId) {
                const parent = this.measuresById.get(entry.parentId);
                if (parent) {
                    parent.measures.push(newMeasure);
                }
                else {
                    debugError(`Parent entry for new measure id not found: ${entry.parentId}`);
                }
            }
            else {
                this.rootMeasures.push(newMeasure);
            }
        }
        else {
            debugError(`Start entry for existing measure id: ${id}`);
        }
    }
    processMark(entry) {
        const id = entry.measureId;
        const measure = this.measuresById.get(id);
        if (measure) {
            const newMark = {
                name: entry.name,
                data: entry.data,
                duration: entry.timestamp - measure.start,
                timestamp: entry.timestamp,
            };
            measure.marks.push(newMark);
        }
        else {
            debugError(`Mark entry for unknown measure id: ${id}`);
        }
    }
    processStop(entry) {
        const id = entry.measureId;
        const measure = this.measuresById.get(id);
        if (measure) {
            measure.duration = entry.timestamp - measure.start;
            measure.endData = entry.data;
        }
        else {
            debugError(`Stop entry for unknown measure id: ${id}`);
        }
    }
}
exports.ProfileReader = ProfileReader;
//# sourceMappingURL=profileReader.js.map