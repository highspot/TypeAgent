"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugLoggerSink = void 0;
const debug_1 = __importDefault(require("debug"));
class DebugLoggerSink {
    logEvent(event) {
        const logger = (0, debug_1.default)(`typeagent:logger:${event.eventName}`);
        logger(JSON.stringify(event.event));
    }
}
function createDebugLoggerSink() {
    return new DebugLoggerSink();
}
exports.createDebugLoggerSink = createDebugLoggerSink;
//# sourceMappingURL=debugLoggerSink.js.map