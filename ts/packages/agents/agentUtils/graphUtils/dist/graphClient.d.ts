/// <reference types="node" resolution-mode="require"/>
import { Client } from "@microsoft/microsoft-graph-client";
import { User } from "@microsoft/microsoft-graph-types";
import { EventEmitter } from "node:events";
export interface ErrorResponse {
    code: string;
    message: string;
}
export interface AppSettings {
    clientId: string;
    tenantId: string;
    clientSecret: string;
    graphUserScopes: string[];
    username?: string | undefined;
    password?: string | undefined;
}
export interface DynamicObject {
    [key: string]: any;
}
export type DevicePromptCallback = (prompt: string) => void;
export declare class GraphClient extends EventEmitter {
    private readonly authCommand;
    private _userClient;
    private AUTH_RECORD_PATH;
    private _userEmailAddresses;
    private readonly MSGRAPH_AUTH_URL;
    private readonly _settings;
    protected constructor(authCommand: string);
    private initializeGraphFromDeviceCode;
    private initializeGraphFromUserCred;
    private createClient;
    private initialize;
    login(cb?: DevicePromptCallback): Promise<boolean>;
    logout(): boolean;
    isAuthenticated(): boolean;
    protected ensureClient(cb?: DevicePromptCallback): Promise<Client>;
    protected getClient(): Promise<Client | undefined>;
    getUserAsync(): Promise<User>;
    getUserInfo(nameHint: string): Promise<any[]>;
    loadUserEmailAddresses(): Promise<void>;
    getEmailAddressesOfUsernamesLocal(usernames: string[]): Promise<string[]>;
    getEmailAddressesOfUsernames(usernames: string[]): Promise<string[]>;
}
//# sourceMappingURL=graphClient.d.ts.map