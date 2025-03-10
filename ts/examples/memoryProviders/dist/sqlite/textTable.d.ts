import * as sqlite from "better-sqlite3";
import { AssignedId } from "./common.js";
import { TextIndex, TextIndexSettings } from "knowledge-processor";
import { ValueType, ValueDataType } from "knowledge-processor";
import { ScoredItem } from "typeagent";
export type StringTableRow = {
    stringId: number;
    value: string;
};
export interface StringTable {
    readonly tableName: string;
    readonly schemaSql: string;
    ids(): IterableIterator<number>;
    values(): IterableIterator<string>;
    entries(): IterableIterator<StringTableRow>;
    exists(value: string): boolean;
    getId(value: string): number | undefined;
    getIds(value: string[]): IterableIterator<number>;
    getText(id: number): string | undefined;
    getTexts(ids: number[]): IterableIterator<string>;
    add(value: string): AssignedId<number>;
    add(values: string[]): AssignedId<number>[];
    remove(value: string): void;
}
export declare function createStringTable(db: sqlite.Database, tableName: string, caseSensitive?: boolean, ensureExists?: boolean): StringTable;
export interface TextTable<TTextId = any, TSourceId = any> extends TextIndex<TTextId, TSourceId> {
    getExactHits(values: string[], join?: string): IterableIterator<ScoredItem<TSourceId>>;
}
export declare function createTextIndex<TTextId extends ValueType = number, TSourceId extends ValueType = string>(settings: TextIndexSettings, db: sqlite.Database, baseName: string, textIdType: ValueDataType<TTextId>, valueType: ValueDataType<TSourceId>, ensureExists?: boolean): Promise<TextTable<TTextId, TSourceId>>;
//# sourceMappingURL=textTable.d.ts.map