import * as sqlite from "better-sqlite3";
import { ValueDataType, ValueType } from "knowledge-processor";
export type AssignedId<T> = {
    id: T;
    isNew: boolean;
};
export type BooleanRow = {};
export declare function createDatabase(filePath: string, createNew: boolean): Promise<sqlite.Database>;
export declare function deleteDatabase(filePath: string): Promise<void>;
export declare function tablePath(rootName: string, name: string): string;
export declare function sql_makeInClause(values: any[]): string;
export type ColumnSerializer = {
    serialize: (x: any) => any;
    deserialize: (x: any) => any;
};
export declare function getTypeSerializer<T extends ValueType>(type: ValueDataType<T>): [boolean, ColumnSerializer];
//# sourceMappingURL=common.d.ts.map