import { Client } from "@elastic/elasticsearch";
import { KeyValueIndex, ValueType } from "knowledge-processor";
export declare function createKeyValueIndex<TKeyId extends ValueType = string, TValueId extends ValueType = string>(elasticClient: Client, indexName: string): Promise<KeyValueIndex<TKeyId, TValueId>>;
//# sourceMappingURL=keyValueIndex.d.ts.map