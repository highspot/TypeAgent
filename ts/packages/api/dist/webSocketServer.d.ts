/// <reference types="node" resolution-mode="require"/>
import WebSocket from "ws";
import { Server } from "node:http";
export declare class TypeAgentAPIWebSocketServer {
    private server;
    constructor(webServer: Server<any, any>, connectCallback: (ws: WebSocket) => void);
    stop(): void;
}
//# sourceMappingURL=webSocketServer.d.ts.map