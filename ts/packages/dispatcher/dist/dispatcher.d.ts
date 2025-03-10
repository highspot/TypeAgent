import { DisplayType, DynamicDisplay, TemplateSchema } from "@typeagent/agent-sdk";
import { CommandCompletionResult } from "./command/completion.js";
import { DispatcherOptions } from "./context/commandHandlerContext.js";
import { RequestId } from "./context/interactiveIO.js";
import { RequestMetrics } from "./utils/metrics.js";
import { FullAction } from "agent-cache";
import { openai as ai } from "aiclient";
export type CommandResult = {
    hasError?: boolean;
    exception?: string;
    actions?: FullAction[];
    metrics?: RequestMetrics;
    tokenUsage?: ai.CompletionUsageStats;
};
export interface Dispatcher {
    processCommand(command: string, requestId?: RequestId, attachments?: string[]): Promise<CommandResult | undefined>;
    getDynamicDisplay(appAgentName: string, type: DisplayType, id: string): Promise<DynamicDisplay>;
    getTemplateSchema(templateAgentName: string, templateName: string, data: unknown): Promise<TemplateSchema>;
    getTemplateCompletion(templateAgentName: string, templateName: string, data: unknown, propertyName: string): Promise<string[] | undefined>;
    getCommandCompletion(prefix: string): Promise<CommandCompletionResult | undefined>;
    close(): Promise<void>;
    getPrompt(): string;
    getSettingSummary(): string;
    getTranslatorNameToEmojiMap(): Map<string, string>;
}
export declare function createDispatcher(hostName: string, options?: DispatcherOptions): Promise<Dispatcher>;
//# sourceMappingURL=dispatcher.d.ts.map