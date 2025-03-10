import { FileSystem, ObjectFolder, ObjectFolderSettings } from "typeagent";
import { TextIndex, TextIndexSettings } from "./textIndex.js";
import { TemporalLog } from "./temporal.js";
import { StorageProvider } from "./storageProvider.js";
export interface KnowledgeStore<T, TId = any> {
    readonly settings: TextIndexSettings;
    readonly store: ObjectFolder<T>;
    readonly sequence: TemporalLog<TId, TId[]>;
    entries(): AsyncIterableIterator<T>;
    get(id: TId): Promise<T | undefined>;
    getMultiple(ids: TId[]): Promise<T[]>;
    add(item: T, id?: TId): Promise<TId>;
    addNext(items: T[], timestamp?: Date | undefined): Promise<TId[]>;
    getTagIndex(): Promise<TextIndex<TId>>;
    /**
     * Add tag for knowledge entries with the given ids
     * @param tag
     * @param ids
     */
    addTag(tag: string, ids: TId | TId[]): Promise<string>;
    getByTag(tag: string | string[], unionMatches?: boolean): Promise<TId[] | undefined>;
}
export declare function createKnowledgeStore<T>(settings: TextIndexSettings, rootPath: string, folderSettings?: ObjectFolderSettings, fSys?: FileSystem): Promise<KnowledgeStore<T, string>>;
export declare function createKnowledgeStoreOnStorage<T>(settings: TextIndexSettings, rootPath: string, storageProvider: StorageProvider): Promise<KnowledgeStore<T, string>>;
export interface TagIndexSettings {
    concurrency: number;
}
export interface TagIndex<TTagId = any, TId = any> {
    tags(): Promise<string[]>;
    addTag(tag: string, id: TId): Promise<TTagId>;
    getByTag(tag: string | string[]): Promise<TId[] | undefined>;
    getTagsFor(id: TId): Promise<string[] | undefined>;
    removeTag(tag: string, id: TId): Promise<void>;
}
export declare function createTagIndexOnStorage(settings: TagIndexSettings, rootPath: string, storageProvider: StorageProvider): Promise<TagIndex<string, string>>;
//# sourceMappingURL=knowledgeStore.d.ts.map