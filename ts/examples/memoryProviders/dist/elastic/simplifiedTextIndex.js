// Copyright (c) Microsoft Corporation and Henry Lucco.
// Licensed under the MIT License.
import { TextBlockType, } from "knowledge-processor";
import { generateTextId, toValidIndexName } from "./common.js";
import { generateEmbedding } from "typeagent";
import { openai } from "aiclient";
const { ModelType, createEmbeddingModel } = openai;
import { openAIApiSettingsFromEnv } from "../../../../packages/aiclient/dist/openaiSettings.js";
export async function createTextIndex(settings, indexName, elasticClient, sourceIdType) {
    indexName = toValidIndexName(indexName);
    const apiSettings = openAIApiSettingsFromEnv(ModelType.Embedding);
    const embeddingModel = createEmbeddingModel(apiSettings);
    // Create the textIndex in elastic search
    if (!(await elasticClient.indices.exists({ index: indexName }))) {
        await elasticClient.indices.create({
            index: indexName,
            mappings: {
                properties: {
                    text: { type: "keyword" },
                    textId: { type: "keyword" },
                    sourceIds: { type: "keyword" },
                    textVector: {
                        type: "dense_vector",
                        dims: parseInt(process.env.OPENAI_MODEL_EMBEDDING_DIM || "1536"),
                        index: true,
                        similarity: "cosine",
                    },
                },
            },
        });
    }
    return {
        text: () => values(),
        ids,
        entries,
        get,
        getFrequency,
        getById,
        getByIds,
        getId,
        getIds,
        getText,
        getNearest,
        getNearestMultiple,
        getNearestText,
        getNearestTextMultiple,
        getNearestHits,
        getNearestHitsMultiple,
        put,
        putMultiple,
        addSources,
        nearestNeighbors,
        nearestNeighborsText,
        nearestNeighborsPairs,
        remove,
    };
    // This should be an AsyncIterableIterator in the
    // interface definition.
    function values() {
        const query = {
            _source: false,
            query: { match_all: {} },
        };
        // Fetch and prepare the results synchronously
        const hits = [];
        elasticClient
            .search({
            index: indexName,
            body: query,
        })
            .then((result) => {
            hits.push(...result.hits.hits);
        })
            .catch((err) => {
            console.error("Error fetching results:", err);
        });
        // Synchronous generator to iterate over the results
        function* generateResults() {
            for (const hit of hits) {
                yield hit._source.text;
            }
        }
        return generateResults();
    }
    async function* ids() {
        const result = await elasticClient.search({
            index: indexName,
            // scroll: '1m',
            query: { match_all: {} },
            _source: ["textId"],
        });
        for (const hit of result.hits.hits) {
            if (hit._source !== undefined) {
                yield hit._source.textId;
            }
        }
    }
    async function* entries() {
        const result = await elasticClient.search({
            index: indexName,
            // scroll: '1m',
            query: { match_all: {} },
            _source: ["text", "sourceIds"],
        });
        for (const hit of result.hits.hits) {
            if (hit._source !== undefined) {
                yield {
                    type: TextBlockType.Sentence,
                    value: hit._source.text,
                    sourceIds: hit._source.sourceIds,
                };
            }
        }
    }
    async function get(text) {
        const result = await elasticClient.search({
            index: indexName,
            body: { query: { match: { text } } },
        });
        if (result.hits.hits.length > 0) {
            const hit = result.hits.hits[0]._source;
            if (hit !== undefined) {
                return hit.sourceIds;
            }
        }
        return undefined;
    }
    async function getFrequency(text) {
        const result = await elasticClient.search({
            index: indexName,
            body: { query: { match: { text } } },
        });
        if (result.hits.hits.length > 0) {
            const hit = result.hits.hits[0]._source;
            if (hit !== undefined) {
                return hit.sourceIds.length;
            }
        }
        return 0;
    }
    async function getById(id) {
        try {
            const result = await elasticClient.get({
                index: indexName,
                id: id.toString(),
            });
            if (result._source !== undefined) {
                return result._source.sourceIds;
            }
        }
        catch (e) {
            return undefined;
        }
    }
    async function getByIds(ids) {
        const result = await elasticClient.mget({
            index: indexName,
            ids: ids.map((id) => id.toString()),
        });
        const textIds = result.docs.map((doc) => doc._id);
        const sourceIds = await Promise.all(textIds.map(async (textId) => {
            return await getById(textId);
        }));
        return sourceIds;
    }
    async function getId(text) {
        const result = await elasticClient.search({
            index: indexName,
            body: { query: { match: { text } } },
        });
        // There will never be more then one because textId is the
        // unique id or the "key" in the index
        if (result.hits.hits.length > 0) {
            const hit = result.hits.hits[0]._source;
            if (hit !== undefined) {
                return hit.textId;
            }
        }
        return undefined;
    }
    async function getIds(texts) {
        const textIds = await Promise.all(texts.map(async (text) => {
            return await getId(text);
        }));
        return textIds;
    }
    async function getText(id) {
        const result = await elasticClient.get({
            index: indexName,
            id: id.toString(),
        });
        if (result._source !== undefined) {
            return result._source.text;
        }
        return undefined;
    }
    async function put(text, postings) {
        const textId = generateTextId(text);
        const embedding = await generateEmbedding(embeddingModel, text);
        let convertedEmbedding = [];
        embedding.forEach((value) => {
            convertedEmbedding.push(value);
        });
        if (postings === undefined) {
            postings = [];
        }
        const putResult = await elasticClient.index({
            index: indexName,
            id: textId,
            document: {
                text: text,
                textId: textId,
                sourceIds: postings,
                textVector: convertedEmbedding,
            },
        });
        return putResult._id;
    }
    async function putMultiple(values) {
        const valuesWithTextId = values.map((value) => ({
            ...value,
            textId: generateTextId(value.value),
        }));
        // We'll build 'bulkOps' in one flat array.
        const bulkOps = [];
        for (const v of valuesWithTextId) {
            const embedding = await generateEmbedding(embeddingModel, v.value);
            // First line: action/metadata.
            bulkOps.push({ index: { _index: indexName, _id: v.textId } });
            // Second line: the actual document.
            bulkOps.push({
                text: v.value,
                textId: v.textId,
                sourceIds: v.sourceIds ?? [],
                textVector: embedding,
            });
        }
        // Now 'bulkOps' is a flat array of objects.
        await elasticClient.bulk({ body: bulkOps });
        return values.map((value) => value.value);
    }
    async function addSources(id, postings) {
        // Elastic script to add in place to an array
        await elasticClient.update({
            index: indexName,
            id: id,
            script: {
                source: "ctx._source.sourceIds.addAll(params.postings)",
                params: { postings },
            },
        });
    }
    async function nearestHelper(value, maxMatches) {
        const queryEmbedding = await generateEmbedding(embeddingModel, value);
        let convertedQuery = [];
        queryEmbedding.forEach((value) => {
            convertedQuery.push(value);
        });
        const response = await elasticClient.knnSearch({
            index: indexName,
            knn: {
                field: "textVector",
                k: maxMatches,
                query_vector: convertedQuery,
                num_candidates: 10000,
            },
            _source: ["text", "textId", "sourceIds"],
        });
        const topHit = response.hits.hits[0];
        if (topHit === undefined) {
            return undefined;
        }
        if (topHit._source === undefined) {
            return undefined;
        }
        return {
            text: topHit._source.text,
            textId: topHit._source.textId,
            sourceIds: topHit._source.sourceIds,
            score: topHit._score || 0,
        };
    }
    async function getNearest(text, k) {
        const nearest = await nearestHelper(text, k);
        if (nearest === undefined) {
            return [];
        }
        return nearest.sourceIds;
    }
    async function getNearestMultiple(texts, k) {
        let results = [];
        texts.forEach(async (text) => {
            results.push(await getNearest(text, k));
        });
        return [...new Set(results.flat())];
    }
    async function getNearestHits(value, hitTable, maxMatches) {
        const hits = await getNearest(value, maxMatches ?? 10);
        hitTable.addMultiple(hits);
    }
    async function getNearestHitsMultiple(values, hitTable, maxMatches) {
        const hits = await getNearestMultiple(values, maxMatches ?? 10);
        hitTable.addMultiple(hits);
    }
    async function nearestNeighbors(value, maxMatches) {
        const hit = await nearestHelper(value, maxMatches ?? 10);
        if (hit === undefined) {
            return [];
        }
        return [{ item: hit.sourceIds, score: hit.score }];
    }
    async function nearestNeighborsText(value, maxMatches) {
        const hit = await nearestHelper(value, maxMatches ?? 10);
        if (hit === undefined) {
            return [];
        }
        return [{ item: hit.textId, score: hit.score }];
    }
    async function nearestNeighborsPairs(value, maxMatches) {
        const hit = await nearestHelper(value, maxMatches ?? 10);
        if (hit === undefined) {
            return [];
        }
        return [
            {
                item: {
                    type: TextBlockType.Sentence,
                    value: hit.text,
                    sourceIds: hit.sourceIds,
                },
                score: hit.score,
            },
        ];
    }
    async function getNearestText(value, maxMatches, minScore) {
        const hits = await nearestNeighborsText(value, maxMatches);
        return hits
            .filter((hit) => hit.score >= (minScore ?? 0))
            .map((hit) => hit.item);
    }
    async function getNearestTextMultiple(values, maxMatches, minScore) {
        const hits = await Promise.all(values.map(async (value) => {
            return await getNearestText(value, maxMatches, minScore);
        }));
        return [...new Set(hits.flat())];
    }
    // Remove postings from a text's list of postings (postings are sources)
    async function remove(textId, postings) {
        await elasticClient.update({
            index: indexName,
            id: textId,
            body: {
                script: {
                    source: "ctx._source.sourceIds.removeAll(params.postings)",
                    params: { postings },
                },
            },
        });
    }
}
//# sourceMappingURL=simplifiedTextIndex.js.map