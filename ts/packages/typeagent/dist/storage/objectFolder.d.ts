/// <reference types="node" />
import { Path } from "../objStream";
import { NameValue } from "../memory";
export declare enum FileNameType {
    Timestamp = 0,
    Tick = 1
}
export type ObjectSerializer = (obj: any) => Buffer | string;
export type ObjectDeserializer = (buffer: Buffer) => any;
export interface ObjectFolderSettings {
    serializer?: ObjectSerializer;
    deserializer?: ObjectDeserializer;
    fileNameType?: FileNameType | undefined;
    cacheNames?: boolean | undefined;
    useWeakRefs?: boolean | undefined;
    safeWrites?: boolean | undefined;
}
/**
 * An Abstract Folder for Storing Objects
 * The folder can be implemented over native files OR an abstract file system
 */
export interface ObjectFolder<T> {
    readonly path: Path;
    size(): Promise<number>;
    get(name: string): Promise<T | undefined>;
    put(obj: T, name?: string, onNameAssigned?: (obj: T, name: string) => void): Promise<string>;
    remove(name: string): Promise<void>;
    exists(name: string): boolean;
    all(): AsyncIterableIterator<NameValue<T>>;
    newest(): AsyncIterableIterator<NameValue<T>>;
    clear(): Promise<void>;
    allObjects(): AsyncIterableIterator<T>;
    allNames(): Promise<string[]>;
}
/**
 * Create an object folder. If folder exists, just get it
 * @param folderPath
 * @param settings
 * @param fsys (optional) File System implementation to use
 * @returns
 */
export declare function createObjectFolder<T>(folderPath: Path, settings?: ObjectFolderSettings, fSys?: FileSystem): Promise<ObjectFolder<T>>;
/**
 * Generate a monotonic name that is lexically SORTABLE
 * This method uses the current Date to generate a timestamp
 * @returns string
 */
export declare function generateTimestampString(timestamp?: Date): string;
export declare function ensureUniqueObjectName(store: ObjectFolder<string>, id: string): string | undefined;
export declare function generateTicksString(timestamp?: Date): string;
export declare function makeSubDirPath(basePath: string, name: string): string;
export declare function generateMonotonicName(counterStartAt: number, baseName: string, isNameAcceptable: (name: string) => boolean, maxDigits?: number): {
    name: string | undefined;
    lastCounter: number;
};
export declare function createFileNameGenerator(nameGenerator: () => string, isNameAcceptable: (name: string) => boolean): IterableIterator<string>;
/**
 * An Abstract File System
 */
export interface FileSystem {
    exists(path: string): boolean;
    ensureDir(folderPath: string): Promise<void>;
    rmdir(folderPath: string): Promise<void>;
    readdir(folderPath: string): Promise<string[]>;
    readFileNames(folderPath: string): Promise<string[]>;
    readDirectoryNames(folderPath: string): Promise<string[]>;
    readBuffer(path: string): Promise<Buffer>;
    read(path: string): Promise<string>;
    write(path: string, data: string | Buffer): Promise<void>;
    removeFile(path: string): Promise<boolean>;
    copyFile(fromPath: string, toPath: string): Promise<void>;
    copyDir(fromPath: string, toPath: string): Promise<void>;
    renameFile(fromPath: string, toPath: string): boolean;
}
export declare function fsDefault(): FileSystem;
/**
 * Write to a temp file, then rename the file synchronously
 * @param filePath
 * @param data
 */
export declare function safeWrite(filePath: string, data: string | Buffer, fSys?: FileSystem | undefined): Promise<void>;
export declare function readObjectFromFile<T>(filePath: string, deserializer: ObjectDeserializer | undefined, fSys?: FileSystem): Promise<T | undefined>;
export declare function writeObjectToFile<T>(filePath: string, obj: T, serializer?: ObjectSerializer | undefined, safeWrites?: boolean, fSys?: FileSystem): Promise<void>;
//# sourceMappingURL=objectFolder.d.ts.map