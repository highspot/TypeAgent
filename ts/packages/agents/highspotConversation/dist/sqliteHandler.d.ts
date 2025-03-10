import { Database as DatabaseType } from "better-sqlite3";
export interface ISqliteDB {
    loadCSV(filename: string): Promise<string>;
    getDB(): Promise<DatabaseType>;
    getTableName(): Promise<string[]>;
    getColumnNames(tableName: string): Promise<string[]>;
    query(sql: string): Promise<string>;
}
export declare function createSqliteDb(): Promise<ISqliteDB>;
//# sourceMappingURL=sqliteHandler.d.ts.map