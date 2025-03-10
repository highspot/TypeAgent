import * as sqlite from "better-sqlite3";
import * as knowLib from "knowledge-processor";
import { dateTime } from "typeagent";
import { ValueType, ValueDataType } from "knowledge-processor";
export type TemporalLogRow<T> = {
    logId: number;
    timestamp: string;
    dateTime: string;
    value: T | number;
};
export interface TemporalTable<TLogId = any, T = any> extends knowLib.TemporalLog<TLogId, T> {
    addSync(value: T, timestamp?: Date): TLogId;
    getSync(id: TLogId): dateTime.Timestamped<T> | undefined;
    iterateIdsRange(startAt: Date, stopAt?: Date): IterableIterator<TLogId>;
    iterateRange(startAt: Date, stopAt?: Date): IterableIterator<dateTime.Timestamped<T>>;
    iterateOldest(count: number): IterableIterator<dateTime.Timestamped>;
    iterateNewest(count: number): IterableIterator<dateTime.Timestamped>;
    sql_joinRange(startAt: Date, stopAt?: Date): string;
}
export declare function createTemporalLogTable<T = any, TValue extends ValueType = string, TLogId extends ValueType = number>(db: sqlite.Database, tableName: string, keyType: ValueDataType<TLogId>, valueType: ValueDataType<TValue>, ensureExists?: boolean): TemporalTable<TLogId, T>;
//# sourceMappingURL=temporalTable.d.ts.map