export type LogEvent = {
    eventName: string;
    timestamp: string;
    event: LogEventData;
};
export interface LogEventData {
    [key: string]: any;
}
export interface Logger {
    logEvent<T extends LogEventData>(eventName: string, entry: T): void;
}
export interface LoggerSink {
    logEvent(event: LogEvent): void;
}
export declare class ChildLogger implements Logger {
    private readonly parent;
    private readonly name?;
    private readonly commonProperties?;
    constructor(parent: Logger, name?: string | undefined, commonProperties?: LogEventData | undefined);
    logEvent<T extends LogEventData>(eventName: string, entry: T): void;
}
export declare class MultiSinkLogger implements Logger {
    private readonly sinks;
    constructor(sinks: LoggerSink[]);
    addSink(sink: LoggerSink): void;
    logEvent<T extends LogEventData>(eventName: string, event: T): void;
}
//# sourceMappingURL=logger.d.ts.map