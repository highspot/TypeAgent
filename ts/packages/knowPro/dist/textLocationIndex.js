// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { TextEmbeddingIndex, } from "./fuzzyIndex.js";
export class TextToTextLocationIndexFuzzy {
    constructor(settings) {
        this.textLocations = [];
        this.embeddingIndex = new TextEmbeddingIndex(settings);
    }
    async addTextLocation(text, textLocation) {
        await this.embeddingIndex.addText(text);
        this.textLocations.push(textLocation);
    }
    async addTextLocationsBatched(textAndLocations, eventHandler) {
        await this.embeddingIndex.addTextBatch(textAndLocations.map((tl) => tl[0]), eventHandler);
        this.textLocations.push(...textAndLocations.map((tl) => tl[1]));
    }
    async lookupText(text, maxMatches, thresholdScore) {
        const matches = await this.embeddingIndex.getIndexesOfNearest(text, maxMatches, thresholdScore);
        return matches.map((m) => {
            return {
                textLocation: this.textLocations[m.item],
                score: m.score,
            };
        });
    }
    serialize() {
        return {
            textLocations: this.textLocations,
            embeddings: this.embeddingIndex.serialize(),
        };
    }
    deserialize(data) {
        if (data.textLocations.length !== data.embeddings.length) {
            throw new Error(`TextToTextLocationIndexData corrupt. textLocation.length ${data.textLocations.length} != ${data.embeddings.length}`);
        }
        this.textLocations = data.textLocations;
        this.embeddingIndex.deserialize(data.embeddings);
    }
}
//# sourceMappingURL=textLocationIndex.js.map