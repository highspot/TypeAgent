// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Database from "better-sqlite3";
import { removeFile } from "typeagent";
import { createRequire } from "node:module";
import path from "node:path";
function getDbOptions() {
    if (process?.versions?.electron !== undefined) {
        return undefined;
    }
    const r = createRequire(import.meta.url);
    const betterSqlitePath = r.resolve("better-sqlite3/package.json");
    const nativeBinding = path.join(betterSqlitePath, "../build/Release/better_sqlite3.n.node");
    return { nativeBinding };
}
export async function createDatabase(filePath, createNew) {
    if (createNew) {
        await deleteDatabase(filePath);
    }
    const db = new Database(filePath, getDbOptions());
    db.pragma("journal_mode = WAL");
    return db;
}
export async function deleteDatabase(filePath) {
    await removeFile(filePath);
    await removeFile(filePath + "-shm");
    await removeFile(filePath + "-wal");
}
export function tablePath(rootName, name) {
    return rootName + "_" + name;
}
export function sql_makeInClause(values) {
    let sql = "";
    for (let i = 0; i < values.length; ++i) {
        if (i > 0) {
            sql += ", ";
        }
        sql += `'${values[i]}'`;
    }
    return sql;
}
export function getTypeSerializer(type) {
    const isIdInt = type === "INTEGER";
    const serializer = {
        serialize: isIdInt
            ? (x) => x
            : (x) => (x ? x.toString() : undefined),
        deserialize: isIdInt ? (x) => x : (x) => Number.parseInt(x),
    };
    return [isIdInt, serializer];
}
//# sourceMappingURL=common.js.map