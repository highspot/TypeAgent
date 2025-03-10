import { DisplayType, DynamicDisplay } from "@typeagent/agent-sdk";
import { CommandCompletionResult } from "../command/completion.js";
import { InitializeCommandHandlerContextOptions } from "../handlers/common/commandHandlerContext.js";
import { RequestId } from "../handlers/common/interactiveIO.js";
import { RequestMetrics } from "../utils/metrics.js";
import { TemplateSchema } from "../../../agentSdk/dist/templateInput.js";
export interface Dispatcher {
    processCommand(
        command: string,
        requestId?: RequestId,
        attachments?: string[],
    ): Promise<RequestMetrics | undefined>;
    getDynamicDisplay(
        appAgentName: string,
        type: DisplayType,
        id: string,
    ): Promise<DynamicDisplay>;
    getTemplateSchema(
        templateAgentName: string,
        templateName: string,
        data: unknown,
    ): Promise<TemplateSchema>;
    getTemplateCompletion(
        templateAgentName: string,
        templateName: string,
        data: unknown,
        propertyName: string,
    ): Promise<string[] | undefined>;
    getCommandCompletion(
        prefix: string,
    ): Promise<CommandCompletionResult | undefined>;
    close(): Promise<void>;
    getPrompt(): string;
    getSettingSummary(): string;
    getTranslatorNameToEmojiMap(): Map<string, string>;
}
export type DispatcherOptions = InitializeCommandHandlerContextOptions;
export declare function createDispatcher(
    hostName: string,
    options?: DispatcherOptions,
): Promise<Dispatcher>;
//# sourceMappingURL=dispatcher.d.ts.map
