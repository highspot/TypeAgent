// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as kp from "knowpro";
import * as knowLib from "knowledge-processor";
import { arg, argBool, argNum, parseNamedArguments, ProgressBar, StopWatch, } from "interactive-app";
import fs from "fs";
import { addFileNameSuffixToPath, argDestFile, argSourceFile, argToDate, parseFreeAndNamedArguments, keyValuesFromNamedArgs, } from "./common.js";
import { dateTime, ensureDir, getFileName } from "typeagent";
import path from "path";
import chalk from "chalk";
import { KnowProPrinter } from "./knowproPrinter.js";
import * as cm from "conversation-memory";
import * as im from "image-memory";
import { matchFilterToConversation } from "./knowproCommon.js";
export async function createKnowproCommands(chatContext, commands) {
    const knowledgeModel = chatContext.models.chatModel;
    const context = {
        knowledgeModel,
        knowledgeActions: knowLib.conversation.createKnowledgeActionTranslator(knowledgeModel),
        searchTranslator: kp.createSearchTranslator(knowledgeModel),
        basePath: "/data/testChat/knowpro",
        printer: new KnowProPrinter(),
    };
    await ensureDir(context.basePath);
    commands.kpPodcastMessages = showMessages;
    commands.kpPodcastImport = podcastImport;
    commands.kpPodcastSave = podcastSave;
    commands.kpPodcastLoad = podcastLoad;
    commands.kpSearchTerms = searchTerms;
    commands.kpSearchV1 = searchV1;
    commands.kpSearch = search;
    commands.kpEntities = entities;
    commands.kpPodcastBuildIndex = podcastBuildIndex;
    commands.kpImages = showImages;
    commands.kpImagesImport = imagesImport;
    commands.kpImagesSave = imagesSave;
    commands.kpImagesLoad = imagesLoad;
    commands.kpImagesBuildIndex = imagesBuildIndex;
    /*----------------
     * COMMANDS
     *---------------*/
    ////////////////// Podcast Commands //////////////////
    function showMessagesDef() {
        return {
            description: "Show all messages",
            options: {
                maxMessages: argNum("Maximum messages to display"),
            },
        };
    }
    commands.kpPodcastMessages.metadata = "Show all messages";
    async function showMessages(args) {
        const conversation = ensureConversationLoaded();
        if (!conversation) {
            return;
        }
        const namedArgs = parseNamedArguments(args, showMessagesDef());
        const messages = namedArgs.maxMessages > 0
            ? conversation.messages.slice(0, namedArgs.maxMessages)
            : conversation.messages;
        messages.forEach((m) => context.printer.writeMessage(m));
    }
    function podcastImportDef() {
        return {
            description: "Create knowPro index",
            args: {
                filePath: arg("File path to transcript file"),
                startAt: arg("Start date and time"),
            },
            options: {
                indexFilePath: arg("Output path for index file"),
                maxMessages: argNum("Maximum messages to index"),
                length: argNum("Length of the podcast in minutes", 60),
                buildIndex: argBool("Index the imported podcast", true),
            },
        };
    }
    commands.kpPodcastImport.metadata = podcastImportDef();
    async function podcastImport(args) {
        const namedArgs = parseNamedArguments(args, podcastImportDef());
        if (!fs.existsSync(namedArgs.filePath)) {
            context.printer.writeError(`${namedArgs.filePath} not found`);
            return;
        }
        const startAt = argToDate(namedArgs.startAt);
        const endAt = dateTime.addMinutesToDate(startAt, namedArgs.length);
        context.podcast = await cm.importPodcast(namedArgs.filePath);
        cm.timestampMessages(context.podcast.messages, startAt, endAt);
        context.conversation = context.podcast;
        context.printer.writeLine("Imported podcast:");
        context.printer.writePodcastInfo(context.podcast);
        if (!namedArgs.buildIndex) {
            return;
        }
        // Build index
        await podcastBuildIndex(namedArgs);
        // Save the index
        namedArgs.filePath = sourcePathToIndexPath(namedArgs.filePath, namedArgs.indexFilePath);
        await podcastSave(namedArgs);
    }
    function podcastSaveDef() {
        return {
            description: "Save Podcast",
            args: {
                filePath: argDestFile(),
            },
        };
    }
    commands.kpPodcastSave.metadata = podcastSaveDef();
    async function podcastSave(args) {
        const namedArgs = parseNamedArguments(args, podcastSaveDef());
        if (!context.podcast) {
            context.printer.writeError("No podcast loaded");
            return;
        }
        context.printer.writeLine("Saving index");
        context.printer.writeLine(namedArgs.filePath);
        const dirName = path.dirname(namedArgs.filePath);
        await ensureDir(dirName);
        const clock = new StopWatch();
        clock.start();
        await context.podcast.writeToFile(dirName, getFileName(namedArgs.filePath));
        clock.stop();
        context.printer.writeTiming(chalk.gray, clock, "Write to file");
    }
    function podcastLoadDef() {
        return {
            description: "Load knowPro podcast",
            options: {
                filePath: argSourceFile(),
                name: arg("Podcast name"),
            },
        };
    }
    commands.kpPodcastLoad.metadata = podcastLoadDef();
    async function podcastLoad(args) {
        const namedArgs = parseNamedArguments(args, podcastLoadDef());
        let podcastFilePath = namedArgs.filePath;
        podcastFilePath ??= namedArgs.name
            ? podcastNameToFilePath(namedArgs.name)
            : undefined;
        if (!podcastFilePath) {
            context.printer.writeError("No filepath or name provided");
            return;
        }
        const clock = new StopWatch();
        clock.start();
        const podcast = await cm.Podcast.readFromFile(path.dirname(podcastFilePath), getFileName(podcastFilePath));
        clock.stop();
        context.printer.writeTiming(chalk.gray, clock, "Read file");
        if (!podcast) {
            context.printer.writeLine("Podcast file not found");
            return;
        }
        context.podcast = podcast;
        context.conversation = context.podcast;
        context.printer.conversation = context.conversation;
        context.printer.writePodcastInfo(context.podcast);
    }
    ////////////////// Image Commands //////////////////
    function showImagesDef() {
        return {
            description: "Show all images",
            options: {
                maxMessages: argNum("Maximum images to display"),
            },
        };
    }
    commands.kpImages.metadata = "Show all images";
    async function showImages(args) {
        const conversation = ensureConversationLoaded();
        if (!conversation) {
            return;
        }
        const namedArgs = parseNamedArguments(args, showImagesDef());
        const messages = namedArgs.maxMessages > 0
            ? conversation.messages.slice(0, namedArgs.maxMessages)
            : conversation.messages;
        messages.forEach((m) => context.printer.writeMessage(m));
    }
    function imageImportDef() {
        return {
            description: "Create knowPro image index",
            args: {
                filePath: arg("File path to an image file or folder"),
            },
            options: {
                knowledge: argBool("Index knowledge", true),
                related: argBool("Index related terms", true),
                indexFilePath: arg("Output path for index file"),
                maxMessages: argNum("Maximum images to index"),
                cachePath: arg("Path to image knowledge response cache."),
            },
        };
    }
    commands.kpImagesImport.metadata = imageImportDef();
    async function imagesImport(args) {
        const namedArgs = parseNamedArguments(args, imageImportDef());
        if (!fs.existsSync(namedArgs.filePath)) {
            context.printer.writeError(`${namedArgs.filePath} not found`);
            return;
        }
        let progress = new ProgressBar(context.printer, 165);
        context.images = await im.importImages(namedArgs.filePath, namedArgs.cachePath, true, (text, _index, max) => {
            progress.total = max;
            progress.advance();
            return progress.count < max;
        });
        context.conversation = context.images;
        progress.complete();
        context.printer.writeLine("Imported images:");
        context.printer.writeImageCollectionInfo(context.images);
        if (!namedArgs.index) {
            return;
        }
        // Build the image collection index
        await imagesBuildIndex(namedArgs);
        // Save the image collection index
        namedArgs.filePath = sourcePathToIndexPath(namedArgs.filePath, namedArgs.indexFilePath);
        await imagesSave(namedArgs);
    }
    function imagesSaveDef() {
        return {
            description: "Save Image Collection",
            args: {
                filePath: argDestFile(),
            },
        };
    }
    commands.kpImagesSave.metadata = imagesSaveDef();
    async function imagesSave(args) {
        const namedArgs = parseNamedArguments(args, imagesSaveDef());
        if (!context.images) {
            context.printer.writeError("No image collection loaded");
            return;
        }
        context.printer.writeLine("Saving index");
        context.printer.writeLine(namedArgs.filePath);
        if (context.images) {
            const dirName = path.dirname(namedArgs.filePath);
            await ensureDir(dirName);
            await context.images.writeToFile(dirName, getFileName(namedArgs.filePath));
        }
    }
    function imagesLoadDef() {
        return {
            description: "Load knowPro image collection",
            options: {
                filePath: argSourceFile(),
                name: arg("Image Collection Name"),
            },
        };
    }
    commands.kpImagesLoad.metadata = imagesLoadDef();
    async function imagesLoad(args) {
        const namedArgs = parseNamedArguments(args, imagesLoadDef());
        let imagesFilePath = namedArgs.filePath;
        imagesFilePath ??= namedArgs.name
            ? podcastNameToFilePath(namedArgs.name)
            : undefined;
        if (!imagesFilePath) {
            context.printer.writeError("No filepath or name provided");
            return;
        }
        context.images = await im.ImageCollection.readFromFile(path.dirname(imagesFilePath), getFileName(imagesFilePath));
        if (!context.images) {
            context.printer.writeLine("ImageCollection not found");
            return;
        }
        context.conversation = context.images;
        context.printer.conversation = context.conversation;
        context.printer.writeImageCollectionInfo(context.images);
    }
    ////////////////// Miscellaneous Commands //////////////////
    function searchTermsDef(description, kType) {
        const meta = {
            description: description ??
                "Search current knowPro conversation by manually providing terms as arguments",
            options: {
                maxToDisplay: argNum("Maximum matches to display", 25),
                displayAsc: argBool("Display results in ascending order", true),
                startMinute: argNum("Starting at minute."),
                endMinute: argNum("Ending minute."),
                startDate: arg("Starting at this date"),
                endDate: arg("Ending at this date"),
                andTerms: argBool("'And' all terms. Default is 'or", false),
                exact: argBool("Exact match only. No related terms", false),
                usePropertyIndex: argBool("Use property index while searching", true),
                useTimestampIndex: argBool("Use timestamp index while searching", true),
                distinct: argBool("Show distinct results", false),
            },
        };
        if (kType === undefined) {
            meta.options.ktype = arg("Knowledge type");
        }
        return meta;
    }
    commands.kpSearchTerms.metadata = searchTermsDef();
    async function searchTerms(args) {
        if (args.length === 0) {
            return;
        }
        const conversation = ensureConversationLoaded();
        if (!conversation) {
            return;
        }
        const commandDef = searchTermsDef();
        let [termArgs, namedArgs] = parseFreeAndNamedArguments(args, commandDef);
        if (conversation.semanticRefIndex && conversation.semanticRefs) {
            context.printer.writeInColor(chalk.cyan, `Searching ${conversation.nameTag}...`);
            const timer = new StopWatch();
            timer.start();
            const matches = await kp.searchConversation(conversation, createSearchGroup(termArgs, namedArgs, commandDef, namedArgs.andTerms), whenFilterFromNamedArgs(namedArgs, commandDef), {
                exactMatch: namedArgs.exact,
                usePropertyIndex: namedArgs.usePropertyIndex,
                useTimestampIndex: namedArgs.useTimestampIndex,
            });
            timer.stop();
            if (matches && matches.size > 0) {
                context.printer.writeLine();
                context.printer.writeSearchResults(conversation, matches, namedArgs.maxToDisplay, namedArgs.distinct);
            }
            else {
                context.printer.writeLine("No matches");
            }
            context.printer.writeTiming(chalk.gray, timer);
        }
        else {
            context.printer.writeError("Conversation is not indexed");
        }
    }
    function searchDef() {
        return {
            description: "Search using natural language and knowlege-processor search filters",
            args: {
                query: arg("Search query"),
            },
            options: {
                maxToDisplay: argNum("Maximum matches to display", 25),
                exact: argBool("Exact match only. No related terms", false),
                ktype: arg("Knowledge type"),
            },
        };
    }
    commands.kpSearch.metadata = searchDef();
    async function searchV1(args) {
        if (!ensureConversationLoaded()) {
            return;
        }
        const namedArgs = parseNamedArguments(args, searchDef());
        const query = namedArgs.query;
        const result = await context.knowledgeActions.translateSearchTermsV2(query, kp.getTimeRangeSectionForConversation(context.conversation));
        if (!result.success) {
            context.printer.writeError(result.message);
            return;
        }
        let searchAction = result.data;
        if (searchAction.actionName !== "getAnswer") {
            return;
        }
        context.printer.writeSearchFilter(searchAction);
        if (searchAction.parameters.filters.length > 0) {
            const filter = searchAction.parameters.filters[0];
            const searchResults = await matchFilterToConversation(context.conversation, filter, namedArgs.ktype, {
                exactMatch: namedArgs.exact,
            });
            if (searchResults) {
                context.printer.writeSearchResults(context.conversation, searchResults, namedArgs.maxToDisplay);
            }
            else {
                context.printer.writeLine("No matches");
            }
        }
    }
    function searchDefNew() {
        const def = searchDef();
        def.description =
            "Search using natural language and new knowpro filter";
        return def;
    }
    commands.kpSearch.metadata = searchDefNew();
    async function search(args) {
        if (!ensureConversationLoaded()) {
            return;
        }
        const namedArgs = parseNamedArguments(args, searchDefNew());
        const query = namedArgs.query;
        const result = await context.searchTranslator.translate(query, kp.getTimeRangeSectionForConversation(context.conversation));
        if (!result.success) {
            context.printer.writeError(result.message);
            return;
        }
        const filter = result.data;
        if (filter) {
            context.printer.writeJson(filter, true);
        }
        const terms = kp.createSearchGroupFromSearchFilter(filter);
        const when = kp.createWhenFromSearchFilter(filter);
        const searchResults = await kp.searchConversation(context.conversation, terms, when, {
            exactMatch: namedArgs.exact,
        });
        if (searchResults) {
            context.printer.writeSearchResults(context.conversation, searchResults, namedArgs.maxToDisplay);
        }
        else {
            context.printer.writeLine("No matches");
        }
    }
    function createSearchGroup(termArgs, namedArgs, commandDef, andTerms = false) {
        const searchTerms = parseQueryTerms(termArgs);
        const propertyTerms = propertyTermsFromNamedArgs(namedArgs, commandDef);
        return {
            booleanOp: andTerms ? "and" : "or",
            terms: [...searchTerms, ...propertyTerms],
        };
    }
    function propertyTermsFromNamedArgs(namedArgs, commandDef) {
        return createPropertyTerms(namedArgs, commandDef);
    }
    function createPropertyTerms(namedArgs, commandDef, nameFilter) {
        const keyValues = keyValuesFromNamedArgs(namedArgs, commandDef);
        const propertyNames = nameFilter
            ? Object.keys(keyValues).filter(nameFilter)
            : Object.keys(keyValues);
        const propertySearchTerms = [];
        for (const propertyName of propertyNames) {
            const allValues = splitTermValues(keyValues[propertyName]);
            for (const value of allValues) {
                propertySearchTerms.push(kp.createPropertySearchTerm(propertyName, value));
            }
        }
        return propertySearchTerms;
    }
    function whenFilterFromNamedArgs(namedArgs, commandDef) {
        let filter = {
            knowledgeType: namedArgs.ktype,
        };
        const conv = context.podcast ?? context.images;
        const dateRange = kp.getTimeRangeForConversation(conv);
        if (dateRange) {
            let startDate;
            let endDate;
            // Did they provide an explicit date range?
            if (namedArgs.startDate || namedArgs.endDate) {
                startDate = argToDate(namedArgs.startDate) ?? dateRange.start;
                endDate = argToDate(namedArgs.endDate) ?? dateRange.end;
            }
            else {
                // They may have provided a relative date range
                if (namedArgs.startMinute >= 0) {
                    startDate = dateTime.addMinutesToDate(dateRange.start, namedArgs.startMinute);
                }
                if (namedArgs.endMinute > 0) {
                    endDate = dateTime.addMinutesToDate(dateRange.start, namedArgs.endMinute);
                }
            }
            if (startDate) {
                filter.dateRange = {
                    start: startDate,
                    end: endDate,
                };
            }
        }
        return filter;
    }
    function entitiesDef() {
        return searchTermsDef("Search entities in current conversation", "entity");
    }
    commands.kpEntities.metadata = entitiesDef();
    async function entities(args) {
        const conversation = ensureConversationLoaded();
        if (!conversation) {
            return;
        }
        if (args.length > 0) {
            args.push("--ktype");
            args.push("entity");
            await searchTerms(args);
        }
        else {
            if (conversation.semanticRefs !== undefined) {
                const entities = conversation.semanticRefs?.filter((sr) => sr.knowledgeType === "entity");
                context.printer.writeSemanticRefs(entities);
            }
        }
    }
    function podcastBuildIndexDef() {
        return {
            description: "Build index",
            options: {
                maxMessages: argNum("Maximum messages to index"),
                relatedOnly: argBool("Index related terms only", false),
            },
        };
    }
    commands.kpPodcastBuildIndex.metadata = podcastBuildIndexDef();
    async function podcastBuildIndex(args) {
        if (!context.podcast) {
            context.printer.writeError("No podcast loaded");
            return;
        }
        const messageCount = context.podcast.messages.length;
        if (messageCount === 0) {
            return;
        }
        const namedArgs = parseNamedArguments(args, podcastBuildIndexDef());
        // Build index
        context.printer.writeLine();
        const maxMessages = namedArgs.maxMessages ?? messageCount;
        context.printer.writeLine(`Building Index`);
        let progress = new ProgressBar(context.printer, maxMessages);
        const eventHandler = createIndexingEventHandler(context, progress, maxMessages);
        // Build full index?
        if (!namedArgs.relatedOnly) {
            const indexResult = await context.podcast.buildIndex(eventHandler);
            progress.complete();
            context.printer.writeIndexingResults(indexResult);
            return;
        }
        // Build partial index
        context.podcast.secondaryIndexes.termToRelatedTermsIndex.fuzzyIndex?.clear();
        await kp.buildRelatedTermsIndex(context.podcast, eventHandler);
        progress.complete();
    }
    function imageCollectionBuildIndexDef() {
        return {
            description: "Build image collection index",
            options: {
                knowledge: argBool("Index knowledge", false),
                related: argBool("Index related terms", false),
                maxMessages: argNum("Maximum messages to index"),
            },
        };
    }
    commands.kpImagesBuildIndex.metadata = imageCollectionBuildIndexDef();
    async function imagesBuildIndex(args) {
        if (!context.images) {
            context.printer.writeError("No image collection loaded");
            return;
        }
        const messageCount = context.images.messages.length;
        if (messageCount === 0) {
            return;
        }
        const namedArgs = parseNamedArguments(args, imageCollectionBuildIndexDef());
        // Build index
        context.printer.writeLine();
        context.printer.writeLine("Building index");
        const maxMessages = namedArgs.maxMessages ?? messageCount;
        let progress = new ProgressBar(context.printer, maxMessages);
        const indexResult = await context.images?.buildIndex(createIndexingEventHandler(context, progress, maxMessages));
        progress.complete();
        context.printer.writeIndexingResults(indexResult);
    }
    /*----------
      End COMMANDS
    ------------*/
    function ensureConversationLoaded() {
        if (context.conversation) {
            return context.conversation;
        }
        context.printer.writeError("No conversation loaded");
        return undefined;
    }
    const IndexFileSuffix = "_index.json";
    function sourcePathToIndexPath(sourcePath, indexFilePath) {
        return (indexFilePath ??
            addFileNameSuffixToPath(sourcePath, IndexFileSuffix));
    }
    function podcastNameToFilePath(podcastName) {
        return path.join(context.basePath, podcastName + IndexFileSuffix);
    }
}
export function parseQueryTerms(args) {
    const queryTerms = [];
    for (const arg of args) {
        let allTermStrings = splitTermValues(arg);
        if (allTermStrings.length > 0) {
            allTermStrings = allTermStrings.map((t) => t.toLowerCase());
            const queryTerm = {
                term: { text: allTermStrings[0] },
            };
            if (allTermStrings.length > 1) {
                queryTerm.relatedTerms = [];
                for (let i = 1; i < allTermStrings.length; ++i) {
                    queryTerm.relatedTerms.push({ text: allTermStrings[i] });
                }
            }
            queryTerms.push(queryTerm);
        }
    }
    return queryTerms;
}
function splitTermValues(term) {
    let allTermStrings = knowLib.split(term, ";", {
        trim: true,
        removeEmpty: true,
    });
    return allTermStrings;
}
function createIndexingEventHandler(context, progress, maxMessages) {
    let startedKnowledge = false;
    let startedRelated = false;
    return {
        onKnowledgeExtracted() {
            if (!startedKnowledge) {
                context.printer.writeLine("Indexing knowledge");
                startedKnowledge = true;
            }
            progress.advance();
            return progress.count < maxMessages;
        },
        onEmbeddingsCreated(sourceTexts, batch, batchStartAt) {
            if (!startedRelated) {
                progress.reset(sourceTexts.length);
                context.printer.writeLine(`Indexing ${sourceTexts.length} related terms`);
                startedRelated = true;
            }
            progress.advance(batch.length);
            return true;
        },
    };
}
//# sourceMappingURL=knowproMemory.js.map