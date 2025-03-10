// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { openai } from "aiclient";
import * as knowLib from "knowledge-processor";
import { createObjectFolder, loadSchema } from "typeagent";
import { createFileDocumenter } from "./fileDocumenter.js";
import { createJsonTranslator } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
export const IndexNames = [
    "summaries",
    "keywords",
    "tags",
    "synonyms",
    "dependencies",
];
// A bundle of object stores and indexes etc.
export class ChunkyIndex {
    constructor() {
        this.chatModel = openai.createChatModelDefault("spelunkerChat");
        this.miniModel = openai.createChatModel("GPT_35_TURBO", undefined, undefined, ["spelunkerMini"]);
        this.embeddingModel = knowLib.createEmbeddingCache(openai.createEmbeddingModel(), 1000);
        this.fileDocumenter = createFileDocumenter(this.chatModel);
        this.queryMaker = createQueryMaker(this.chatModel);
        this.answerMaker = createAnswerMaker(this.chatModel);
    }
    static async createInstance(rootDir) {
        const instance = new ChunkyIndex();
        await instance.reInitialize(rootDir);
        return instance;
    }
    async reInitialize(rootDir) {
        const instance = this; // So makeIndex can see it.
        instance.rootDir = rootDir;
        instance.chunkFolder = await createObjectFolder(instance.rootDir + "/chunks", { serializer: (obj) => JSON.stringify(obj, null, 2) });
        instance.answerFolder = await createObjectFolder(instance.rootDir + "/answers", { serializer: (obj) => JSON.stringify(obj, null, 2) });
        instance.indexes = new Map();
        for (const name of IndexNames) {
            instance.indexes.set(name, await makeIndex(name));
        }
        async function makeIndex(name) {
            return await knowLib.createTextIndex({
                caseSensitive: false,
                concurrency: 4,
                semanticIndex: true,
                embeddingModel: instance.embeddingModel,
            }, instance.rootDir + "/" + name);
        }
    }
    getIndexByName(indexName) {
        for (const [name, index] of this.allIndexes()) {
            if (name === indexName) {
                return index;
            }
        }
        throw new Error(`Unknown index: ${indexName}`);
    }
    allIndexes() {
        return [...this.indexes.entries()];
    }
}
function createQueryMaker(model) {
    const typeName = "QuerySpecs";
    const schema = loadSchema(["makeQuerySchema.ts", "makeAnswerSchema.ts"], import.meta.url);
    const validator = createTypeScriptJsonValidator(schema, typeName);
    const translator = createJsonTranslator(model, validator);
    return translator;
}
function createAnswerMaker(model) {
    const typeName = "AnswerSpecs";
    const schema = loadSchema(["makeAnswerSchema.ts"], import.meta.url);
    const validator = createTypeScriptJsonValidator(schema, typeName);
    const translator = createJsonTranslator(model, validator);
    return translator;
}
//# sourceMappingURL=chunkyIndex.js.map