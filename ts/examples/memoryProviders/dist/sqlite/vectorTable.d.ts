import * as sqlite from "better-sqlite3";
import { VectorStore } from "typeagent";
import { ValueType, ValueDataType } from "knowledge-processor";
export interface VectorTable<TKeyId extends ValueType = string> extends VectorStore<TKeyId> {
}
export declare function createVectorTable<TKeyId extends ValueType = string>(db: sqlite.Database, tableName: string, keyType: ValueDataType<TKeyId>, ensureExists?: boolean): VectorTable<TKeyId>;
//# sourceMappingURL=vectorTable.d.ts.map