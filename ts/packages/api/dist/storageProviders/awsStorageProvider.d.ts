import { TypeAgentStorageProvider } from "../storageProvider.js";
export declare class AWSStorageProvider implements TypeAgentStorageProvider {
    private s3Client;
    private bucketName;
    constructor();
    listRemoteFiles(prefix?: string): Promise<string[]>;
    downloadFile(remotePath: string, localPath: string): Promise<void>;
    uploadFile(localPath: string, remotePath: string): Promise<void>;
}
//# sourceMappingURL=awsStorageProvider.d.ts.map