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
exports.writeObjectToFile = exports.readObjectFromFile = exports.safeWrite = exports.fsDefault = exports.createFileNameGenerator = exports.generateMonotonicName = exports.makeSubDirPath = exports.generateTicksString = exports.ensureUniqueObjectName = exports.generateTimestampString = exports.createObjectFolder = exports.FileNameType = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const objStream_1 = require("../objStream");
const lib_1 = require("../lib");
const debug_1 = __importDefault(require("debug"));
const storageError = (0, debug_1.default)("typeagent:storage:error");
var FileNameType;
(function (FileNameType) {
    FileNameType[FileNameType["Timestamp"] = 0] = "Timestamp";
    FileNameType[FileNameType["Tick"] = 1] = "Tick";
})(FileNameType || (exports.FileNameType = FileNameType = {}));
/**
 * Create an object folder. If folder exists, just get it
 * @param folderPath
 * @param settings
 * @param fsys (optional) File System implementation to use
 * @returns
 */
async function createObjectFolder(folderPath, settings, fSys) {
    const folderSettings = settings ?? {};
    const fileSystem = fSys ?? fsDefault();
    const fileNameGenerator = createNameGenerator();
    const fileNames = (0, lib_1.createLazy)(() => loadFileNames(), folderSettings.cacheNames ?? true, folderSettings.useWeakRefs ?? false);
    await fileSystem.ensureDir(folderPath);
    return {
        path: folderPath,
        size,
        get,
        put,
        remove,
        exists,
        all,
        newest,
        clear,
        allObjects,
        allNames: async () => {
            return fileNames.get();
        },
    };
    async function size() {
        const names = await fileNames.get();
        return names.length;
    }
    async function put(obj, name, onNameAssigned) {
        let fileName;
        let isNewName;
        if (name === undefined || name.length === 0) {
            const objFileName = fileNameGenerator.next().value;
            if (onNameAssigned) {
                onNameAssigned(obj, objFileName);
            }
            fileName = objFileName;
            isNewName = true;
        }
        else {
            validateName(name);
            fileName = name;
            isNewName = !exists(name);
        }
        const filePath = fullPath(fileName);
        await writeObjectToFile(filePath, obj, folderSettings.serializer, folderSettings.safeWrites, fileSystem);
        if (isNewName) {
            pushName(fileName);
        }
        return fileName;
    }
    async function remove(name) {
        try {
            const fPath = fullPath(name);
            if (fileSystem.exists(fPath)) {
                await fileSystem.removeFile(fPath);
                const names = fileNames.value;
                if (names && names.length > 0) {
                    const i = names.indexOf(name);
                    if (i >= 0) {
                        names.splice(i, 1);
                    }
                }
            }
        }
        catch { }
    }
    function exists(name) {
        if (!name) {
            return false;
        }
        return fileSystem.exists(fullPath(name));
    }
    async function get(name) {
        if (!name) {
            return undefined;
        }
        validateName(name);
        const filePath = fullPath(name);
        return readObjectFromFile(filePath, settings?.deserializer, fileSystem);
    }
    async function* all() {
        const names = await fileNames.get();
        for (let name of names) {
            const value = await get(name);
            if (value) {
                yield { name: name, value: value };
            }
        }
    }
    async function* newest() {
        const names = await fileNames.get();
        for (let i = names.length - 1; i >= 0; --i) {
            const name = names[i];
            const value = await get(name);
            if (value) {
                yield { name: name, value: value };
            }
        }
    }
    async function clear() {
        try {
            await fileSystem.rmdir(folderPath);
            await fileSystem.ensureDir(folderPath);
            return;
        }
        catch { }
        // Could not rmdir. Manually delete each object
        const names = await fileNames.get();
        for (let name of names) {
            await remove(name);
        }
    }
    async function loadFileNames() {
        let names = await fileSystem.readdir(folderPath);
        if (folderSettings.safeWrites) {
            names = removeHidden(names);
        }
        names.sort();
        return names;
    }
    function pushName(name) {
        const names = fileNames.value;
        if (names) {
            (0, lib_1.insertIntoSorted)(names, name, (x, y) => x.localeCompare(y));
        }
    }
    async function* allObjects() {
        for await (const nv of all()) {
            yield nv.value;
        }
    }
    function fullPath(name) {
        return path.join(folderPath, name);
    }
    function createNameGenerator() {
        const fileNameType = folderSettings.fileNameType ?? FileNameType.Timestamp;
        return createFileNameGenerator(fileNameType === FileNameType.Timestamp
            ? generateTimestampString
            : generateTicksString, (name) => {
            return !fileSystem.exists(fullPath(name));
        });
    }
}
exports.createObjectFolder = createObjectFolder;
/**
 * Generate a monotonic name that is lexically SORTABLE
 * This method uses the current Date to generate a timestamp
 * @returns string
 */
