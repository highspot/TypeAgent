import WebSocket from "ws";
export interface WebDispatcher {
    connect(ws: WebSocket): void;
    close(): void;
}
export declare function createWebDispatcher(): Promise<WebDispatcher>;
//# sourceMappingURL=webDispatcher.d.ts.map