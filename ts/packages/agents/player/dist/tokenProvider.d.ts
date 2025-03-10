import { TokenCachePersistence } from "@typeagent/agent-sdk";
export declare class TokenProvider {
    private readonly clientId;
    private readonly clientSecret;
    private readonly redirectPort;
    private readonly scopes;
    private readonly tokenCachePersistence?;
    private userRefreshToken;
    private userAccessToken;
    private userAccessTokenExpiration;
    private clientToken;
    private clientTokenExpiration;
    constructor(clientId: string, clientSecret: string, redirectPort: number, scopes: string[], tokenCachePersistence?: TokenCachePersistence | undefined);
    private getAxiosRequestConfig;
    getAccessToken(): Promise<string>;
    getClientCredentials(): Promise<string | undefined>;
    private requestTokens;
    private requestAuthzCode;
    private getRedirectUrl;
    private loadRefreshToken;
    private saveRefreshToken;
}
//# sourceMappingURL=tokenProvider.d.ts.map