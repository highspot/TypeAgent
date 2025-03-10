import { ContainerClient } from "@azure/storage-blob";
export declare class TypeAgentServer {
    private envPath;
    private webDispatcher;
    private webSocketServer;
    private webServer;
    private fileWriteDebouncer;
    private storageProvider;
    private config;
    constructor(envPath: string);
    start(): Promise<void>;
    stop(): void;
    /**
     * Downloads from session data blob storage to the local session store
     */
    syncFromProvider(): Promise<void>;
    /**
     * Enumerates and downloads the blobs for the supplied container client.
     * @param containerClient The container client whose blobs we are enumerating.
     */
    findBlobs(containerClient: ContainerClient): Promise<void>;
    /**
     * Looks at the local typeagent storage and replicates any file changes to the blob storage
     */
    startLocalStorageBackup(): void;
    /**
     * Debounces the refcount on a file write operation and then uploads the file to blob storage
     * when the refcount is at zero
     * @param fileName The file name to debounce then upload
     */
    debounceFileThenUpload(fileName: string): void;
}
//# sourceMappingURL=typeAgentServer.d.ts.map