function generateTimestampString(timestamp) {
    timestamp ??= new Date();
    let name = timestamp.toISOString();
    name = name.replace(/[-:.TZ]/g, "");
    return name;
}
exports.generateTimestampString = generateTimestampString;
function ensureUniqueObjectName(store, id) {
    if (!store.exists(id)) {
        return id;
    }
    return generateMonotonicName(1, id, (name) => {
        return !store.exists(name);
    }).name;
}
exports.ensureUniqueObjectName = ensureUniqueObjectName;
function generateTicksString(timestamp) {
    timestamp ??= new Date();
    return timestamp.getTime().toString();
}
exports.generateTicksString = generateTicksString;
const DIR_PREFIX = ".";
const TEMP_SUFFIX = "~";
const BACKUP_SUFFIX = "^";
function makeSubDirPath(basePath, name) {
    return path.join(basePath, ensureDirName(name));
}
exports.makeSubDirPath = makeSubDirPath;
function ensureDirName(name) {
    if (!name.startsWith(DIR_PREFIX)) {
        name = DIR_PREFIX + name;
    }
    return name;
}
function isHidden(name) {
    const lastChar = name[name.length - 1];
    return lastChar === TEMP_SUFFIX || lastChar === BACKUP_SUFFIX;
}
function removeHidden(names) {
    return names.filter((n) => !isHidden(n));
}
function toTempPath(filePath) {
    return filePath + TEMP_SUFFIX;
}
function toBackupPath(filePath) {
    return filePath + BACKUP_SUFFIX;
}
function validateName(name) {
    if (isHidden(name)) {
        throw new Error(`Object names cannot end with $${TEMP_SUFFIX} or ${BACKUP_SUFFIX} `);
    }
}
function generateMonotonicName(counterStartAt, baseName, isNameAcceptable, maxDigits = 3) {
    let counter = counterStartAt;
    let name;
    let maxCounter = 10 ^ maxDigits;
    for (; counter < maxCounter; ++counter) {
        name = baseName + intString(counter, maxDigits);
        if (isNameAcceptable(name)) {
            break;
        }
        // Name exists. Try again with next increment
    }
    return {
        name: name,
        lastCounter: counter,
    };
}
exports.generateMonotonicName = generateMonotonicName;
function* createFileNameGenerator(nameGenerator, isNameAcceptable) {
    let prevName = "";
    while (true) {
        let nextName = nameGenerator();
        if (prevName === nextName || !isNameAcceptable(nextName)) {
            const extendedName = generateMonotonicName(1, nextName, isNameAcceptable, 4).name;
            if (!extendedName) {
                continue;
            }
            nextName = extendedName;
        }
        yield nextName;
        prevName = nextName;
    }
}
exports.createFileNameGenerator = createFileNameGenerator;
const g_fsDefault = createFileSystem();
function fsDefault() {
    return g_fsDefault;
}
exports.fsDefault = fsDefault;
function createFileSystem() {
    return {
        exists: (path) => fs.existsSync(path),
        ensureDir,
        rmdir: (path) => fs.promises.rm(path, { recursive: true, force: true }),
        readdir,
        readFileNames,
        readDirectoryNames,
        write,
        readBuffer: (path) => fs.promises.readFile(path),
        read: (path) => fs.promises.readFile(path, "utf-8"),
        removeFile: (path) => (0, objStream_1.removeFile)(path),
        copyFile,
        copyDir,
        renameFile: (from, to) => (0, objStream_1.renameFileSync)(from, to),
    };
    async function ensureDir(folderPath) {
        if (!fs.existsSync(folderPath)) {
            await fs.promises.mkdir(folderPath, { recursive: true });
        }
    }
    async function readdir(path) {
        return await fs.promises.readdir(path);
    }
    async function readFileNames(dirPath) {
        const fileNames = await fs.promises.readdir(dirPath);
        return fileNames.filter((name) => fs.statSync(path.join(dirPath, name)).isFile());
    }
    async function readDirectoryNames(dirPath) {
        const fileNames = await fs.promises.readdir(dirPath);
        return fileNames.filter((name) => fs.statSync(path.join(dirPath, name)).isDirectory());
    }
    async function write(filePath, data) {
        try {
            await fs.promises.writeFile(filePath, data);
        }
        catch (error) {
            logError("fileSystem:write", filePath, error);
            throw error;
        }
    }
    async function copyDir(fromPath, toPath) {
        const sourceFileNames = await readdir(fromPath);
        for (const fileName of sourceFileNames) {
            const sourcePath = path.join(fromPath, fileName);
            const destPath = path.join(toPath, fileName);
            await fs.promises.copyFile(sourcePath, destPath);
        }
    }
    async function copyFile(src, dest, mode) {
        return await fs.promises.copyFile(src, dest, mode);
    }
}
function intString(num, minDigits) {
    return num.toString().padStart(minDigits, "0");
}
function logError(where, message, error) {
    const errorText = `ERROR:${where}\n${message}\n${error}`;
    console.log(errorText);
    storageError(errorText);
}
/**
 * Write to a temp file, then rename the file synchronously
 * @param filePath
 * @param data
 */
