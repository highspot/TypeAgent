// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { readFile, readJsonFile, writeFile, writeJsonFile } from "typeagent";
import { deserializeEmbeddings, serializeEmbeddings } from "./fuzzyIndex.js";
import path from "path";
export async function writeConversationDataToFile(conversationData, dirPath, baseFileName) {
    const serializationData = conversationDataToPersistent(conversationData);
    if (serializationData.embeddings) {
        const embeddingsBuffer = serializeEmbeddings(serializationData.embeddings);
        await writeFile(path.join(dirPath, baseFileName + EmbeddingFileSuffix), embeddingsBuffer);
    }
    await writeJsonFile(path.join(dirPath, baseFileName + DataFileSuffix), serializationData.conversationData);
}
export async function readConversationDataFromFile(dirPath, baseFileName, embeddingSize) {
    const conversationData = await readJsonFile(path.join(dirPath, baseFileName + DataFileSuffix));
    if (!conversationData) {
        return undefined;
    }
    let embeddings;
    if (embeddingSize && embeddingSize > 0) {
        const embeddingsBuffer = await readFile(path.join(dirPath, baseFileName + EmbeddingFileSuffix));
        if (embeddingsBuffer) {
            embeddings = deserializeEmbeddings(embeddingsBuffer, embeddingSize);
        }
    }
    let serializationData = {
        conversationData,
        embeddings,
    };
    return persistentToConversationData(serializationData);
}
const DataFileSuffix = "_data.json";
const EmbeddingFileSuffix = "_embeddings.bin";
function conversationDataToPersistent(conversationData) {
    let persistentData = {
        conversationData,
    };
    const embeddingData = conversationData.relatedTermsIndexData?.textEmbeddingData;
    if (embeddingData) {
        persistentData.embeddings = embeddingData.embeddings;
        embeddingData.embeddings = [];
    }
    return persistentData;
}
function persistentToConversationData(persistentData) {
    const embeddingData = persistentData.conversationData.relatedTermsIndexData
        ?.textEmbeddingData;
    if (persistentData.embeddings && embeddingData) {
        embeddingData.embeddings = persistentData.embeddings;
    }
    return persistentData.conversationData;
}
//# sourceMappingURL=serialization.js.map