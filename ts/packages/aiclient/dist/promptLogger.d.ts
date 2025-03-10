import { MultiSinkLogger } from "telemetry";
/**
 *  Logger for LLM prompts.
 */
export declare class PromptLogger {
    private static instance;
    private sinkLogger;
    static getInstance: () => PromptLogger;
    logModelRequest(requestContent: any): void;
    createSinkLogger(): MultiSinkLogger;
}
//# sourceMappingURL=promptLogger.d.ts.map