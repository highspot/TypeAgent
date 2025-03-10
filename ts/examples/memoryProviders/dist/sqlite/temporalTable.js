// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { dateTime } from "typeagent";
import { getTypeSerializer, sql_makeInClause } from "./common.js";
export function createTemporalLogTable(db, tableName, keyType, valueType, ensureExists = true) {
    const [isIdInt, idSerializer] = getTypeSerializer(keyType);
    const isValueInt = valueType === "INTEGER";
    const schemaSql = `  
    CREATE TABLE IF NOT EXISTS ${tableName} (
      logId INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      dateTime TEXT NOT NULL,
      value ${valueType} NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_${tableName}_timestamp ON ${tableName} (timestamp);
    `;
    if (ensureExists) {
        db.exec(schemaSql);
    }
    const sql_size = db.prepare(`SELECT count(logId) as count from ${tableName}`);
    const sql_get = db.prepare(`SELECT dateTime, value FROM ${tableName} WHERE logId = ?`);
    const sql_add = db.prepare(`INSERT INTO ${tableName} (timestamp, dateTime, value) VALUES (?, ?, ?)`);
    const sql_rangeStartAt = db.prepare(`SELECT logId FROM ${tableName} WHERE timestamp >= ?`);
    const sql_range = db.prepare(`SELECT logId FROM ${tableName} WHERE timestamp >= ? AND timestamp <= ?`);
    const sql_rangeStartAtObj = db.prepare(`SELECT logId, dateTime, value FROM ${tableName} WHERE timestamp >= ?`);
    const sql_rangeObj = db.prepare(`SELECT logId, dateTime, value FROM ${tableName} WHERE timestamp >= ? AND timestamp <= ?`);
    const sql_oldest = db.prepare(`SELECT dateTime, value FROM ${tableName}
         WHERE timestamp IN (
            SELECT DISTINCT timestamp 
            FROM ${tableName} 
            ORDER BY timestamp ASC 
            LIMIT ?
        )
        ORDER BY timestamp ASC`);
    const sql_newest = create_sql_newest();
    const sql_minMax = db.prepare(`
        SELECT 
            (SELECT timestamp from ${tableName} ORDER BY timestamp ASC LIMIT 1) 
            AS start,
            (SELECT timestamp from ${tableName} ORDER BY timestamp DESC LIMIT 1) 
            AS end`);
    return {
        size,
        all,
        allObjects,
        addSync,
        put,
        get,
        getMultiple,
        getSync,
        getIdsInRange,
        getEntriesInRange,
        getNewest,
        getOldest,
        getTimeRange,
        newestObjects,
        remove,
        removeInRange,
        clear,
        iterateIdsRange,
        iterateRange,
        iterateOldest,
        iterateNewest,
        sql_joinRange,
    };
    function size() {
        const row = sql_size.get();
        const count = row ? row.count : 0;
        return Promise.resolve(count);
    }
    async function* all() {
        const sql = create_sql_all();
        for (const row of sql.iterate()) {
            yield {
                name: idSerializer.serialize(row.logId),
                value: deserialize(row),
            };
        }
    }
    async function* allObjects() {
        const sql = create_sql_all();
        for (const row of sql.iterate()) {
            yield deserialize(row);
        }
    }
    function put(value, timestamp) {
        return Promise.resolve(addSync(value, timestamp));
    }
    function addSync(value, timestamp) {
        let rowValue;
        if (isValueInt) {
            if (typeof value !== "number") {
                throw Error(`${value} must be a number`);
            }
            rowValue = value;
        }
        else {
            rowValue = JSON.stringify(value);
        }
        timestamp ??= new Date();
        const timestampString = dateTime.timestampString(timestamp);
        const result = sql_add.run(timestampString, timestamp.toISOString(), rowValue);
        return idSerializer.serialize(result.lastInsertRowid);
    }
    function get(id) {
        return Promise.resolve(getSync(id));
    }
    async function getMultiple(ids) {
        const idsClause = isIdInt ? ids : sql_makeInClause(ids);
        const sql = db.prepare(`SELECT dateTime, value FROM ${tableName} WHERE logId IN (${idsClause})`);
        const objects = [];
        for (const row of sql.iterate()) {
            objects.push(deserialize(row));
        }
        return objects;
    }
    function getSync(id) {
        const row = sql_get.get(idSerializer.deserialize(id));
        return row ? deserialize(row) : undefined;
    }
    async function getIdsInRange(startAt, stopAt) {
        return [...iterateIdsRange(startAt, stopAt)];
    }
    async function getEntriesInRange(startAt, stopAt) {
        return [...iterateRange(startAt, stopAt)];
    }
    async function getTimeRange() {
        const row = sql_minMax.get();
        if (row) {
            const { min, max } = row;
            return {
                startDate: new Date(min),
                stopDate: new Date(max),
            };
        }
        return undefined;
    }
    async function getNewest(count) {
        return [...iterateNewest(count)];
    }
    async function getOldest(count) {
        return [...iterateOldest(count)];
    }
    async function* newestObjects() {
        // Async iterable. Use a separate statement
        const sql = create_sql_allNewest();
        for (const row of sql.iterate()) {
            yield deserialize(row);
        }
    }
    async function remove(id) {
        const stmt = db.prepare(`DELETE FROM ${tableName} WHERE logId = ?`);
        stmt.run(idSerializer.deserialize(id));
    }
    async function removeInRange(startAt, stopAt) {
        const rangeStart = dateTime.timestampString(startAt);
        const rangeEnd = dateTime.timestampString(stopAt);
        const stmt = db.prepare(`DELETE FROM ${tableName} WHERE timestamp >= ? AND timestamp <= rangeEnd`);
        stmt.run(rangeStart, rangeEnd);
    }
    async function clear() {
        const stmt = db.prepare(`DELETE * FROM ${tableName}`);
        stmt.run();
    }
    function* iterateRange(startAt, stopAt) {
        const rangeStart = dateTime.timestampString(startAt);
        const rangeEnd = stopAt ? dateTime.timestampString(stopAt) : undefined;
        if (rangeEnd) {
            for (const row of sql_rangeObj.iterate(rangeStart, rangeEnd)) {
                yield deserialize(row);
            }
        }
        else {
            for (const row of sql_rangeStartAtObj.iterate(rangeStart)) {
                yield deserialize(row);
            }
        }
    }
    function* iterateIdsRange(startAt, stopAt) {
        const range = dateTime.timestampRange(startAt, stopAt);
        if (range.endTimestamp) {
            for (const row of sql_range.iterate(range.startTimestamp, range.endTimestamp)) {
                yield idSerializer.serialize(row.logId);
            }
        }
        else {
            for (const row of sql_rangeStartAt.iterate(range.startTimestamp)) {
                yield idSerializer.serialize(row.logId);
            }
        }
    }
    function* iterateOldest(count) {
        for (const row of sql_oldest.iterate(count)) {
            yield deserialize(row);
        }
    }
    function* iterateNewest(count) {
        for (const row of sql_newest.iterate(count)) {
            yield deserialize(row);
        }
    }
    function sql_joinRange(startAt, stopAt) {
        const range = dateTime.timestampRange(startAt, stopAt);
        let sql = `INNER JOIN ${tableName} ON ${tableName}.value = valueId\n`;
        sql += `WHERE ${tableName}.timestamp >= '${range.startTimestamp}'`;
        if (range.endTimestamp) {
            sql += ` AND ${tableName}.timestamp <= '${range.endTimestamp}'`;
        }
        return sql;
    }
    function deserialize(row) {
        const logRow = row;
        return {
            timestamp: new Date(logRow.dateTime),
            value: isValueInt
                ? logRow.value
                : JSON.parse(logRow.value),
        };
    }
    function create_sql_all() {
        return db.prepare(`SELECT logId, dateTime, value FROM ${tableName}`);
    }
    function create_sql_newest() {
        return db.prepare(`SELECT dateTime, value FROM ${tableName}
             WHERE timestamp IN (
                SELECT DISTINCT timestamp 
                FROM ${tableName} 
                ORDER BY timestamp DESC 
                LIMIT ?
            )
            ORDER BY timestamp DESC`);
    }
    function create_sql_allNewest() {
        return db.prepare(`SELECT dateTime, value FROM ${tableName} ORDER BY timestamp DESC`);
    }
}
//# sourceMappingURL=temporalTable.js.map