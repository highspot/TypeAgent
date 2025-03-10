import * as sqlite from "better-sqlite3";
export declare function createDatabase(filePath: string, createNew: boolean): Promise<sqlite.Database>;
export declare function sql_makeInClause(values: any[]): string;
export declare function sql_appendCondition(sql: string, condition: string, and?: boolean): string;
//# sourceMappingURL=database.d.ts.map