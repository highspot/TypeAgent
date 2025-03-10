import { DisplayAppendMode, TemplateSchema } from "@typeagent/agent-sdk";
import { TemplateEditConfig, ClientIO, IAgentMessage, RequestId, RequestMetrics } from "agent-dispatcher";
import WebSocket from "ws";
export declare class WebAPIClientIO implements ClientIO {
    private currentws;
    private yesNoCallbacks;
    private proposedActionCallbacks;
    private questionCallbacks;
    get CurrentWebSocket(): WebSocket | undefined;
    set CurrentWebSocket(value: WebSocket | undefined);
    resolveYesNoPromise(yesNoAskId: number, accept: boolean): void;
    resolveProposeActionPromise(proposedActionId: number, replacement?: unknown): void;
    resolveQuestionPromise(questionId: number, response: string): void;
    clear(): void;
    setDisplay(message: IAgentMessage): void;
    appendDisplay(message: IAgentMessage, mode: DisplayAppendMode): void;
    updateDisplay(message?: IAgentMessage, mode?: DisplayAppendMode): void;
    setDynamicDisplay(source: string, requestId: RequestId, actionIndex: number, displayId: string, nextRefreshMs: number): void;
    private maxAskYesNoId;
    askYesNo(message: string, requestId: RequestId, defaultValue?: boolean): Promise<boolean>;
    private maxProposedActionId;
    proposeAction(actionTemplates: TemplateEditConfig, requestId: RequestId, source: string): Promise<unknown>;
    notify(event: string, requestId: RequestId, data: any, source: string): void;
    exit(): void;
    takeAction(action: string, data: unknown): void;
    updateSettingsSummary(summary: string, registeredAgents: [string, string][]): void;
    sendSuccessfulCommandResult(messageId: number, requestId: RequestId, metrics?: RequestMetrics): void;
    sendFailedCommandResult(messageId: number, requestId: RequestId, error: any): void;
    sendTemplateSchema(messageId: number, schema: TemplateSchema): void;
    sendMessage(messageType: string, payload: any): void;
}
//# sourceMappingURL=webClientIO.d.ts.map