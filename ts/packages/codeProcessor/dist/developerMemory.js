// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createKnowledgeStore, createSemanticIndexFolder, } from "knowledge-processor";
import { asyncArray, } from "typeagent";
import path from "path";
export function codeBlockNameFromFilePath(filePath, name) {
    const ext = path.extname(filePath);
    let namespace;
    if (name) {
        namespace = path.basename(filePath, ext);
    }
    else {
        name = path.basename(filePath, ext);
        namespace = path.basename(path.dirname(filePath));
    }
    return { name, namespace };
}
export function codeBlockNameToString(cbName) {
    return cbName.namespace
        ? `${cbName.namespace}.${cbName.name}`
        : cbName.name;
}
export async function createDeveloperMemory(settings, rootPath, folderSettings, fSys) {
    const textIndexSettings = createTextIndexSettings();
    const codeStore = await createKnowledgeStore(textIndexSettings, rootPath, folderSettings);
    const codeIndex = await createSemanticIndexFolder(rootPath, folderSettings, textIndexSettings.concurrency, textIndexSettings.embeddingModel, fSys);
    const bugs = await createCodeReviewIndex(textIndexSettings, path.join(rootPath, "bugs"), folderSettings, fSys);
    const comments = await createCodeReviewIndex(textIndexSettings, path.join(rootPath, "comments"), folderSettings, fSys);
    return {
        settings,
        codeStore,
        bugs,
        comments,
        add,
        addReview,
        get,
        getId,
        getById,
        searchCode,
    };
    async function add(codeBlock, name, timestamp) {
        const codeId = getId(name);
        await codeStore.store.put(codeBlock, codeId);
        await Promise.all([
            codeStore.sequence.put([codeId], timestamp),
            updateCodeIndex(name, codeBlock.code, codeId),
        ]);
        return codeId;
    }
    async function addReview(name, review) {
        const codeId = typeof name === "string" ? name : getId(name);
        await Promise.all([
            addBugs(codeId, review),
            addComments(codeId, review),
        ]);
    }
    async function addBugs(codeId, review) {
        if (review.bugs && review.bugs.length > 0) {
            await bugs.add(codeId, review.bugs);
        }
    }
    async function addComments(codeId, review) {
        if (review.comments && review.comments.length > 0) {
            await comments.add(codeId, review.comments);
        }
    }
    function get(name) {
        return codeStore.get(getId(name));
    }
    function getId(name) {
        return codeBlockNameToString(name);
    }
    function getById(id) {
        return codeStore.get(id);
    }
    async function searchCode(query, maxMatches, minScore) {
        return codeIndex.nearestNeighbors(query, maxMatches, minScore);
    }
    async function updateCodeIndex(name, code, codeId) {
        const documentation = await documentCodeBlock(name, code);
        await codeIndex.put(documentation, codeId);
    }
    async function documentCodeBlock(name, code) {
        const docs = await settings.codeReviewer.document(code);
        let text = codeBlockNameToString(name);
        if (docs.comments) {
            for (const docLine of docs.comments) {
                text += "\n";
                text += docLine.comment;
            }
        }
        return text;
    }
    function createTextIndexSettings() {
        return {
            embeddingModel: settings.embeddingModel,
            semanticIndex: true,
            caseSensitive: false,
            concurrency: 2,
        };
    }
}
export async function createCodeReviewIndex(settings, rootPath, folderSettings, fSys) {
    const store = await createKnowledgeStore(settings, rootPath, folderSettings, fSys);
    const storeIndex = await createSemanticIndexFolder(rootPath, folderSettings, settings.concurrency, settings.embeddingModel, fSys);
    return {
        store,
        add,
        search,
    };
    async function add(sourceId, review) {
        const items = review.map((line) => {
            return {
                value: line,
                sourceId,
            };
        });
        const reviewIds = await asyncArray.mapAsync(items, settings.concurrency, async (item) => addItem(item));
        return reviewIds;
    }
    async function addItem(review) {
        const reviewIds = await store.addNext([review]);
        const reviewId = reviewIds[0];
        const text = lineReviewToString(review.value);
        await storeIndex.put(text, reviewId);
        return reviewId;
    }
    async function search(query, maxMatches, minScore) {
        const matches = await storeIndex.nearestNeighbors(query, maxMatches, minScore);
        return matches.map((match) => match.item);
    }
    function lineReviewToString(review) {
        return `[${review.severity}]: ${review.comment}`;
    }
}
//# sourceMappingURL=developerMemory.js.map