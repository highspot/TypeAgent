import { FileSystem, ObjectFolderSettings } from "typeagent";
/**
 * KeyValueIndex is a multi-map.
 * For each keyId, maintains a collection of one or more value Ids
 */
export interface KeyValueIndex<TKeyId = any, TValueId = any> {
    get(id: TKeyId): Promise<TValueId[] | undefined>;
    getMultiple(ids: TKeyId[], concurrency?: number): Promise<TValueId[][]>;
    put(postings: TValueId[], id?: TKeyId): Promise<TKeyId>;
    replace(postings: TValueId[], id: TKeyId): Promise<TKeyId>;
    remove(id: TKeyId): Promise<void>;
}
export declare function createIndexFolder<TValueId>(folderPath: string, folderSettings?: ObjectFolderSettings, fSys?: FileSystem): Promise<KeyValueIndex<string, TValueId>>;
//# sourceMappingURL=keyValueIndex.d.ts.map