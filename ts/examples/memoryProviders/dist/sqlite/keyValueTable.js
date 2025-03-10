// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function createKeyValueTable(db, tableName, keyType, valueType, ensureExists = true) {
    const schemaSql = `  
    CREATE TABLE IF NOT EXISTS ${tableName} (  
      keyId ${keyType} NOT NULL,
      valueId ${valueType} NOT NULL,
      PRIMARY KEY(keyId, valueId)  
    );`;
    if (ensureExists) {
        db.exec(schemaSql);
    }
    const sql_get = db.prepare(`SELECT valueId from ${tableName} WHERE keyId = ? ORDER BY valueId ASC`);
    const sql_getScored = db.prepare(`SELECT valueId as item, @score as score 
        FROM ${tableName} WHERE keyId = @keyId ORDER BY valueId ASC`);
    const sql_add = db.prepare(`INSERT OR IGNORE INTO ${tableName} (keyId, valueId) VALUES (?, ?)`);
    const sql_remove = db.prepare(`DELETE FROM ${tableName} WHERE keyId = ?`);
    return {
        schemaSql,
        tableName,
        get,
        getSync,
        getMultiple,
        getHits,
        iterate,
        iterateScored,
        iterateMultiple,
        iterateMultipleScored,
        put,
        putSync,
        replace,
        remove,
    };
    function get(id) {
        const rows = sql_get.all(id);
        return Promise.resolve(rows.length > 0 ? rows.map((r) => r.valueId) : undefined);
    }
    function getSync(id) {
        const rows = sql_get.all(id);
        return rows.length > 0 ? rows.map((r) => r.valueId) : undefined;
    }
    function* iterate(keyId) {
        const rows = sql_get.iterate(keyId);
        let count = 0;
        for (const row of rows) {
            yield row.valueId;
            ++count;
        }
        if (count === 0) {
            return undefined;
        }
    }
    function iterateScored(keyId, score) {
        return sql_getScored.iterate({
            score: score,
            keyId,
        });
    }
    function* iterateMultiple(ids) {
        if (ids.length === 0) {
            return undefined;
        }
        if (ids.length === 0) {
            return iterate(ids[0]);
        }
        const sql = `SELECT DISTINCT valueId FROM ${tableName} 
        WHERE keyId IN (${ids}) 
        ORDER BY valueId ASC`;
        const stmt = db.prepare(sql);
        const rows = stmt.iterate();
        let count = 0;
        for (const row of rows) {
            yield row.valueId;
            ++count;
        }
        if (count === 0) {
            return undefined;
        }
    }
    function iterateMultipleScored(items) {
        if (items.length === 0) {
            return undefined;
        }
        const sql = sql_multipleScored(items);
        const stmt = db.prepare(sql);
        return stmt.iterate();
    }
    function getMultiple(ids, concurrency) {
        let matches = [];
        let valueIds = [];
        for (const id of ids) {
            const rows = sql_get.iterate(id);
            for (const row of rows) {
                valueIds.push(row.valueId);
            }
            if (valueIds.length > 0) {
                matches.push(valueIds);
                valueIds = [];
            }
        }
        return Promise.resolve(matches);
    }
    function* getHits(ids, join) {
        if (ids.length === 0) {
            return undefined;
        }
        const sql = join
            ? `SELECT valueId AS item, count(*) AS score FROM ${tableName}
        ${join} AND keyId IN (${ids})
        GROUP BY valueId 
        ORDER BY score DESC`
            : `SELECT valueId AS item, count(*) AS score FROM ${tableName}
        WHERE keyId IN (${ids})
        GROUP BY valueId 
        ORDER BY score DESC`;
        const stmt = db.prepare(sql);
        for (const row of stmt.iterate()) {
            yield row;
        }
    }
    function put(values, id) {
        if (id === undefined) {
            // TODO: support
            throw new Error("Not supported");
        }
        return Promise.resolve(putSync(values, id));
    }
    function putSync(values, id) {
        for (let i = 0; i < values.length; ++i) {
            sql_add.run(id, values[i]);
        }
        return id;
    }
    function replace(values, id) {
        sql_remove.run(id);
        return put(values, id);
    }
    function remove(id) {
        sql_remove.run(id);
        return Promise.resolve();
    }
    function sql_multipleScored(items) {
        let sql = "SELECT item, SUM(score) AS score FROM (\n";
        sql += sql_unionAllPostings(items);
        sql += "\n)\n";
        sql += "GROUP BY item";
        return sql;
    }
    function sql_unionAllPostings(items) {
        let sql = "";
        for (const item of items) {
            if (sql.length > 0) {
                sql += "\nUNION ALL\n";
            }
            sql += `SELECT valueId as item, ${item.score} as score 
            FROM ${tableName} WHERE keyId = ${item.item}`;
        }
        sql += "\nORDER BY valueId ASC";
        return sql;
    }
}
//# sourceMappingURL=keyValueTable.js.map