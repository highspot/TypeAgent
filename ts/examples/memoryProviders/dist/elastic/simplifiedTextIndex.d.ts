import { Client } from "@elastic/elasticsearch";
import { TextIndex, TextIndexSettings, ValueDataType, ValueType } from "knowledge-processor";
export declare function createTextIndex<TTexId extends ValueType = string, TSourceId extends ValueType = string>(settings: TextIndexSettings, indexName: string, elasticClient: Client, sourceIdType: ValueDataType<TSourceId>): Promise<TextIndex<TTexId, TSourceId>>;
//# sourceMappingURL=simplifiedTextIndex.d.ts.map