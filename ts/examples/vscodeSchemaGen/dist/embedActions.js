// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { indexesOfNearest, SimilarityType, generateEmbedding } from "typeagent";
import { openai } from "aiclient";
export function createVscodeActionsIndex() {
    let vscodeActionEmbeddings = {};
    let embeddingModel;
    embeddingModel = openai.createEmbeddingModel();
    return {
        addOrUpdate,
        remove,
        reset,
        search,
    };
    async function addOrUpdate(actionName, actionData) {
        const actionString = `${actionData.typeName} ${actionData.actionName} ${actionData.comments.join(" ")}`;
        let embedding = await generateEmbedding(
            embeddingModel,
            JSON.stringify(actionString, null, 2),
        );
        vscodeActionEmbeddings[actionName] = embedding;
        return embedding;
    }
    async function remove(actionName) {
        if (vscodeActionEmbeddings[actionName]) {
            delete vscodeActionEmbeddings[actionName];
        }
    }
    async function reset() {
        vscodeActionEmbeddings = {};
    }
    async function search(query, maxMatches) {
        const embeddings = Object.values(vscodeActionEmbeddings);
        const actionNames = Object.keys(vscodeActionEmbeddings);
        const embedding = await generateEmbedding(embeddingModel, query);
        const topN = indexesOfNearest(
            embeddings,
            embedding,
            maxMatches,
            SimilarityType.Dot,
        );
        return topN.map((m) => {
            const itemIndex = Number(m.item);
            return {
                score: m.score,
                item: {
                    name: m.item.toString(),
                    value: actionNames[itemIndex],
                },
            };
        });
    }
}
//# sourceMappingURL=embedActions.js.map
