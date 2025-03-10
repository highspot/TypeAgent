import { TypeAgentStorageProvider } from "../storageProvider.js";
export declare class AzureStorageProvider implements TypeAgentStorageProvider {
    private containerName;
    private storageAccount;
    private accountURL;
    private blobServiceClient;
    constructor();
    listRemoteFiles(prefix?: string): Promise<string[]>;
    downloadFile(remotePath: string, localPath: string): Promise<void>;
    uploadFile(localPath: string, fileName: string): Promise<void>;
}
//# sourceMappingURL=azureStorageProvider.d.ts.map