import { Result } from "typechat";
export interface AuthTokenProvider {
    getAccessToken(): Promise<Result<string>>;
    refreshToken(): Promise<Result<string>>;
}
export declare enum AzureTokenScopes {
    CogServices = "https://cognitiveservices.azure.com/.default",
    AzureMaps = "https://atlas.microsoft.com/.default"
}
export declare function createAzureTokenProvider(scope: AzureTokenScopes, expirationBufferMs?: number): AuthTokenProvider;
//# sourceMappingURL=auth.d.ts.map