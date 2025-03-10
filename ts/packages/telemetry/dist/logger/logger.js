"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiSinkLogger = exports.ChildLogger = void 0;
class ChildLogger {
    constructor(parent, name, commonProperties) {
        this.parent = parent;
        this.name = name;
        this.commonProperties = commonProperties;
    }
    logEvent(eventName, entry) {
        const event = {};
        if (this.commonProperties) {
            for (const [key, value] of Object.entries(this.commonProperties)) {
                event[key] = typeof value === "function" ? value() : value;
            }
        }
        Object.assign(event, entry);
        const name = this.name ? `${this.name}:${eventName}` : eventName;
        this.parent.logEvent(name, event);
    }
}
exports.ChildLogger = ChildLogger;
class MultiSinkLogger {
    constructor(sinks) {
        this.sinks = sinks;
    }
    addSink(sink) {
        this.sinks.push(sink);
    }
    logEvent(eventName, event) {
        for (const sink of this.sinks) {
            sink.logEvent({
                eventName,
                timestamp: new Date().toISOString(),
                event,
            });
        }
    }
}
exports.MultiSinkLogger = MultiSinkLogger;
//# sourceMappingURL=logger.js.map