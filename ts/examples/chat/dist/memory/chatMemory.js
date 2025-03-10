// Copyright (c) Microsoft Corporation and Henry Lucco.
// Licensed under the MIT License.
import * as knowLib from "knowledge-processor";
import { conversation } from "knowledge-processor";
import { openai } from "aiclient";
import { addStandardHandlers, arg, argBool, argNum, parseNamedArguments, runConsole, getInteractiveIO, StopWatch, millisecondsToString, } from "interactive-app";
import { asyncArray, ensureDir, getFileName, readAllText, mathLib, } from "typeagent";
import chalk from "chalk";
import { ChatMemoryPrinter } from "./chatMemoryPrinter.js";
import { timestampBlocks } from "./importer.js";
import path from "path";
import fs from "fs";
import { argPause, argConcurrency, argDestFile, argMinScore, argSourceFile, getMessagesAndCount, } from "./common.js";
import { createEmailCommands, createEmailMemory } from "./emailMemory.js";
import { createImageMemory } from "./imageMemory.js";
import { pathToFileURL } from "url";
import { createPodcastCommands, createPodcastMemory } from "./podcastMemory.js";
import { createImageCommands } from "./imageMemory.js";
import { createKnowproCommands } from "./knowproMemory.js";
export var ReservedConversationNames;
(function (ReservedConversationNames) {
    ReservedConversationNames["transcript"] = "transcript";
    ReservedConversationNames["outlook"] = "outlook";
    ReservedConversationNames["play"] = "play";
    ReservedConversationNames["search"] = "search";
    ReservedConversationNames["podcasts"] = "podcasts";
    ReservedConversationNames["images"] = "images";
})(ReservedConversationNames || (ReservedConversationNames = {}));
function isReservedConversation(context) {
    return (context.conversationName === ReservedConversationNames.transcript ||
        context.conversationName === ReservedConversationNames.play ||
        context.conversationName === ReservedConversationNames.search ||
        context.conversationName === ReservedConversationNames.outlook ||
        context.conversationName === ReservedConversationNames.podcasts ||
        context.conversationName === ReservedConversationNames.images);
}
function getReservedConversation(context, name) {
    switch (name) {
        default:
            break;
        case ReservedConversationNames.outlook:
            return context.emailMemory;
        case ReservedConversationNames.podcasts:
            return context.podcastMemory;
        case ReservedConversationNames.images:
            return context.imageMemory;
    }
    return undefined;
}
export function createModels() {
    const chatModelSettings = openai.apiSettingsFromEnv(openai.ModelType.Chat);
    chatModelSettings.retryPauseMs = 10000;
    const embeddingModelSettings = openai.apiSettingsFromEnv(openai.ModelType.Embedding);
    embeddingModelSettings.retryPauseMs = 25 * 1000;
    const models = {
        chatModel: openai.createJsonChatModel(chatModelSettings, [
            "chatMemory",
        ]),
        answerModel: openai.createChatModel(),
        embeddingModel: knowLib.createEmbeddingCache(openai.createEmbeddingModel(embeddingModelSettings), 1024),
        /*
        embeddingModelSmall: knowLib.createEmbeddingCache(
            openai.createEmbeddingModel("3_SMALL", 1536),
            256,
        ),
        */
    };
    models.chatModel.completionSettings.seed = 123;
    models.answerModel.completionSettings.seed = 123;
    return models;
}
export async function createChatMemoryContext(completionCallback) {
    const storePath = "./data/testChat";
    const statsPath = path.join(storePath, "stats");
    await ensureDir(storePath);
    await ensureDir(statsPath);
    const models = createModels();
    models.chatModel.completionCallback = completionCallback;
    models.answerModel.completionCallback = completionCallback;
    const conversationName = ReservedConversationNames.transcript;
    const conversationSettings = knowLib.conversation.createConversationSettings(models.embeddingModel);
    const conversationPath = path.join(storePath, conversationName);
    const conversation = await createConversation(conversationPath, conversationSettings);
    const conversationManager = await knowLib.conversation.createConversationManager({
        model: models.chatModel,
        answerModel: models.answerModel,
    }, conversationName, conversationPath, false, conversation);
    const entityTopK = 100;
    const actionTopK = 16;
    const context = {
        storePath,
        statsPath,
        printer: new ChatMemoryPrinter(getInteractiveIO()),
        models,
        maxCharsPerChunk: 4096,
        topicWindowSize: 8,
        searchConcurrency: 2,
        minScore: 0.9,
        conversationName,
        conversationManager,
        conversationSettings,
        conversation,
        entityTopK,
        actionTopK,
        searcher: configureSearchProcessor(conversationManager, entityTopK, actionTopK),
        emailMemory: await createEmailMemory(models, storePath, conversationSettings, true, false),
        podcastMemory: await createPodcastMemory(models, storePath, conversationSettings, true, false, false),
        imageMemory: await createImageMemory(models, storePath, conversationSettings, true, false),
    };
    context.searchMemory = await createSearchMemory(context);
    return context;
}
export function createConversation(rootPath, settings) {
    return conversation.createConversation(settings, rootPath, {
        cacheNames: true,
        useWeakRefs: true,
    });
}
export function configureSearchProcessor(cm, entityTopK, actionTopK) {
    const answers = cm.searchProcessor.answers;
    answers.settings.topK.entitiesTopK = entityTopK;
    answers.settings.topK.actionsTopK = actionTopK;
    return cm.searchProcessor;
}
export async function createSearchMemory(context) {
    const conversationName = "search";
    const memory = await conversation.createConversationManager({
        model: context.models.chatModel,
        answerModel: context.models.answerModel,
    }, conversationName, context.storePath, true);
    memory.searchProcessor.answers.settings.topK.entitiesTopK =
        context.entityTopK;
    return memory;
}
export async function loadConversation(context, name, rootPath) {
    const reservedCm = getReservedConversation(context, name);
    let exists = false;
    if (reservedCm === undefined) {
        rootPath ??= context.storePath;
        const conversationPath = path.join(rootPath, name);
        exists = fs.existsSync(conversationPath);
        context.conversation = await createConversation(conversationPath, conversation.createConversationSettings(context.models.embeddingModel));
        context.conversationName = name;
        context.conversationManager =
            await conversation.createConversationManager({
                model: context.models.chatModel,
                answerModel: context.models.answerModel,
            }, name, conversationPath, false, context.conversation);
    }
    else {
        context.conversation = reservedCm.conversation;
        context.conversationName = name;
        context.conversationManager = reservedCm;
        context.searcher = reservedCm.searchProcessor;
        exists = true;
    }
    context.searcher = configureSearchProcessor(context.conversationManager, context.entityTopK, context.actionTopK);
    if (name !== "search") {
        context.searchMemory = await createSearchMemory(context);
    }
    return exists;
}
export async function runChatMemory() {
    let context = await createChatMemoryContext(captureTokenStats);
    let showTokenStats = false;
    let printer = context.printer;
    const commands = {
        importPlay,
        importTranscript,
        importMessage,
        load,
        history,
        replay,
        knowledge,
        extract,
        compare,
        buildIndex,
        topics,
        entities,
        actions,
        search,
        searchV2Debug,
        searchTopics,
        searchEntities,
        rag,
        makeTestSet,
        runTestSet,
        tokenLog,
    };
    createEmailCommands(context, commands);
    createPodcastCommands(context, commands);
    createImageCommands(context, commands);
    await createKnowproCommands(context, commands);
    addStandardHandlers(commands);
    function onStart(io) {
        if (io !== context.printer.io) {
            printer = new ChatMemoryPrinter(io);
            context.printer = printer;
        }
    }
    async function inputHandler(line, io) {
        if (context.searchMemory) {
            const results = await context.searchMemory.search(line, undefined, undefined, undefined, (q) => printer.writeJson(q));
            if (results) {
                printer.writeSearchTermsResult(results);
            }
            else {
                printer.writeLine("No matches");
            }
        }
        else {
            printer.writeLine("No search history");
        }
    }
    function captureTokenStats(req, response) {
        if (context.stats) {
            context.stats.updateCurrentTokenStats(response.usage);
        }
        if (showTokenStats) {
            printer.writeCompletionStats(response.usage);
            printer.writeLine();
        }
        else {
            printer.write(".");
        }
    }
    //--------------------
    //
    // COMMANDS
    //
    //--------------------
    commands.history.metadata = "Display search history.";
    async function history(args, io) {
        if (context.searchMemory) {
            await writeHistory(context.searchMemory.conversation);
        }
        else {
            printer.writeLine("No search history");
        }
    }
    commands.importTranscript.metadata = importChatDef();
    async function importTranscript(args, io) {
        const namedArgs = parseNamedArguments(args, importChatDef());
        const chatPath = namedArgs.chatPath ?? "./data/testChat/transcript.txt";
        const addToCurrent = namedArgs.addToCurrent;
        if (!addToCurrent) {
            await loadConversation(context, path.parse(chatPath).name);
        }
        printer.writeLine(`Importing ${chatPath}`);
        const chatText = await readAllText(chatPath);
        // Split full transcript text into paragraphs
        const blocks = knowLib.conversation.splitTranscriptIntoBlocks(chatText);
        const lengthMinutes = namedArgs.lengthMinutes ?? 60;
        let lengthMs = lengthMinutes * 60 * 60;
        const baseLineMs = lengthMs / blocks.length; // Average, these many minutes per block
        const chatDate = new Date(2023, 4, 1, 9);
        if (!addToCurrent) {
            await context.conversation.messages.clear();
        }
        for (let tBlock of timestampBlocks(blocks, chatDate, baseLineMs, baseLineMs + 2)) {
            printer.writeTimestamp(tBlock.timestamp);
            printer.writeLine(tBlock.value.value);
            await context.conversation.messages.put(tBlock.value, tBlock.timestamp);
        }
    }
    function importChatDef() {
        return {
            description: "Imports conversation from a file with synthetic timestamps",
            options: {
                chatPath: {
                    description: "file path",
                    type: "path",
                },
                addToCurrent: {
                    description: "Add to current conversation",
                    type: "boolean",
                    defaultValue: false,
                },
                lengthMinutes: {
                    description: "Length of the conversation in minutes",
                    type: "number",
                },
            },
        };
    }
    commands.importPlay.metadata = importChatDef();
    async function importPlay(args, io) {
        const namedArgs = parseNamedArguments(args, importChatDef());
        const playPath = namedArgs.chatPath ?? "./data/testChat/play.txt";
        printer.writeLine(`Importing ${playPath}`);
        await loadConversation(context, path.parse(playPath).name);
        const playText = await readAllText(playPath);
        // Split full play text into paragraphs
        const blocks = knowLib.splitIntoBlocks(playText, knowLib.TextBlockType.Paragraph);
        const baseLineMs = 1000 * 60 * 10; // 10 minutes
        await context.conversation.messages.clear();
        for (let tBlock of timestampBlocks(blocks, new Date(1900, 0), baseLineMs, 15 * baseLineMs)) {
            printer.writeTimestamp(tBlock.timestamp);
            printer.writeLine(tBlock.value.value);
            await context.conversation.messages.put(tBlock.value, tBlock.timestamp);
        }
    }
    function importMessageDef() {
        return {
            description: "Imports a text message into the current conversation",
            options: {
                message: arg("Raw message text to add"),
                sourcePath: argSourceFile(),
            },
        };
    }
    commands.importMessage.metadata = importMessageDef();
    async function importMessage(args, io) {
        // Temporary: safeguard here to prevent demo issues
        if (isReservedConversation(context)) {
            printer.writeError(`Directly updating the TEST ${context.conversationName} conversation is not allowed!`);
            return;
        }
        const namedArgs = parseNamedArguments(args, importMessageDef());
        let messageText;
        if (namedArgs.message) {
            messageText = namedArgs.message;
        }
        else if (namedArgs.filePath) {
            if (!fs.existsSync(namedArgs.filePath)) {
                printer.writeError(`${namedArgs.filePath} not found.`);
                return;
            }
            messageText = await readAllText(namedArgs.filePath);
        }
        if (messageText) {
            context.conversationManager.addMessage(messageText);
        }
    }
    commands.replay.metadata = "Replay the chat";
    async function replay(args, io) {
        await writeHistory(context.conversation);
    }
    function loadDef() {
        return {
            description: "Load the named conversation memory",
            options: {
                name: arg("Conversation name"),
                actions: argBool("Use actions in search", true),
                rootPath: {
                    description: "Root path for the conversation",
                    type: "string",
                },
            },
        };
    }
    commands.load.metadata = loadDef();
    async function load(args, io) {
        if (args.length > 0) {
            const namedArgs = parseNamedArguments(args, loadDef());
            let name = namedArgs.name;
            let storePath = namedArgs.rootPath;
            if (!name && storePath) {
                name = getFileName(namedArgs.rootPath);
                storePath = path.dirname(storePath);
            }
            if (name) {
                if (await loadConversation(context, name, storePath)) {
                    printer.writeLine(`Loaded ${name}`);
                }
                else {
                    printer.writeLine(`Created ${chalk.green("NEW")} conversation: ${name}`);
                }
                return;
            }
        }
        printer.writeLine(context.conversationName);
    }
    function extractDef() {
        return {
            description: "Extract knowledge from the messages in the current conversation",
            options: {
                maxTurns: argNum("Number of turns to run"),
                pause: argPause(),
                logFile: argDestFile("Log file for extraction data"),
                inFile: argSourceFile("Input file with messages"),
                testLoss: argBool("Compute loss for each message"),
            },
        };
    }
    commands.extract.metadata = extractDef();
    async function extract(args, _io) {
        const namedArgs = parseNamedArguments(args, knowledgeDef());
        const logFile = namedArgs.logFile;
        const inFile = namedArgs.inFile;
        if (!logFile || !inFile) {
            printer.writeError("Missing logFile or inFile");
            return;
        }
        const fullInPath = path.join(context.storePath, inFile);
        const inData = JSON.parse(fs.readFileSync(fullInPath, "utf8"));
        // open log file for writing
        const logPath = path.join(context.storePath, logFile);
        const logStream = fs.createWriteStream(logPath);
        const chatModelSettings = openai.apiSettingsFromEnv(openai.ModelType.Chat, undefined, "GPT_4_O");
        chatModelSettings.retryPauseMs = 10000;
        const chatModel = openai.createJsonChatModel(chatModelSettings, [
            "chatExtractor",
        ]);
        const extractor = conversation.createKnowledgeExtractor(chatModel, {
            maxContextLength: context.maxCharsPerChunk,
            mergeActionKnowledge: false,
        });
        const extractedData = [];
        // extract from each record in inData and write to the log file
        let count = 0;
        const maxTurns = namedArgs.maxTurns;
        const testLoss = namedArgs.testLoss;
        const clock = new StopWatch();
        let totalElapsed = 0;
        clock.start();
        for (const record of inData) {
            let msg = record.content;
            if (record.speaker) {
                msg = `${record.speaker}: ${msg}`;
            }
            let knowledge;
            knowledge = await extractor.extract(msg).catch((err) => {
                printer.writeError(`Error extracting knowledge: ${err}`);
                return undefined;
            });
            if (knowledge) {
                const data = {
                    knowledge,
                    message: msg,
                    id: record.id,
                    description: record.section_title,
                };
                if (testLoss) {
                    const loss = await conversation
                        .knowledgeResponseLoss(knowledge, knowledge, context.models.embeddingModel)
                        .catch((err) => {
                        printer.writeError(`Error computing loss: ${err}`);
                        return 0;
                    });
                    const simpleLoss = await conversation.simpleKnowledgeResponseLoss(knowledge, knowledge, context.models.embeddingModel);
                    printer.writeError(`Loss for ${msg} is ${loss.toFixed(2)}, simple loss: ${simpleLoss.toFixed(2)}`);
                }
                extractedData.push(data);
                count++;
            }
            if (maxTurns && count >= maxTurns) {
                break;
            }
            // write elapsed time every 10 records
            if (count % 10 === 0) {
                clock.stop();
                totalElapsed += clock.elapsedMs;
                printer.writeTiming(chalk.cyan, clock, "last 10 records");
                // write out elapsed time in seconds
                printer.writeLine(`Processed ${count} records with total elapsed time: ${millisecondsToString(totalElapsed, "s")}`);
                clock.start();
            }
        }
        clock.stop();
        const json = JSON.stringify(extractedData, null, 2);
        logStream.write(json);
        logStream.close();
    }
    function compareDef() {
        return {
            description: "Extract knowledge from the messages in the current conversation",
            options: {
                maxTurns: argNum("Number of turns to run"),
                pause: argPause(),
                logFile: argDestFile("Log file for extraction data"),
                inFile: argSourceFile("Input file with messages and KR data"),
            },
        };
    }
    commands.compare.metadata = compareDef();
    async function compare(args, _io) {
        const namedArgs = parseNamedArguments(args, knowledgeDef());
        const logFile = namedArgs.logFile;
        const inFile = namedArgs.inFile;
        if (!logFile || !inFile) {
            printer.writeError("Missing logFile or inFile");
            return;
        }
        const fullInPath = path.join(context.storePath, inFile);
        const inData = JSON.parse(fs.readFileSync(fullInPath, "utf8"));
        // open log file for writing
        const logPath = path.join(context.storePath, logFile);
        const logStream = fs.createWriteStream(logPath);
        /*    const chatModelSettings = openai.apiSettingsFromEnv(
            openai.ModelType.Chat,
            undefined,
            "GPT_4_O_MINI",
        );
        */
        const chatModelSettings = openai.localOpenAIApiSettingsFromEnv(openai.ModelType.Chat, process.env, "LOCAL");
        if (!chatModelSettings) {
            return;
        }
        chatModelSettings.retryPauseMs = 10000;
        const chatModel = openai.createJsonChatModel(chatModelSettings, [
            "chatExtractor",
        ]);
        const extractor = conversation.createKnowledgeExtractor(chatModel, {
            maxContextLength: context.maxCharsPerChunk,
            mergeActionKnowledge: false,
        });
        const extractedData = [];
        // extract from each record in inData and write to the log file
        let count = 0;
        const maxTurns = namedArgs.maxTurns;
        const clock = new StopWatch();
        let totalElapsed = 0;
        let aveLoss = 0.0;
        let aveSimpleLoss = 0.0;
        clock.start();
        for (const record of inData) {
            let msg = record.message;
            const refKnowledge = record.knowledge;
            let knowledge;
            knowledge = await extractor.extract(msg).catch((err) => {
                printer.writeError(`Error extracting knowledge: ${err}`);
                return undefined;
            });
            if (knowledge) {
                const loss = await knowLib.conversation.knowledgeResponseLoss(knowledge, refKnowledge, context.models.embeddingModel);
                count++;
                aveLoss += loss;
                const simpleLoss = await knowLib.conversation.simpleKnowledgeResponseLoss(knowledge, refKnowledge, context.models.embeddingModel);
                aveSimpleLoss += simpleLoss;
                printer.writeError(`Loss for ${msg} is ${loss.toFixed(2)}, ave: ${(aveLoss / count).toFixed(2)}, simple loss: ${simpleLoss.toFixed(2)}, ave: ${(aveSimpleLoss / count).toFixed(2)}`);
                const data = {
                    knowledge,
                    message: msg,
                    id: record.id,
                    loss,
                    refModelName: record.modelName || "gpt_4o",
                    modelName: "gemma2:9b-instruct-fp16",
                    description: record.description,
                };
                extractedData.push(data);
            }
            if (maxTurns && count >= maxTurns) {
                break;
            }
            // write elapsed time every 10 records
            if (count % 10 === 0) {
                clock.stop();
                totalElapsed += clock.elapsedMs;
                printer.writeTiming(chalk.cyan, clock, "last 10 records");
                // write out elapsed time in seconds
                printer.writeLine(`Processed ${count} records with total elapsed time: ${millisecondsToString(totalElapsed, "s")}`);
                clock.start();
            }
        }
        clock.stop();
        const json = JSON.stringify(extractedData, null, 2);
        logStream.write(json);
        logStream.close();
    }
    function knowledgeDef() {
        return {
            description: "Extract knowledge from the messages in the current conversation",
            options: {
                maxTurns: argNum("Number of turns to run"),
                concurrency: argConcurrency(2),
            },
        };
    }
    commands.knowledge.metadata = knowledgeDef();
    async function knowledge(args, io) {
        const namedArgs = parseNamedArguments(args, knowledgeDef());
        const extractor = conversation.createKnowledgeExtractor(context.models.chatModel, {
            maxContextLength: context.maxCharsPerChunk,
            mergeActionKnowledge: false,
        });
        let [messages, msgCount] = await getMessagesAndCount(context.conversationManager, namedArgs.maxTurns);
        await asyncArray.forEachBatch(messages, namedArgs.concurrency, (batch) => {
            printer.writeBatchProgress(batch, "Messages", msgCount);
            return batch.value.map((message) => extractor.extract(message.value));
        }, (batch, knowledgeResults) => {
            for (let k = 0; k < knowledgeResults.length; ++k) {
                const knowledge = knowledgeResults[k];
                if (knowledge) {
                    printer.writeListInColor(chalk.cyan, batch.value[k].value);
                    printer.writeKnowledge(knowledge);
                    printer.writeLine();
                }
            }
        });
    }
    function buildIndexDef() {
        return {
            description: "Index all messages in the current conversation",
            options: {
                mergeWindow: argNum("Topic merge window size", 8),
                maxTurns: argNum("Number of turns to run", 10),
                concurrency: argConcurrency(2),
                actions: argBool("Index actions", true),
            },
        };
    }
    commands.buildIndex.metadata = buildIndexDef();
    async function buildIndex(args, io) {
        const namedArgs = parseNamedArguments(args, buildIndexDef());
        const cm = context.conversationManager;
        await cm.clear(false);
        let [messages, msgCount] = await getMessagesAndCount(cm, namedArgs.maxTurns);
        let messageIndex = await context.conversation.getMessageIndex();
        cm.topicMerger.settings.mergeWindowSize = namedArgs.mergeWindow;
        let count = 0;
        const concurrency = namedArgs.concurrency;
        for await (const slice of asyncArray.readBatches(messages, concurrency)) {
            printer.writeBatchProgress(slice, "Indexing messages", msgCount);
            await asyncArray.mapAsync(slice.value, concurrency, (m) => messageIndex.put(m.value, m.blockId));
            printer.writeBatchProgress(slice, "Extracting knowledge", msgCount);
            const knowledgeResults = await conversation.extractKnowledge(cm.knowledgeExtractor, slice.value, concurrency);
            for (const knowledgeResult of knowledgeResults) {
                ++count;
                printer.writeProgress(count, msgCount);
                if (!knowledgeResult) {
                    continue;
                }
                const [message, knowledge] = knowledgeResult;
                await writeKnowledgeResult(message, knowledge);
                const knowledgeIds = await cm.conversation.addKnowledgeForMessage(message, knowledge);
                if (knowledgeIds.topicIds && knowledgeIds.topicIds.length > 0) {
                    const mergedTopic = await cm.topicMerger.next(knowledge.topics, knowledgeIds.topicIds, undefined, true);
                    if (mergedTopic) {
                        printer.writeTitle("Merged Topic:");
                        printer.writeTemporalBlock(chalk.blueBright, mergedTopic);
                    }
                }
                await cm.conversation.addKnowledgeToIndex(knowledge, knowledgeIds);
                printer.writeLine();
            }
        }
    }
    async function writeKnowledgeResult(message, knowledge) {
        printer.writeInColor(chalk.cyan, message.value);
        await writeExtractedTopics(knowledge.topics, false);
        printer.writeExtractedEntities(knowledge.entities);
        printer.writeExtractedActions(knowledge.actions);
    }
    function topicsDef() {
        return {
            description: "Search for or display topics",
            options: {
                query: arg("value to search for"),
                exact: argBool("Exact match?"),
                count: argNum("Num matches", 3),
                minScore: argMinScore(0),
                showSource: argBool("Show the sources of this topic"),
                level: argNum("Topics at this level", 1),
            },
        };
    }
    commands.topics.metadata = topicsDef();
    async function topics(args, io) {
        const namedArgs = parseNamedArguments(args, topicsDef());
        const index = await context.conversation.getTopicsIndex(namedArgs.level);
        const query = namedArgs.query;
        if (query) {
            if (namedArgs.showMessages) {
                await searchMessagesByTopic(index, query, namedArgs.exact, namedArgs.count, namedArgs.minScore);
            }
            else {
                await searchTopicsText(index, query, namedArgs.exact, namedArgs.count, namedArgs.minScore);
            }
            return;
        }
        const sourceIndex = namedArgs.level > 1
            ? await context.conversation.getTopicsIndex(namedArgs.level - 1)
            : undefined;
        for await (const topic of index.entries()) {
            await writeExtractedTopic(topic, namedArgs.showSource, sourceIndex);
        }
    }
    function entitiesDef() {
        return {
            description: "Search for entities",
            options: {
                name: arg("Names to search for"),
                type: arg("Type to search for"),
                facet: arg("Facet to search for"),
                exact: argBool("Exact match?"),
                count: argNum("Num matches", 1),
                facetCount: argNum("Num facet matches", 10),
                minScore: argNum("Min score", 0),
                showMessages: argBool(),
            },
        };
    }
    commands.entities.metadata = entitiesDef();
    async function entities(args, io) {
        const namedArgs = parseNamedArguments(args, entitiesDef());
        let query = namedArgs.name ?? namedArgs.type ?? namedArgs.facet;
        if (query) {
            const isMultipart = namedArgs.facet || (namedArgs.name && namedArgs.type);
            if (namedArgs.exact || !isMultipart) {
                await searchEntityIndex(query, namedArgs.name !== undefined, namedArgs.exact, namedArgs.count, namedArgs.minScore, namedArgs.showMessages);
            }
            else {
                // Multipart query
                await searchEntityIndex_Multi(namedArgs.name, namedArgs.type, namedArgs.facet, namedArgs.count, namedArgs.facetCount, namedArgs.minScore, namedArgs.showMessages);
            }
            return;
        }
        const index = await context.conversation.getEntityIndex();
        const entities = [
            ...conversation.toCompositeEntities(await asyncArray.toArray(index.entities())),
        ];
        entities.sort((x, y) => x.name.localeCompare(y.name));
        printer.writeCompositeEntities(entities);
    }
    function actionsDef() {
        return {
            description: "Search for actions",
            options: {
                subject: arg("Subject to search for", conversation.NoEntityName),
                object: arg("Object to search for"),
                indirectObject: arg("Indirect object to search for"),
                verb: arg("Verb to search for. Compound verbs are comma separated"),
                tense: arg("Verb tense: past | present | future"),
                count: argNum("Num action matches", 1),
                verbCount: argNum("Num verb matches", 1),
                nameCount: argNum("Num name matches", 3),
                showMessages: argBool("display messages", false),
            },
        };
    }
    commands.actions.metadata = actionsDef();
    async function actions(args, io) {
        const index = await context.conversation.getActionIndex();
        if (args.length === 0) {
            const actions = (await asyncArray.toArray(index.entries())).map((a) => a.value);
            const merged = conversation.mergeActions(actions);
            printer.writeActionGroups(merged);
            return;
        }
        const namedArgs = parseNamedArguments(args, actionsDef());
        const verb = namedArgs.verb;
        const verbTense = namedArgs.tense;
        let verbs;
        if (verb) {
            verbs = knowLib.split(verb, ",", {
                removeEmpty: true,
                trim: true,
            });
            if (verbs.length === 0) {
                verbs = undefined;
            }
            else if (verbs[0] === "*") {
                const allVerbs = await index.getAllVerbs();
                printer.writeList(allVerbs, { type: "ul" });
                return;
            }
        }
        // Full search
        const filter = {
            filterType: "Action",
            subjectEntityName: namedArgs.subject,
            objectEntityName: namedArgs.object,
            indirectObjectEntityName: namedArgs.indirectObject,
        };
        if (verbs && verbs.length > 0) {
            filter.verbFilter = {
                verbs,
                verbTense,
            };
        }
        const searchOptions = conversation.createActionSearchOptions(true);
        searchOptions.verbSearchOptions.maxMatches = namedArgs.verbCount;
        searchOptions.maxMatches = namedArgs.nameCount;
        const matches = await index.search(filter, searchOptions);
        if (matches.actions) {
            for (let i = 0; i < matches.actions.length; ++i) {
                printer.writeLine(`${i + 1}, ${conversation.actionToString(matches.actions[i])}`);
            }
            if (namedArgs.showMessages && matches.actionIds) {
                const messages = await loadMessages(await index.getSourceIds(matches.actionIds));
                printer.writeTemporalBlocks(chalk.cyan, messages);
            }
        }
    }
    function searchDefBase() {
        return {
            description: "Natural language search on conversation",
            args: {
                query: arg("Search query"),
            },
            options: {
                maxMatches: argNum("Maximum fuzzy matches", 2),
                minScore: argNum("Minimum similarity score", 0.8),
                fallback: argBool("Fallback to message search", true),
                eval: argBool("Evaluate search query", true),
                debug: argBool("Show debug info", false),
                save: argBool("Save the search", false),
                v2: argBool("Run V2 match", true),
            },
        };
    }
    function searchDef() {
        const def = searchDefBase();
        if (!def.options) {
            def.options = {};
        }
        def.options.skipEntities = argBool("Skip entity matching", false);
        def.options.skipActions = argBool("Skip action matching", false);
        def.options.skipTopics = argBool("Skip topics matching", false);
        def.options.skipMessages = argBool("Skip loading messages", false);
        def.options.threads = argBool("Use most likely thread", false);
        return def;
    }
    commands.search.metadata = searchDef();
    async function search(args, io) {
        await searchConversation(context.searcher, true, parseNamedArguments(args, searchDef()));
    }
    function searchTopicsDef() {
        const def = searchDefBase();
        if (!def.options) {
            def.options = {};
        }
        def.options.showSources = argBool("Show links to source", false);
        return def;
    }
    commands.searchTopics.metadata = searchTopicsDef();
    async function searchTopics(args, io) {
        const namedArgs = parseNamedArguments(args, searchTopicsDef());
        namedArgs.v2 = true;
        namedArgs.skipActions = true;
        namedArgs.skipEntities = true;
        namedArgs.skipMessages = true;
        const searchResponse = await searchConversation(context.searcher, true, namedArgs);
        if (namedArgs.showSources && searchResponse) {
            writeResultLinks(searchResponse);
        }
    }
    function searchEntitiesDef() {
        const def = searchDefBase();
        if (!def.options) {
            def.options = {};
        }
        def.options.showSources = argBool("Show links to source", false);
        return def;
    }
    commands.searchEntities.metadata = searchDefBase();
    async function searchEntities(args, io) {
        const namedArgs = parseNamedArguments(args, searchEntitiesDef());
        namedArgs.v2 = true;
        namedArgs.skipActions = true;
        namedArgs.skipTopics = true;
        namedArgs.skipMessages = true;
        const searchResponse = await searchConversation(context.searcher, true, namedArgs);
        if (namedArgs.showSources && searchResponse) {
            writeResultLinks(searchResponse);
        }
    }
    function searchV2DebugDef() {
        return {
            description: "Search by terms V2",
            args: {
                query: arg("Query to run"),
            },
        };
    }
    commands.searchV2Debug.metadata = searchV2DebugDef();
    async function searchV2Debug(args) {
        const namedArgs = parseNamedArguments(args, searchV2DebugDef());
        const result = await context.searcher.actions.translateSearchTermsV2(namedArgs.query);
        if (!result.success) {
            printer.writeError(result.message);
            return;
        }
        printer.writeJson(result.data, true);
        if (result.data.actionName === "getAnswer") {
            const searchResponse = await context.conversation.searchTermsV2(result.data.parameters.filters);
            printer.writeSearchResponse(searchResponse);
        }
    }
    function ragDef() {
        return {
            description: "RAG",
            args: {
                query: arg("Search query"),
            },
            options: {
                maxMessages: argNum("Maximum messages to match", 50),
                minScore: argNum("Minimum similarity score", 0.75),
                maxMessageTokens: argNum("Maximum (approx) # of message tokens to send", 4096),
                debug: argBool("dump matches", false),
            },
        };
    }
    commands.rag.metadata = ragDef();
    async function rag(args) {
        const namedArgs = parseNamedArguments(args, ragDef());
        let prevStats = beginCountingTokens();
        try {
            const options = {
                maxMatches: namedArgs.maxMessages,
                minScore: namedArgs.minScore,
            };
            printer.writeInColor(chalk.cyan, () => {
                printer.writeLine(`Max message tokens (approx): ${namedArgs.maxMessageTokens}`);
                printer.writeLine(`Min score:${options.minScore} [${Math.round(mathLib.angleDegreesFromCosine(options.minScore))} degrees]`);
                printer.writeLine(`Max messages:${options.maxMatches}`);
            });
            const response = await context.searcher.searchMessages(namedArgs.query, options, namedArgs.maxMessageTokens * 3.5);
            const answer = response.answer;
            if (answer) {
                printer.writeLine();
                printer.writeResultStats(response);
                writeTokenStats();
                printer.writeAnswer(answer);
            }
            if (namedArgs.debug) {
                printer.writeSearchResponse(response);
            }
        }
        catch {
            endCountingTokens(prevStats);
        }
    }
    function makeTestSetDef() {
        return {
            description: "Make a test set from the query batch file",
            args: {
                filePath: argSourceFile(),
            },
            options: {
                destPath: argDestFile(),
                concurrency: argConcurrency(2),
            },
        };
    }
    commands.makeTestSet.metadata = makeTestSetDef();
    async function makeTestSet(args) {
        const namedArgs = parseNamedArguments(args, makeTestSetDef());
        await conversation.testData.searchBatchFile(context.conversationManager, namedArgs.filePath, namedArgs.destPath, namedArgs.concurrency, writeProgress);
    }
    function runTestSetDef() {
        return {
            description: "Run a test set",
            args: {
                filePath: argSourceFile(),
            },
            options: {
                concurrency: argConcurrency(2),
                minScore: argMinScore(0.8),
            },
        };
    }
    commands.runTestSet.metadata = runTestSetDef();
    async function runTestSet(args) {
        const namedArgs = parseNamedArguments(args, runTestSetDef());
        const comparisons = await conversation.testData.compareQueryBatchFile(context.conversationManager, context.models.embeddingModel, namedArgs.filePath, namedArgs.concurrency, writeProgress);
        printer.writeLine();
        // Sort in order of least similar
        comparisons.sort((x, y) => x.similarity - y.similarity);
        for (const c of comparisons) {
            const hasIssue = c.similarity < namedArgs.minScore;
            const color = hasIssue ? chalk.redBright : chalk.green;
            printer.writeInColor(color, `[${c.similarity}]\n${c.baseLine.query}`);
            if (hasIssue) {
                printer.writeLine("#Answer#");
                await writeSearchResponse(c.baseLine.answer, chalk.green);
                await writeSearchResponse(c.answer, chalk.redBright);
            }
            printer.writeLine();
        }
    }
    function tokenLogDef() {
        return {
            description: "Enable token logging",
            options: {
                enable: argBool(),
            },
        };
    }
    commands.tokenLog.metadata = tokenLogDef();
    async function tokenLog(args) {
        const namedArgs = parseNamedArguments(args, tokenLogDef());
        showTokenStats =
            namedArgs.enable !== undefined ? namedArgs.enable : showTokenStats;
    }
    //--------------------
    // END COMMANDS
    //--------------------
    async function writeHistory(conversation) {
        for await (const message of conversation.messages.entries()) {
            printer.writeSourceBlock(message);
            printer.writeLine();
        }
    }
    async function searchConversation(searcher, recordAnswer, namedArgs) {
        const maxMatches = namedArgs.maxMatches;
        const minScore = namedArgs.minScore;
        let query = namedArgs.query.trim();
        if (!query || query.length === 0) {
            return undefined;
        }
        printer.writeInColor(chalk.cyan, `Searching ${context.conversationName}`);
        const searchOptions = {
            maxMatches,
            minScore,
            maxMessages: 10,
            progress: (value) => printer.writeJson(value),
        };
        if (namedArgs.fallback) {
            searchOptions.fallbackSearch = { maxMatches: 10 };
        }
        if (namedArgs.threads) {
            searchOptions.threadSearch = { maxMatches: 1, minScore: 0.8 };
        }
        if (!namedArgs.eval) {
            // just translate user query into structured query without eval
            const translationContext = await context.searcher.buildContext(query, searchOptions);
            const searchResult = namedArgs.v2
                ? await searcher.actions.translateSearchTermsV2(query, translationContext)
                : await context.searcher.actions.translateSearch(query, translationContext);
            printer.writeJson(searchResult);
            return undefined;
        }
        //searcher.answers.settings.chunking.enable = true;
        let prevStats = beginCountingTokens();
        try {
            const timestampQ = new Date();
            let result;
            if (namedArgs.v2) {
                searchOptions.skipEntitySearch = namedArgs.skipEntities;
                searchOptions.skipActionSearch = namedArgs.skipActions;
                searchOptions.skipTopicSearch = namedArgs.skipTopics;
                searchOptions.skipMessages = namedArgs.skipMessages;
                result = await searcher.searchTermsV2(query, undefined, searchOptions);
            }
            else {
                result = await searcher.searchTerms(query, undefined, searchOptions);
            }
            if (!result) {
                printer.writeError("No result");
                return undefined;
            }
            printer.writeLine();
            writeTokenStats();
            printer.writeSearchTermsResult(result, namedArgs.debug);
            if (result.response && result.response.answer) {
                if (namedArgs.save && recordAnswer) {
                    let answer = result.response.answer.answer;
                    if (!answer) {
                        answer = result.response.answer.whyNoAnswer;
                    }
                    if (answer) {
                        recordQuestionAnswer(query, timestampQ, answer, new Date());
                    }
                }
            }
            return result.response;
        }
        finally {
            endCountingTokens(prevStats);
        }
    }
    async function writeSearchResponse(answerResponse, color) {
        if (answerResponse) {
            if (answerResponse.answer) {
                printer.writeInColor(color, answerResponse.answer);
            }
            else if (answerResponse.whyNoAnswer) {
                printer.writeInColor(color, answerResponse.whyNoAnswer);
            }
        }
    }
    function recordQuestionAnswer(question, timestampQ, answer, timestampA) {
        // Don't record questions about the search history
        if (context.searchMemory &&
            context.searchMemory.conversationName !== context.conversationName) {
            try {
                context.searchMemory.queueAddMessage({
                    text: `USER:\n${question}`,
                    timestamp: timestampQ,
                });
                context.searchMemory.queueAddMessage({
                    text: `ASSISTANT:\n${answer}`,
                    timestamp: timestampA,
                });
            }
            catch (e) {
                printer.writeError(`Error updating history\n${e}`);
            }
        }
    }
    async function writeResultLinks(rr) {
        if (rr.messageIds && rr.messages) {
            const urlGet = context.conversation.messages.getUrl;
            for (let i = 0; i < rr.messageIds.length; ++i) {
                const message = rr.messages[i];
                let links;
                if (message.value.sourceIds) {
                    links = message.value.sourceIds.map((id) => pathToFileURL(id).toString());
                }
                else if (urlGet) {
                    rr.messageIds.map((id) => urlGet(id).toString());
                }
                else {
                    links = undefined;
                }
                printer.writeList(links, { type: "ul" });
            }
        }
    }
    async function searchTopicsText(index, query, exact, count, minScore) {
        const matches = await knowLib.searchIndexText(index.textIndex, query, exact, count, minScore);
        for (const match of matches) {
            printer.writeInColor(chalk.green, `[${match.score}]`);
            const text = await index.textIndex.getText(match.item);
            printer.writeInColor(chalk.cyan, text);
        }
    }
    async function searchMessagesByTopic(index, query, exact, count, minScore) {
        const matches = await knowLib.searchIndex(index.textIndex, query, exact, count, minScore);
        for (const match of matches) {
            printer.writeInColor(chalk.green, `[${match.score}]`);
            const messages = await loadMessages(match.item);
            printer.writeTemporalBlocks(chalk.greenBright, messages);
        }
    }
    async function searchEntityIndex(query, name, exact, count, minScore, showMessages) {
        const index = await context.conversation.getEntityIndex();
        const matches = await knowLib.searchIndex(name ? index.nameIndex : index.typeIndex, query, exact, count, minScore);
        for (const match of matches) {
            printer.writeInColor(chalk.green, `[${match.score}]`);
            await writeEntitiesById(index, match.item, showMessages);
        }
    }
    async function searchEntityIndex_Multi(name, type, facet, count, faceCount, minScore, showMessages) {
        const index = await context.conversation.getEntityIndex();
        let nameMatches;
        let typeMatches;
        let facetMatches;
        if (name) {
            nameMatches = await index.nameIndex.getNearest(name, count, minScore);
        }
        if (type) {
            typeMatches = await index.typeIndex.getNearest(type, count, minScore);
        }
        if (facet) {
            facetMatches = await index.facetIndex.getNearest(facet, faceCount, minScore);
        }
        const matches = [
            ...knowLib.sets.intersectMultiple(nameMatches, typeMatches, facetMatches),
        ];
        await writeEntitiesById(index, matches, showMessages);
    }
    async function writeExtractedTopics(topics, showSources) {
        if (topics && topics.length > 0) {
            if (showSources) {
                printer.writeBlocks(chalk.cyan, await knowLib.getTextBlockSources(context.conversation.messages, topics));
            }
            const list = topics.map((t) => t.value);
            writeList("Topics", list);
        }
    }
    async function writeExtractedTopic(topic, showSource, sourceIndex) {
        printer.writeBullet(topic.value);
        if (showSource) {
            if (sourceIndex) {
                const textBlocks = await loadTopics(sourceIndex, topic.sourceIds);
                printer.writeListInColor(chalk.greenBright, textBlocks);
            }
            else {
                const textBlocks = await loadMessages(topic.sourceIds);
                printer.writeTemporalBlocks(chalk.greenBright, textBlocks);
            }
        }
    }
    /*
    async function writeExtractedEntity(
        entity: conversation.ExtractedEntity,
        showTopics?: boolean,
        showMessages?: boolean,
    ) {
        if (showMessages) {
            const messages = await loadMessages(entity.sourceIds);
            printer.writeTemporalBlocks(chalk.greenBright, messages);
        }
        printer.writeCompositeEntity(
            conversation.toCompositeEntity(entity.value),
        );
        if (showTopics) {
            for (const id of entity.sourceIds) {
                const k = await context.conversation.knowledge.get(id);
                if (k) {
                    printer.writeBlocks(chalk.cyan, k.topics);
                }
            }
        }
    }
    */
    async function writeEntitiesById(index, entityIds, showMessages) {
        if (!entityIds || entityIds.length === 0) {
            return;
        }
        if (showMessages) {
            const messages = await loadMessages(await index.getSourceIds(entityIds));
            printer.writeTemporalBlocks(chalk.cyan, messages);
        }
        else {
            const entities = await asyncArray.mapAsync(entityIds, context.searchConcurrency, (id) => index.get(id));
            const composite = conversation.mergeEntities(knowLib.sets.removeUndefined(entities.map((e) => e?.value)));
            const compositeEntities = [];
            for (const ce of composite.values()) {
                compositeEntities.push(ce.value);
            }
            printer.writeCompositeEntities(compositeEntities);
        }
    }
    function writeList(title, list) {
        if (list && list.length > 0) {
            if (title.length > 0) {
                printer.writeUnderline(title);
            }
            printer.writeList(list, { type: "ul" });
        }
    }
    async function loadMessages(ids) {
        if (ids && ids.length > 0) {
            return await context.conversation.messages.getMultiple(ids);
        }
        return [];
    }
    async function loadTopics(topicLevel, ids) {
        if (ids && ids.length > 0) {
            const index = typeof topicLevel === "number"
                ? await context.conversation.getTopicsIndex(topicLevel - 1)
                : topicLevel;
            return index.getMultipleText(ids);
        }
        return [];
    }
    function writeProgress(value, i, total) {
        printer.writeLine(`${i + 1}/${total} ${value}`);
    }
    function beginCountingTokens() {
        const prevStats = context.stats;
        context.stats = knowLib.createIndexingStats();
        context.stats.startItem();
        return prevStats;
    }
    function endCountingTokens(prevStats) {
        context.stats = prevStats;
    }
    function writeTokenStats() {
        if (context.stats) {
            printer.writeCompletionStats(context.stats.totalStats.tokenStats);
        }
    }
    await runConsole({
        onStart,
        inputHandler,
        handlers: commands,
    });
}
//# sourceMappingURL=chatMemory.js.map