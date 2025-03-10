// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { deserializeEmbedding, serializeEmbedding, TextEmbeddingIndex, } from "./fuzzyIndex.js";
export class ConversationThreads {
    constructor(settings) {
        this.settings = settings;
        this.threads = [];
        this.embeddingIndex = new TextEmbeddingIndex(settings);
    }
    async addThread(thread) {
        this.threads.push(thread);
        await this.embeddingIndex.addText(thread.description);
    }
    async lookupThread(text, maxMatches, thresholdScore) {
        const matches = await this.embeddingIndex.getIndexesOfNearest(text, maxMatches, thresholdScore);
        return matches.map((m) => {
            return { threadIndex: m.item, score: m.score };
        });
    }
    removeThread(threadIndex) {
        if (threadIndex >= 0) {
            this.threads.splice(threadIndex, 1);
            this.embeddingIndex.removeAt(threadIndex);
        }
    }
    clear() {
        this.threads = [];
        this.embeddingIndex.clear();
    }
    async buildIndex() {
        this.embeddingIndex.clear();
        for (let i = 0; i < this.threads.length; ++i) {
            const thread = this.threads[i];
            await this.embeddingIndex.addText(thread.description);
        }
    }
    serialize() {
        const threadData = [];
        const embeddingIndex = this.embeddingIndex;
        for (let i = 0; i < this.threads.length; ++i) {
            const thread = this.threads[i];
            threadData.push({
                thread,
                embedding: serializeEmbedding(embeddingIndex.get(i)),
            });
        }
        return {
            threads: threadData,
        };
    }
    deserialize(data) {
        if (data.threads) {
            this.threads = [];
            this.embeddingIndex.clear();
            for (let i = 0; i < data.threads.length; ++i) {
                this.threads.push(data.threads[i].thread);
                const embedding = deserializeEmbedding(data.threads[i].embedding);
                this.embeddingIndex.add(embedding);
            }
        }
    }
}
//# sourceMappingURL=conversationThread.js.map