// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "path";
import { createDatabase, tablePath } from "./common.js";
import { createTextIndex } from "./textTable.js";
import { createObjectTable } from "./objectTable.js";
import { ensureDir } from "typeagent";
import { createTemporalLogTable } from "./temporalTable.js";
import { createKeyValueTable } from "./keyValueTable.js";
export async function createStorageDb(rootPath, name, createNew) {
    await ensureDir(rootPath);
    const dbPath = path.join(rootPath, name);
    let db = await createDatabase(dbPath, createNew);
    let counter = 0;
    return {
        rootPath,
        name,
        createObjectFolder: _createObjectFolder,
        createTemporalLog: _createTemporalLog,
        createTextIndex: _createTextIndex,
        createIndex: _createIndex,
        close,
        clear,
    };
    async function _createObjectFolder(basePath, name, settings) {
        ensureOpen();
        return createObjectTable(db, getTablePath(basePath, name), settings);
    }
    async function _createTemporalLog(settings, basePath, name) {
        ensureOpen();
        return createTemporalLogTable(db, getTablePath(basePath, name), "TEXT", "TEXT");
    }
    async function _createTextIndex(settings, basePath, name, sourceIdType) {
        ensureOpen();
        return createTextIndex(settings, db, getTablePath(basePath, name), "TEXT", sourceIdType);
    }
    async function _createIndex(basePath, name, valueType) {
        ensureOpen();
        return createKeyValueTable(db, getTablePath(basePath, name), "TEXT", valueType);
    }
    function getTablePath(basePath, name) {
        basePath = basePath.replace(rootPath, "");
        const baseDir = path
            .basename(basePath)
            .replaceAll("/", "_")
            .replaceAll("\\", "_");
        return tablePath(baseDir, name);
    }
    function ensureOpen() {
        if (db && db.open) {
            return;
        }
        throw new Error(`Database ${rootPath}, version ${counter} is not open`);
    }
    function close() {
        if (db) {
            db.close();
        }
    }
    async function clear() {
        close();
        db = await createDatabase(dbPath, true);
        counter++;
    }
}
//# sourceMappingURL=storageDb.js.map