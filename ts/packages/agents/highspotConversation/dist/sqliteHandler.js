import Database from "better-sqlite3";
import { createReadStream } from "fs";
import csv from "csv-parser";
import path from "path";
export async function createSqliteDb() {
    const db = new Database("/users/henry.lucco/typeagent.db");
    return {
        query,
        getDB,
        loadCSV,
        getTableName,
        getColumnNames
    };
    async function query(sql) {
        const rows = db.prepare(sql).all();
        return JSON.stringify(rows);
    }
    async function getDB() {
        return db;
    }
    async function getColumnNames(tableName) {
        const rows = db
            .prepare(`PRAGMA table_info(${tableName})`)
            .all();
        const columnNames = rows.map(row => row.name);
        return columnNames;
    }
    async function getTableName() {
        const rows = db
            .prepare(`
          SELECT name 
          FROM sqlite_master 
          WHERE type='table' 
            AND name NOT LIKE 'sqlite_%'
        `)
            .all();
        const tableNames = rows.map(row => row.name);
        return tableNames;
    }
    async function loadCSV(filename) {
        const rows = [];
        let headers = [];
        const tableName = path.basename(filename, '.csv');
        console.log(`Loading CSV file: ${filename} to table ${tableName}`);
        await new Promise((resolve, reject) => {
            const parser = csv();
            parser.on('headers', (csvHeaders) => {
                headers = csvHeaders;
                headers = headers.map((header) => header.replaceAll("\"", ""));
                console.log(headers);
                const columnsDefinition = headers.map((header) => `"${header}" TEXT`).join(', ');
                const createTableSQL = `CREATE TABLE ${tableName} (${columnsDefinition})`;
                console.log('Creating table with SQL:', createTableSQL);
                try {
                    db.exec(createTableSQL);
                }
                catch (err) {
                    return reject(err);
                }
            });
            parser.on('data', (data) => {
                rows.push(data);
            });
            parser.on('end', () => {
                resolve();
            });
            parser.on('error', (err) => {
                reject(err);
            });
            createReadStream(filename)
                .on('error', (err) => reject(err))
                .pipe(parser);
        });
        console.log(`Finished parsing CSV with ${rows.length} rows.`);
        if (headers.length === 0) {
            console.error('No headers found; cannot create table.');
            return "No headers found; cannot create table.";
        }
        const placeholders = headers.map(() => '?').join(', ');
        const columnsList = headers.map((header) => `"${header}"`).join(', ');
        const insertSQL = `INSERT INTO ${tableName} (${columnsList}) VALUES (${placeholders})`;
        console.log('Inserting rows with SQL:', insertSQL);
        const insertStmt = db.prepare(insertSQL);
        const insertMany = db.transaction((rows) => {
            for (const row of rows) {
                const values = headers.map((header) => row[header]);
                insertStmt.run(values);
            }
        });
        insertMany(rows);
        const results = db.prepare(`SELECT * FROM ${tableName}`).all();
        console.log('Query Results:', results);
        return `Loaded ${rows.length} rows into table ${tableName}`;
    }
}
//# sourceMappingURL=sqliteHandler.js.map