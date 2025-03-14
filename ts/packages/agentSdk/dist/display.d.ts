export type DisplayType = "markdown" | "html" | "iframe" | "text";
export type DynamicDisplay = {
    content: DisplayContent;
    nextRefreshMs: number;
};
export type MessageContent = string | string[] | string[][];
export type DisplayContent = MessageContent | {
    type: DisplayType;
    content: MessageContent;
    kind?: DisplayMessageKind;
    speak?: boolean;
};
export type DisplayMessageKind = "info" | "status" | "warning" | "error" | "success";
export type DisplayAppendMode = "inline" | "block" | "temporary";
export type ClientAction = "show-camera" | "show-notification" | "set-alarm" | "call-phonenumber" | "send-sms" | "search-nearby" | "automate-phone-ui";
export interface ActionIO {
    setDisplay(content: DisplayContent): void;
    appendDiagnosticData(data: any): void;
    appendDisplay(content: DisplayContent, mode?: DisplayAppendMode): void;
    takeAction(action: ClientAction, data?: unknown): void;
}
//# sourceMappingURL=display.d.ts.map