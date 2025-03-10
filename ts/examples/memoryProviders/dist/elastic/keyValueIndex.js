// Copyright (c) Microsoft Corporation and Henry Lucco.
// Licensed under the MIT License.
import { toValidIndexName } from "./common.js";
export async function createKeyValueIndex(elasticClient, indexName) {
    indexName = toValidIndexName(indexName);
    if (!(await elasticClient.indices.exists({ index: indexName }))) {
        elasticClient.indices.create({
            index: indexName,
        });
    }
    return {
        get,
        getMultiple,
        put,
        replace,
        remove,
    };
    async function get(id) {
        try {
            const response = await elasticClient.get({
                index: indexName,
                id: id,
            });
            return response._source?.valueIds;
        }
        catch (e) {
            // id is not found, return undefined
            return undefined;
        }
    }
    async function getMultiple(ids) {
        const response = await elasticClient.mget({
            index: indexName,
            body: {
                ids: ids,
            },
        });
        const textIds = response.docs.map((doc) => doc._id);
        const sourceIdsMaybe = await Promise.all(textIds.map(async (textId) => {
            return await get(textId);
        }));
        const sourceIds = sourceIdsMaybe.filter((sourceId) => sourceId !== undefined);
        return sourceIds;
    }
    async function put(postings, id) {
        const entry = {
            keyId: id,
            valueIds: postings,
        };
        const putResponse = await elasticClient.index({
            index: indexName,
            id: id,
            body: entry,
        });
        return putResponse._id;
    }
    async function replace(postings, id) {
        return await put(postings, id);
    }
    async function remove(id) {
        await elasticClient.delete({
            index: indexName,
            id: id,
        });
    }
}
//# sourceMappingURL=keyValueIndex.js.map