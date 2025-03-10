"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFilePath = exports.isDirectoryPath = exports.getDistinctValues = exports.fromJsonLines = exports.toJsonLines = exports.toJsonLine = exports.readFileFromRelativePathSync = exports.writeBlobFile = exports.renameFileSync = exports.cleanDir = exports.removeDir = exports.ensureDir = exports.removeFile = exports.writeMapFile = exports.readMapFile = exports.writeFile = exports.readFile = exports.writeJsonFiles = exports.writeJsonFile = exports.readJsonFile = exports.writeAllLines = exports.readAllLines = exports.readAllText = exports.getFileName = exports.getAbsolutePath = exports.readAllObjects = exports.readLines = exports.filterObjects = exports.readObjects = exports.appendObjects = exports.writeObjects = exports.writeObject = void 0;
const fs_1 = __importDefault(require("fs"));
const readline = __importStar(require("readline"));
const stream_1 = require("stream");
const url_1 = require("url");
const path_1 = __importDefault(require("path"));
/**
 * Write object as JSON to a stream
 * @param: stream to write to
 */
function writeObject(writer, obj) {
    const json = toJsonLine(obj);
    return new Promise((resolve, reject) => {
        writer.write(json, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.writeObject = writeObject;
/**
 * Write objects to a stream or file. Objects are written in JSON line format
 * @param output stream or file to write to
 * @param objects objects to write
 */
async function writeObjects(output, objects) {
    if (objects.length > 0) {
        if (isWritable(output)) {
            for (const obj of objects) {
                await writeObject(output, obj);
            }
        }
        else {
            await writeObjectsImpl(output, "w", objects);
        }
    }
}
exports.writeObjects = writeObjects;
/**
 * Append objects to a stream or file. Objects are appended in JSON line format
 * @param output stream or file to write to
 * @param objects objects to write
 */
async function appendObjects(output, objects) {
    if (isWritable(output)) {
        for (const obj of objects) {
            await writeObject(output, obj);
        }
    }
    else {
        await writeObjectsImpl(output, "a", objects);
    }
}
exports.appendObjects = appendObjects;
/**
 * Iteratively read objects from stream or file with JSON lines.
 * Objects are read in JSON line format and deserialized
 * @param output stream or file to read from
 * @returns: Asynchronous iterator over objects
 */
async function* readObjects(input) {
    for await (const line of readLines(input)) {
        const obj = JSON.parse(line);
        yield obj;
    }
}
exports.readObjects = readObjects;
/**
 * Iteratively search for objects from a stream or file
 * Yield matching objects
 * @param input filePath or stream
 */
async function* filterObjects(input, predicate) {
    for await (const obj of readObjects(input)) {
        if (predicate(obj)) {
            yield obj;
        }
    }
}
exports.filterObjects = filterObjects;
/**
 * Iteratively streams lines from the input stream...
 * @param input a Readable object or a filePath
 */
async function* readLines(input) {
    let readStream;
    let rl;
    if (isReadable(input)) {
        rl = readline.createInterface(input);
    }
    else {
        if (!fs_1.default.existsSync(input)) {
            return;
        }
        readStream = fs_1.default.createReadStream(input);
        rl = readline.createInterface(readStream);
    }
    try {
        for await (const line of rl) {
            yield line;
        }
    }
    finally {
        if (readStream) {
            await closeReader(readStream);
        }
        if (rl) {
            rl.close();
        }
    }
}
exports.readLines = readLines;
/**
 * Read all objects from a file or stream containing Json lines.
 * Each object is on its own JSON line
 * @param input stream or file to read
 * @returns array of objects
 */
async function readAllObjects(input) {
    let items = [];
    for await (const obj of readObjects(input)) {
        items.push(obj);
    }
    return items ?? [];
}
exports.readAllObjects = readAllObjects;
async function writeObjectsImpl(filePath, mode, objects) {
    const writer = await createWriteStream(filePath, mode);
    try {
        for (let obj of objects) {
            await writeObject(writer, obj);
        }
    }
    finally {
        await closeWriter(writer);
    }
}
async function createWriteStream(filePath, mode) {
    return new Promise((resolve, reject) => {
        const writer = fs_1.default.createWriteStream(filePath, { flags: mode });
        writer.on("open", (fd) => {
            resolve(writer);
        });
        writer.on("error", (err) => {
            writer.close();
            reject(err);
        });
    });
}
async function closeWriter(writer) {
    return new Promise((resolve, reject) => {
        writer.close((err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
async function closeReader(reader) {
    return new Promise((resolve, reject) => {
        reader.close((err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
            ("");
        });
    });
}
/**
 * Get full path
 * @param filePath
 * @param basePath
 * @returns
 */
function getAbsolutePath(filePath, basePath) {
    if (path_1.default.isAbsolute(filePath)) {
        // already absolute
        return filePath;
    }
    return (0, url_1.fileURLToPath)(new URL(filePath, basePath));
}
exports.getAbsolutePath = getAbsolutePath;
/**
 * Get the name of the file referenced by filePath, without extension
 * @param filePath
 * @returns
 */
function getFileName(filePath) {
    return path_1.default.basename(filePath, path_1.default.extname(filePath));
}
exports.getFileName = getFileName;
/**
 * Read all text from a file.
 * @param filePath can be direct or relative
 * @param basePath if filePath is relative, then this is a basePath
 * @returns
 */
async function readAllText(filePath, basePath) {
    if (basePath) {
        filePath = path_1.default.join(basePath, filePath);
    }
    return fs_1.default.promises.readFile(filePath, "utf-8");
}
exports.readAllText = readAllText;
/**
 * Read all lines from the given filePath
 * @param filePath
 * @param basePath (optional) If filePath is a relative path
 * @param removeEmpty
 * @param trim
 * @returns
 */
async function readAllLines(filePath, basePath, removeEmpty = false, trim = false) {
    let lines = (await readAllText(filePath, basePath)).split(/\r?\n/);
    lines = trim ? lines.map((l) => l.trim()) : lines;
    lines = removeEmpty ? lines.filter((l) => l.length > 0) : lines;
    return lines;
}
exports.readAllLines = readAllLines;
/**
 * Write the given lines to a file
 * @param lines
 * @param filePath
 * @param basePath
 */
async function writeAllLines(lines, filePath, basePath) {
    if (basePath) {
        filePath = path_1.default.join(basePath, filePath);
    }
    const buffer = lines.join("\n");
    await fs_1.default.promises.writeFile(filePath, buffer);
}
exports.writeAllLines = writeAllLines;
/**
 * Read a JSON object from the given file.
 * @param filePath
 * @param validator
 * @returns
 */
async function readJsonFile(filePath, defaultValue, fSys, validator) {
    try {
        let json;
        if (fSys) {
            json = await fSys.read(filePath);
        }
        else {
            json = await fs_1.default.promises.readFile(filePath, {
                encoding: "utf-8",
            });
        }
        if (json.length > 0) {
            const obj = JSON.parse(json);
            return validator ? validator(obj) : obj;
        }
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    return defaultValue ?? undefined;
}
exports.readJsonFile = readJsonFile;
/**
 * Write a json object to a file
 * @param filePath
 * @param value
 * @param fSys
 * @returns
 */
async function writeJsonFile(filePath, value, fSys) {
    const json = JSON.stringify(value);
    return fSys
        ? fSys.write(filePath, json)
        : fs_1.default.promises.writeFile(filePath, json);
}
exports.writeJsonFile = writeJsonFile;
/**
 * Writes an object array to a multiple json files, one per object
 * @param destFolderPath
 * @param baseFileName
 * @param objects
 * @param fSys
 */
async function writeJsonFiles(destFolderPath, baseFileName, objects, fSys) {
    if (objects.length === 0) {
        return;
    }
    await ensureDir(destFolderPath);
    const padLength = objects.length.toString().length;
    for (let i = 0; i < objects.length; ++i) {
        let fileId = (i + 1).toString().padStart(padLength, "0");
        let turnFilePath = path_1.default.join(destFolderPath, `${baseFileName}_${fileId}.json`);
        await writeJsonFile(turnFilePath, objects[i], fSys);
    }
}
exports.writeJsonFiles = writeJsonFiles;
async function readFile(filePath, fSys) {
    try {
        let buffer;
        if (fSys) {
            buffer = await fSys.readBuffer(filePath);
        }
        else {
            buffer = await fs_1.default.promises.readFile(filePath);
        }
        return buffer.length > 0 ? buffer : undefined;
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    return undefined;
}
exports.readFile = readFile;
function writeFile(filePath, buffer, fSys) {
    return fSys
        ? fSys.write(filePath, buffer)
        : fs_1.default.promises.writeFile(filePath, buffer);
}
exports.writeFile = writeFile;
async function readMapFile(filePath, fSys, validator) {
    const entries = await readJsonFile(filePath, undefined, fSys, validator);
    return new Map(entries);
}
exports.readMapFile = readMapFile;
async function writeMapFile(filePath, map) {
    // Convert the Map to an array of key-value pairs
    const entries = Array.from(map.entries());
    await writeJsonFile(filePath, entries);
}
exports.writeMapFile = writeMapFile;
/**
 * Remove file from given file system
 * @param filePath
 * @param fSys
 * @returns true if success, else false
 */
async function removeFile(filePath, fSys) {
    try {
        if (fSys) {
            await fSys.removeFile(filePath);
        }
        else {
            await fs_1.default.promises.unlink(filePath);
        }
        return true;
    }
    catch { }
    return false;
}
exports.removeFile = removeFile;
async function ensureDir(folderPath, fSys) {
    if (fSys) {
        await fSys.ensureDir(folderPath);
    }
    else {
        if (!fs_1.default.existsSync(folderPath)) {
            await fs_1.default.promises.mkdir(folderPath, { recursive: true });
        }
    }
    return folderPath;
}
exports.ensureDir = ensureDir;
/**
 * Remove directory from given file system
 * @param folderPath
 * @param fSys
 * @returns true if success. False if folder does not exist
 */
async function removeDir(folderPath, fSys) {
    try {
        if (fSys) {
            await fSys.rmdir(folderPath);
        }
        else {
            await fs_1.default.promises.rm(folderPath, { recursive: true, force: true });
        }
        return true;
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    return false;
}
exports.removeDir = removeDir;
async function cleanDir(folderPath, fSys) {
    await removeDir(folderPath, fSys);
    await ensureDir(folderPath, fSys);
}
exports.cleanDir = cleanDir;
/**
 * Remove file from given file system
 * @param oldPath
 * @param newPath
 * @param fSys
 * @returns true if success. False if it does not exist
 */
function renameFileSync(oldPath, newPath) {
    try {
        fs_1.default.renameSync(oldPath, newPath);
        return true;
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    return false;
}
exports.renameFileSync = renameFileSync;
async function writeBlobFile(filePath, blob, fSys) {
    const buffer = Buffer.from(await blob.arrayBuffer());
    return fSys
        ? fSys.write(filePath, buffer)
        : fs_1.default.promises.writeFile(filePath, buffer);
}
exports.writeBlobFile = writeBlobFile;
function readFileFromRelativePathSync(basePath, relativePath) {
    const fullPath = (0, url_1.fileURLToPath)(new URL(relativePath, basePath));
    return fs_1.default.readFileSync(fullPath, "utf-8");
}
exports.readFileFromRelativePathSync = readFileFromRelativePathSync;
/**
 * Serialize object to JSON line
 * @param obj
 * @returns
 */
function toJsonLine(obj) {
    return JSON.stringify(obj) + "\n";
}
exports.toJsonLine = toJsonLine;
/**
 * Serialize array to Json Lines
 * @param objects
 * @returns
 */
function toJsonLines(objects) {
    if (objects.length === 1) {
        return toJsonLine(objects[0]);
    }
    let json = "";
    for (let obj of objects) {
        json += toJsonLine(obj);
    }
    return json;
}
exports.toJsonLines = toJsonLines;
/**
 * Deserialize json lines into objects
 * @param lines
 * @returns
 */
function fromJsonLines(lines) {
    let objects = [];
    if (lines.length > 0) {
        for (let json in lines.split(/\r?\n/)) {
            json = json.trim();
            if (json.length > 0) {
                objects.push(JSON.parse(json));
            }
        }
    }
    return objects;
}
exports.fromJsonLines = fromJsonLines;
function getDistinctValues(items, keyAccessor) {
    if (items.length == 0) {
        return items;
    }
    const distinct = new Map();
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        distinct.set(keyAccessor(item), item);
    }
    return [...distinct.values()];
}
exports.getDistinctValues = getDistinctValues;
/**
 * Returns true if the path is to a directory
 * @param path
 * @returns true or false
 */
function isDirectoryPath(path) {
    try {
        return fs_1.default.statSync(path).isDirectory();
    }
    catch { }
    return false;
}
exports.isDirectoryPath = isDirectoryPath;
/**
 * Returns true if the path is to a file
 * @param path
 * @returns true or false
 */
function isFilePath(path) {
    try {
        return fs_1.default.statSync(path).isFile();
    }
    catch { }
    return false;
}
exports.isFilePath = isFilePath;
function isWritable(writer) {
    return typeof writer === "function" && writer instanceof stream_1.Writable;
}
function isReadable(reader) {
    return typeof reader === "function" && reader instanceof stream_1.Readable;
}
//# sourceMappingURL=objStream.js.map