// Copyright (c) Microsoft Corporation and Henry Lucco.
// Licensed under the MIT License.
import { Client } from "@elastic/elasticsearch";
import { createHash } from "crypto";
export async function createElasicClient(uri, createNew) {
    const elasticApiKey = process.env.ELASTIC_API_KEY;
    if (!elasticApiKey) {
        throw new Error("ELASTIC_API_KEY environment variable not set");
    }
    try {
        const elasticClient = new Client({
            node: uri,
            auth: {
                apiKey: elasticApiKey,
            },
        });
        if (createNew) {
            await deleteIndeces(elasticClient);
        }
        return elasticClient;
    }
    catch (err) {
        throw new Error(`Failed to create elastic client: ${err}`);
    }
}
export async function deleteIndeces(elasticClient) {
    const infoArray = await elasticClient.cat.indices({ format: "json" });
    infoArray.forEach((indexInfo) => {
        const indexName = indexInfo.index || undefined;
        if (indexName !== undefined) {
            elasticClient.indices.delete({
                index: indexName,
            });
        }
    });
}
export function generateTextId(text) {
    // Hash text to create an id
    const hash = createHash("sha256").update(text, "utf-8").digest("hex");
    return hash;
}
/**
 * Converts a given string into a valid Elasticsearch index name by
 * replacing invalid characters with underscores.
 *
 * @param {string} name - The name to be converted.
 * @returns {string} A valid index name.
 */
export function toValidIndexName(name) {
    // Regex of all invalid characters
    const invalidChars = /[<>\"\\\/\|\?\*]/g;
    // Replace invalid chars with underscores
    return name.replace(invalidChars, "_").toLowerCase();
}
//# sourceMappingURL=common.js.map