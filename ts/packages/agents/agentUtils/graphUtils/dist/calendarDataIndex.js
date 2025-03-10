// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { indexesOfNearest, SimilarityType, generateEmbedding, } from "typeagent";
import { openai } from "aiclient";
export function createCalendarDataIndex() {
    let eventEmbeddings = {};
    let embeddingModel;
    embeddingModel = openai.createEmbeddingModel();
    return {
        addOrUpdate,
        remove,
        reset,
        search,
    };
    async function addOrUpdate(eventInfo) {
        let embedding = await generateEmbedding(embeddingModel, String(eventInfo.eventData));
        eventEmbeddings[eventInfo.eventId] = embedding;
    }
    async function remove(eventId) {
        if (eventEmbeddings[eventId]) {
            delete eventEmbeddings[eventId];
        }
    }
    async function reset() {
        eventEmbeddings = {};
    }
    async function search(query, maxMatches) {
        const embeddings = Object.values(eventEmbeddings);
        const eventIds = Object.keys(eventEmbeddings);
        const embedding = await generateEmbedding(embeddingModel, query);
        const topN = indexesOfNearest(embeddings, embedding, maxMatches, SimilarityType.Dot);
        return topN.map((m) => {
            const itemIndex = Number(m.item);
            return {
                score: m.score,
                item: {
                    name: m.item.toString(),
                    value: eventIds[itemIndex],
                },
            };
        });
    }
}
//# sourceMappingURL=calendarDataIndex.js.map