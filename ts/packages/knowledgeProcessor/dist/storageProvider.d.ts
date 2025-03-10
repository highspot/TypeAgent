import { FileSystem, ObjectFolder, ObjectFolderSettings } from "typeagent";
import { TextIndex, TextIndexSettings } from "./textIndex.js";
import { TemporalLog, TemporalLogSettings } from "./temporal.js";
import { KeyValueIndex } from "./keyValueIndex.js";
export type ValueType = string | number;
export type ValueDataType<T> = T extends string ? "TEXT" : T extends number ? "INTEGER" : never;
export interface StorageProvider {
    createObjectFolder<T>(basePath: string, name: string, settings?: ObjectFolderSettings): Promise<ObjectFolder<T>>;
    createTemporalLog<T>(settings: TemporalLogSettings, basePath: string, name: string): Promise<TemporalLog<string, T>>;
    createTextIndex<TSourceId extends ValueType>(settings: TextIndexSettings, basePath: string, name: string, sourceIdType: ValueDataType<TSourceId>): Promise<TextIndex<string, TSourceId>>;
    createIndex<TValueId extends ValueType>(basePath: string, name: string, valueType: ValueDataType<TValueId>): Promise<KeyValueIndex<string, TValueId>>;
    clear(): Promise<void>;
}
export declare function createFileSystemStorageProvider(rootPath: string, defaultFolderSettings?: ObjectFolderSettings, fSys?: FileSystem | undefined): StorageProvider;
//# sourceMappingURL=storageProvider.d.ts.map