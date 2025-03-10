// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as fs from "fs";
import * as path from "path";
import { createJsonTranslator } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
import { openai } from "aiclient";
import { loadSchema } from "typeagent";
import { makeEmbeddingModel } from "./embeddings.js";
import { console_log } from "./logging.js";
function captureTokenStats(req, response) {
    const inputTokens = response.usage.prompt_tokens;
    const outputTokens = response.usage.completion_tokens;
    const cost = inputTokens * 0.000005 + outputTokens * 0.000015;
    console_log(`    [Tokens used: prompt=${inputTokens}, ` +
        `completion=${outputTokens}, ` +
        `cost=\$${cost.toFixed(2)}]`);
}
export function createQueryContext(dbFile) {
    const chatModel = openai.createChatModelDefault("spelunkerChat");
    chatModel.completionCallback = captureTokenStats;
    chatModel.retryMaxAttempts = 0;
    const miniModel = openai.createChatModel(undefined, // "GPT_4_O_MINI" is slower than default model?!
    undefined, undefined, ["spelunkerMini"]);
    miniModel.completionCallback = captureTokenStats;
    miniModel.retryMaxAttempts = 0;
    const embeddingModel = makeEmbeddingModel();
    const oracle = createTranslator(chatModel, "oracleSchema.ts", "OracleSpecs");
    const chunkSelector = createTranslator(miniModel, "selectorSchema.ts", "SelectorSpecs");
    const chunkSummarizer = createTranslator(miniModel, "summarizerSchema.ts", "SummarizerSpecs");
    const databaseFolder = path.join(process.env.HOME ?? "", ".typeagent", "agents", "spelunker");
    const mkdirOptions = {
        recursive: true,
        mode: 0o700,
    };
    fs.mkdirSync(databaseFolder, mkdirOptions);
    const databaseLocation = dbFile || path.join(makeDatabaseFolder(), "codeSearchDatabase.db");
    const database = undefined;
    return {
        chatModel,
        miniModel,
        embeddingModel,
        oracle,
        chunkSelector,
        chunkSummarizer,
        databaseLocation,
        database,
    };
}
function makeDatabaseFolder() {
    const databaseFolder = path.join(process.env.HOME ?? "", ".typeagent", "agents", "spelunker");
    const mkdirOptions = {
        recursive: true,
        mode: 0o700,
    };
    fs.mkdirSync(databaseFolder, mkdirOptions);
    return databaseFolder;
}
function createTranslator(model, schemaFile, typeName) {
    const schema = loadSchema([schemaFile], import.meta.url);
    const validator = createTypeScriptJsonValidator(schema, typeName);
    const translator = createJsonTranslator(model, validator);
    return translator;
}
//# sourceMappingURL=queryContext.js.map