import { Client } from "@elastic/elasticsearch";
export declare function createElasicClient(uri: string, createNew: boolean): Promise<Client>;
export declare function deleteIndeces(elasticClient: Client): Promise<void>;
export declare function generateTextId(text: string): string;
/**
 * Converts a given string into a valid Elasticsearch index name by
 * replacing invalid characters with underscores.
 *
 * @param {string} name - The name to be converted.
 * @returns {string} A valid index name.
 */
export declare function toValidIndexName(name: string): string;
//# sourceMappingURL=common.d.ts.map