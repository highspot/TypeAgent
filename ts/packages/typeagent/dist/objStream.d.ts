/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import fs from "fs";
import { Readable, Writable } from "stream";
import { FileSystem } from ".";
export type Path = string;
/**
 * Write object as JSON to a stream
 * @param: stream to write to
 */
export declare function writeObject(writer: Writable, obj: any): Promise<void>;
/**
 * Write objects to a stream or file. Objects are written in JSON line format
 * @param output stream or file to write to
 * @param objects objects to write
 */
export declare function writeObjects<T>(output: Writable | fs.PathLike, objects: T[]): Promise<void>;
/**
 * Append objects to a stream or file. Objects are appended in JSON line format
 * @param output stream or file to write to
 * @param objects objects to write
 */
export declare function appendObjects<T>(output: Writable | fs.PathLike, objects: T[]): Promise<void>;
/**
 * Iteratively read objects from stream or file with JSON lines.
 * Objects are read in JSON line format and deserialized
 * @param output stream or file to read from
 * @returns: Asynchronous iterator over objects
 */
export declare function readObjects<T>(input: Readable | fs.PathLike): AsyncIterableIterator<T>;
/**
 * Iteratively search for objects from a stream or file
 * Yield matching objects
 * @param input filePath or stream
 */
export declare function filterObjects<T>(input: Readable | fs.PathLike, predicate: (value: T) => boolean): AsyncGenerator<Awaited<T>, void, unknown>;
/**
 * Iteratively streams lines from the input stream...
 * @param input a Readable object or a filePath
 */
export declare function readLines(input: Readable | fs.PathLike): AsyncIterableIterator<string>;
/**
 * Read all objects from a file or stream containing Json lines.
 * Each object is on its own JSON line
 * @param input stream or file to read
 * @returns array of objects
 */
export declare function readAllObjects<T>(input: Readable | Path): Promise<T[]>;
/**
 * Get full path
 * @param filePath
 * @param basePath
 * @returns
 */
export declare function getAbsolutePath(filePath: string, basePath: string | URL): string;
/**
 * Get the name of the file referenced by filePath, without extension
 * @param filePath
 * @returns
 */
export declare function getFileName(filePath: string): string;
/**
 * Read all text from a file.
 * @param filePath can be direct or relative
 * @param basePath if filePath is relative, then this is a basePath
 * @returns
 */
export declare function readAllText(filePath: string, basePath?: string): Promise<string>;
/**
 * Read all lines from the given filePath
 * @param filePath
 * @param basePath (optional) If filePath is a relative path
 * @param removeEmpty
 * @param trim
 * @returns
 */
export declare function readAllLines(filePath: string, basePath?: string | undefined, removeEmpty?: boolean, trim?: boolean): Promise<string[]>;
/**
 * Write the given lines to a file
 * @param lines
 * @param filePath
 * @param basePath
 */
export declare function writeAllLines(lines: string[], filePath: string, basePath?: string): Promise<void>;
/**
 * Read a JSON object from the given file.
 * @param filePath
 * @param validator
 * @returns
 */
export declare function readJsonFile<T>(filePath: string, defaultValue?: T | undefined, fSys?: FileSystem | undefined, validator?: ((obj: any) => T) | undefined): Promise<T | undefined>;
/**
 * Write a json object to a file
 * @param filePath
 * @param value
 * @param fSys
 * @returns
 */
export declare function writeJsonFile(filePath: string, value: any, fSys?: FileSystem): Promise<void>;
/**
 * Writes an object array to a multiple json files, one per object
 * @param destFolderPath
 * @param baseFileName
 * @param objects
 * @param fSys
 */
export declare function writeJsonFiles(destFolderPath: string, baseFileName: string, objects: any[], fSys?: FileSystem): Promise<void>;
export declare function readFile(filePath: string, fSys?: FileSystem): Promise<Buffer | undefined>;
export declare function writeFile(filePath: string, buffer: Buffer, fSys?: FileSystem): Promise<void>;
export declare function readMapFile<K, V>(filePath: string, fSys?: FileSystem, validator?: (obj: any) => [[K, V]]): Promise<Map<K, V>>;
export declare function writeMapFile<K, V>(filePath: string, map: Map<K, V>): Promise<void>;
/**
 * Remove file from given file system
 * @param filePath
 * @param fSys
 * @returns true if success, else false
 */
export declare function removeFile(filePath: string, fSys?: FileSystem): Promise<boolean>;
export declare function ensureDir(folderPath: string, fSys?: FileSystem): Promise<string>;
/**
 * Remove directory from given file system
 * @param folderPath
 * @param fSys
 * @returns true if success. False if folder does not exist
 */
export declare function removeDir(folderPath: string, fSys?: FileSystem): Promise<boolean>;
export declare function cleanDir(folderPath: string, fSys?: FileSystem): Promise<void>;
/**
 * Remove file from given file system
 * @param oldPath
 * @param newPath
 * @param fSys
 * @returns true if success. False if it does not exist
 */
export declare function renameFileSync(oldPath: string, newPath: string): boolean;
export declare function writeBlobFile(filePath: string, blob: Blob, fSys?: FileSystem): Promise<void>;
export declare function readFileFromRelativePathSync(basePath: string, relativePath: string): string;
/**
 * Serialize object to JSON line
 * @param obj
 * @returns
 */
export declare function toJsonLine(obj: any): string;
/**
 * Serialize array to Json Lines
 * @param objects
 * @returns
 */
export declare function toJsonLines(objects: any[]): string;
/**
 * Deserialize json lines into objects
 * @param lines
 * @returns
 */
export declare function fromJsonLines<T>(lines: string): T[];
export declare function getDistinctValues<T>(items: T[], keyAccessor: (item: T) => string): T[];
/**
 * Returns true if the path is to a directory
 * @param path
 * @returns true or false
 */
export declare function isDirectoryPath(path: string): boolean;
/**
 * Returns true if the path is to a file
 * @param path
 * @returns true or false
 */
export declare function isFilePath(path: string): boolean;
//# sourceMappingURL=objStream.d.ts.map