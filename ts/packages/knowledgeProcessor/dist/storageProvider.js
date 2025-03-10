// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createObjectFolder, } from "typeagent";
import { createTextIndex } from "./textIndex.js";
import path from "path";
import { createTemporalLog, } from "./temporal.js";
import { createIndexFolder } from "./keyValueIndex.js";
export function createFileSystemStorageProvider(rootPath, defaultFolderSettings, fSys) {
    return {
        createObjectFolder: _createObjectFolder,
        createTemporalLog: _createTemporalLog,
        createTextIndex: _createTextIndex,
        createIndex: _createIndex,
        clear,
    };
    async function _createObjectFolder(basePath, name, settings) {
        verifyPath(basePath);
        return createObjectFolder(path.join(basePath, name), settings ?? defaultFolderSettings, fSys);
    }
    async function _createTemporalLog(settings, basePath, name) {
        verifyPath(basePath);
        return createTemporalLog(settings, path.join(basePath, name), defaultFolderSettings, fSys);
    }
    async function _createTextIndex(settings, basePath, name, sourceIdType) {
        if (sourceIdType !== "TEXT") {
            throw new Error(`SourceId of type ${sourceIdType} not supported.`);
        }
        verifyPath(basePath);
        return createTextIndex(settings, path.join(basePath, name), defaultFolderSettings, fSys);
    }
    async function _createIndex(basePath, name, valueType) {
        verifyPath(basePath);
        return createIndexFolder(path.join(basePath, name), defaultFolderSettings, fSys);
    }
    function verifyPath(basePath) {
        if (!basePath.startsWith(rootPath)) {
            throw new Error(`${basePath} must be a subDir of ${rootPath}`);
        }
    }
    async function clear() {
        // TODO: implement this once conversation is cleaned up and message Index is also backed by storageProvider
        // await removeDir(rootPath, fSys);
    }
}
//# sourceMappingURL=storageProvider.js.map