// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SimilarityType, createEmbeddingFolder, createSemanticIndex, } from "typeagent";
import path from "path";
export async function createMessageIndex(settings, folderPath, folderSettings, fSys) {
    const embeddingFolder = await createEmbeddingFolder(path.join(folderPath, "embeddings"), folderSettings, settings.concurrency, fSys);
    const semanticIndex = createSemanticIndex(embeddingFolder, settings.embeddingModel);
    return {
        ...semanticIndex,
        putMultiple,
        nearestNeighborsInSubset,
    };
    async function putMultiple(items, onlyIfNew, concurrency) {
        return semanticIndex.putMultiple(items, onlyIfNew, concurrency ?? settings.concurrency);
    }
    async function nearestNeighborsInSubset(value, subsetIds, maxMatches, minScore) {
        const embedding = await semanticIndex.getEmbedding(value);
        return embeddingFolder.nearestNeighborsInSubset(embedding, subsetIds, maxMatches, SimilarityType.Dot, // We use normalized embeddings
        minScore);
    }
}
//# sourceMappingURL=messages.js.map