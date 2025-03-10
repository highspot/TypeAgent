import * as sqlite from "better-sqlite3";
import * as knowLib from "knowledge-processor";
import { ValueType, ValueDataType } from "knowledge-processor";
import { ScoredItem } from "typeagent";
export interface KeyValueTable<TKeyId extends ValueType = string, TValueId extends ValueType = string> extends knowLib.KeyValueIndex<TKeyId, TValueId> {
    readonly schemaSql: string;
    readonly tableName: string;
    getSync(id: TKeyId): TValueId[] | undefined;
    putSync(postings: TValueId[], id: TKeyId): TKeyId;
    iterate(id: TKeyId): IterableIterator<TValueId> | undefined;
    iterateScored(id: TKeyId, score?: number): IterableIterator<ScoredItem<TValueId>> | undefined;
    iterateMultiple(ids: TKeyId[]): IterableIterator<TValueId> | undefined;
    iterateMultipleScored(items: ScoredItem<TKeyId>[]): IterableIterator<ScoredItem<TValueId>> | undefined;
    getHits(ids: TKeyId[], join?: string): IterableIterator<ScoredItem<TValueId>> | undefined;
}
export declare function createKeyValueTable<TKeyId extends ValueType = string, TValueId extends ValueType = string>(db: sqlite.Database, tableName: string, keyType: ValueDataType<TKeyId>, valueType: ValueDataType<TValueId>, ensureExists?: boolean): KeyValueTable<TKeyId, TValueId>;
//# sourceMappingURL=keyValueTable.d.ts.map