// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createEmbeddingFolder, createObjectFolder, createSemanticIndex, } from "typeagent";
import path from "path";
export async function createSemanticCodeIndex(folderPath, codeReviewer, embeddingModel, objectSerializer) {
    const embeddingFolder = await createEmbeddingFolder(path.join(folderPath, "embeddings"));
    const codeIndex = createSemanticIndex(embeddingFolder, embeddingModel);
    const codeStoreSettings = {};
    if (objectSerializer) {
        codeStoreSettings.serializer = objectSerializer;
    }
    const codeStore = await createObjectFolder(path.join(folderPath, "code"), codeStoreSettings);
    return {
        find,
        get: (name) => codeStore.get(name),
        put,
        remove,
    };
    async function find(question, maxMatches, minScore) {
        return codeIndex.nearestNeighbors(question, maxMatches, minScore);
    }
    async function put(code, name, sourcePath) {
        const docs = await codeReviewer.document(code);
        let text = name;
        if (docs.comments) {
            for (const docLine of docs.comments) {
                text += `\n${docLine.lineNumber}: ${docLine.comment}`;
            }
        }
        await codeIndex.put(text, name);
        await codeStore.put({ code, sourcePath }, name);
        return docs;
    }
    function remove(name) {
        return codeIndex.store.remove(name);
    }
}
//# sourceMappingURL=codeIndex.js.map