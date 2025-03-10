"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptLogger = void 0;
const telemetry_1 = require("telemetry");
const debug_1 = __importDefault(require("debug"));
const debugPromptLogger = (0, debug_1.default)("typeagent:promptLogger");
/**
 *  Logger for LLM prompts.
 */
class PromptLogger {
    logModelRequest(requestContent) {
        this.sinkLogger?.logEvent("modelRequest", { requestContent });
    }
    createSinkLogger() {
        const debugLoggerSink = (0, telemetry_1.createDebugLoggerSink)();
        let dbLoggerSink;
        try {
            dbLoggerSink = (0, telemetry_1.createMongoDBLoggerSink)("telemetrydb", "promptLogs");
        }
        catch (e) {
            debugPromptLogger(`DB logging disabled. ${e}`);
        }
        return new telemetry_1.MultiSinkLogger(dbLoggerSink === undefined
            ? [debugLoggerSink]
            : [debugLoggerSink, dbLoggerSink]);
    }
}
exports.PromptLogger = PromptLogger;
PromptLogger.getInstance = () => {
    if (!PromptLogger.instance) {
        PromptLogger.instance = new PromptLogger();
        PromptLogger.instance.sinkLogger =
            PromptLogger.instance.createSinkLogger();
    }
    return PromptLogger.instance;
};
//# sourceMappingURL=promptLogger.js.map