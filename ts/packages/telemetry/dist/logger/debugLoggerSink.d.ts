import { LoggerSink, LogEvent } from "./logger.js";
declare class DebugLoggerSink implements LoggerSink {
    logEvent(event: LogEvent): void;
}
export declare function createDebugLoggerSink(): DebugLoggerSink;
export {};
//# sourceMappingURL=debugLoggerSink.d.ts.map