import WebSocket from "isomorphic-ws";
export type WebSocketMessageV2 = {
    id?: string;
    method: string;
    params?: any;
    result?: any;
    error?: {
        code?: number | undefined;
        message: string;
    };
    source?: string;
};
export declare function createWebSocket(channel: string, role: "dispatcher" | "client", clientId?: string): Promise<WebSocket | undefined>;
export declare function keepWebSocketAlive(webSocket: WebSocket, source: string): void;
//# sourceMappingURL=webSockets.d.ts.map