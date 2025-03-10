/// <reference types="node" resolution-mode="require"/>
import * as sqlite from "better-sqlite3";
import { ObjectFolder, ObjectFolderSettings } from "typeagent";
export type ObjectTableRow = {
    name: string;
    text?: string | undefined;
    blob?: Buffer | undefined;
};
export declare function createObjectTable<T>(db: sqlite.Database, tableName: string, settings?: ObjectFolderSettings | undefined, ensureExists?: boolean): ObjectFolder<T>;
//# sourceMappingURL=objectTable.d.ts.map