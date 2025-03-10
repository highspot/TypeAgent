import * as knowLib from "knowledge-processor";
export interface StorageDb extends knowLib.StorageProvider {
    readonly rootPath: string;
    readonly name: string;
    close(): void;
}
export declare function createStorageDb(rootPath: string, name: string, createNew: boolean): Promise<StorageDb>;
//# sourceMappingURL=storageDb.d.ts.map