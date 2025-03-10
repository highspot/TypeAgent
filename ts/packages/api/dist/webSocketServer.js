// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { WebSocketServer } from "ws";
export class TypeAgentAPIWebSocketServer {
    constructor(webServer, connectCallback) {
        this.server = new WebSocketServer({
            server: webServer,
        });
        this.server.on("listening", () => {
            console.log(`WebSocket server started!`);
            process.send?.("Success");
        });
        this.server.on("error", (error) => {
            console.error(`WebSocket server error: ${error}`);
            this.server.close();
            process.send("Failure");
            process.exit(1);
        });
        this.server.on("connection", (ws, req) => {
            console.log("New client connected");
            if (req.url) {
                const params = new URLSearchParams(req.url.split("?")[1]);
                const clientId = params.get("clientId");
                if (clientId) {
                    for (var client of this.server.clients) {
                        if (client.clientId) {
                            this.server.clients.delete(client);
                        }
                    }
                    ws.clientId = clientId;
                }
            }
            console.log(`Connection count: ${this.server.clients.size}`);
            // TODO: send agent greeting!?
            // messages from web clients arrive here
            connectCallback(ws);
        });
        process.on("disconnect", () => {
            // Parent process has disconnected, close the WebSocket server and exit
            this.server.close();
            process.exit(1);
        });
    }
    stop() {
        this.server.close();
    }
}
//# sourceMappingURL=webSocketServer.js.map