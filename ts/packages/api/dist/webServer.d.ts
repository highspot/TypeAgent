/// <reference types="node" resolution-mode="require"/>
import { Server } from "node:http";
export type TypeAgentAPIServerConfig = {
    wwwroot: string;
    port: number;
    broadcast: boolean;
    blobBackupEnabled: boolean;
    storageProvider?: "azure" | "aws";
};
export declare class TypeAgentAPIWebServer {
    server: Server<any, any>;
    private secureServer;
    constructor(config: TypeAgentAPIServerConfig);
    serve(config: TypeAgentAPIServerConfig, request: any, response: any): boolean | undefined;
    start(): void;
    stop(): void;
    printHeaders(request: any, response: any): boolean;
}
//# sourceMappingURL=webServer.d.ts.map