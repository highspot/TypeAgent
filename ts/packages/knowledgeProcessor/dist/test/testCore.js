// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../../../.env", import.meta.url) });
import { hasEnvSettings, openai, } from "aiclient";
import { TextBlockType } from "../src/text.js";
import { readAllText, readJsonFile } from "typeagent";
import { splitIntoBlocks } from "../src/textChunker.js";
import path from "path";
import os from "node:os";
export function testIf(name, runIf, fn, testTimeout) {
    if (!runIf()) {
        return test.skip(name, () => { });
    }
    return test(name, fn, testTimeout);
}
export function shouldSkip() {
    return !hasTestKeys();
}
export function hasTestKeys() {
    const hasKeys = hasEnvSettings(process.env, openai.EnvVars.AZURE_OPENAI_API_KEY) &&
        hasEnvSettings(process.env, openai.EnvVars.AZURE_OPENAI_API_KEY_EMBEDDING);
    return hasKeys;
}
export function skipTest(name) {
    return test.skip(name, () => { });
}
export function createTestModels() {
    return {
        chat: openai.createChatModelDefault("knowledgeProcessorTest"),
        answerModel: openai.createChatModel("knowledgeProcessorTest"),
        embeddings: openai.createEmbeddingModel(),
    };
}
export function getRootDataPath() {
    return path.join(os.tmpdir(), "/data/tests");
}
export async function loadData(filePath, blockType = TextBlockType.Paragraph) {
    const playText = await readAllText(filePath);
    // Split full play text into paragraphs
    return splitIntoBlocks(playText, blockType);
}
export async function loadSearchActionV2(rootPath, name) {
    const query = await readAllText(path.join(rootPath, name + ".txt"));
    const action = await readJsonFile(path.join(rootPath, name + ".json"));
    if (!action) {
        throw Error(`${name}.json not found`);
    }
    return {
        query,
        action,
    };
}
//# sourceMappingURL=testCore.js.map