async function safeWrite(filePath, data, fSys) {
    const fileSystem = fSys ?? fsDefault();
    let tempFilePath = toTempPath(filePath);
    let backupFilePath;
    try {
        await fileSystem.write(tempFilePath, data);
        backupFilePath = toBackupPath(filePath);
        // These renames need to be synchronous to ensure atomicity
        if (!fileSystem.renameFile(filePath, backupFilePath)) {
            backupFilePath = undefined; // No backup file created because no filePath exists
        }
        try {
            fileSystem.renameFile(tempFilePath, filePath);
            tempFilePath = undefined;
        }
        catch (error) {
            // Try to name the file back to what it was
            if (backupFilePath) {
                fileSystem.renameFile(backupFilePath, filePath);
                backupFilePath = undefined;
            }
            throw error;
        }
    }
    catch (error) {
        logError("fileSystem:write", filePath, error);
        throw error;
    }
    finally {
        // Remove all temp files
        if (tempFilePath) {
            await fileSystem.removeFile(tempFilePath);
        }
        if (backupFilePath) {
            await fileSystem.removeFile(backupFilePath);
        }
    }
}
exports.safeWrite = safeWrite;
async function readObjectFromFile(filePath, deserializer, fSys) {
    const fileSystem = fSys ?? fsDefault();
    try {
        if (deserializer) {
            const buffer = await fileSystem.readBuffer(filePath);
            if (buffer.length == 0) {
                return undefined;
            }
            return deserializer(buffer);
        }
        else {
            const json = await fileSystem.read(filePath);
            if (json) {
                return JSON.parse(json);
            }
        }
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            logError("loadObjectFromFile", filePath, err);
        }
    }
    return undefined;
}
exports.readObjectFromFile = readObjectFromFile;
function writeObjectToFile(filePath, obj, serializer, safeWrites = false, fSys) {
    const fileSystem = fSys ?? fsDefault();
    const data = serializer ? serializer(obj) : JSON.stringify(obj);
    if (safeWrites) {
        return safeWrite(filePath, data);
    }
    else {
        return fileSystem.write(filePath, data);
    }
}
exports.writeObjectToFile = writeObjectToFile;
//# sourceMappingURL=objectFolder.js.map