import { TemplateEditConfig } from "../translation/actionTemplate.js";
import { CommandHandlerContext } from "./commandHandlerContext.js";
import { DisplayContent, DisplayAppendMode, TypeAgentAction } from "@typeagent/agent-sdk";
import { RequestMetrics } from "../utils/metrics.js";
export type RequestId = string | undefined;
export declare enum NotifyCommands {
    ShowSummary = "summarize",
    Clear = "clear",
    ShowUnread = "unread",
    ShowAll = "all"
}
export interface IAgentMessage {
    message: DisplayContent;
    requestId?: string | undefined;
    source: string;
    actionIndex?: number | undefined;
    metrics?: RequestMetrics | undefined;
}
export type NotifyExplainedData = {
    error?: string | undefined;
    fromCache: boolean;
    fromUser: boolean;
    time: string;
};
export interface ClientIO {
    clear(): void;
    exit(): void;
    setDisplayInfo(source: string, requestId: RequestId, actionIndex?: number, action?: TypeAgentAction | string[]): void;
    setDisplay(message: IAgentMessage): void;
    appendDisplay(message: IAgentMessage, mode: DisplayAppendMode): void;
    appendDiagnosticData(requestId: RequestId, data: any): void;
    setDynamicDisplay(source: string, requestId: RequestId, actionIndex: number, displayId: string, nextRefreshMs: number): void;
    askYesNo(message: string, requestId: RequestId, defaultValue?: boolean): Promise<boolean>;
    proposeAction(actionTemplates: TemplateEditConfig, requestId: RequestId, source: string): Promise<unknown>;
    notify(event: string, requestId: RequestId, data: any, source: string): void;
    notify(event: "explained", requestId: RequestId, data: NotifyExplainedData, source: string): void;
    takeAction(action: string, data: unknown): void;
}
export declare function makeClientIOMessage(context: CommandHandlerContext, message: DisplayContent, requestId: RequestId, source: string, actionIndex?: number): IAgentMessage;
export declare function askYesNoWithContext(context: CommandHandlerContext, message: string, defaultValue?: boolean): Promise<boolean>;
export declare const nullClientIO: ClientIO;
//# sourceMappingURL=interactiveIO.d.ts.map