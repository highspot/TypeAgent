// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "path";
import * as knowLib from "knowledge-processor";
import { conversation } from "knowledge-processor";
import { sqlite } from "memory-providers";
import { ReservedConversationNames, } from "./chatMemory.js";
import { createWorkQueueFolder, dateTime, ensureDir, isDirectoryPath, } from "typeagent";
import { arg, argBool, argNum, millisecondsToString, parseNamedArguments, StopWatch, } from "interactive-app";
import { argChunkSize, argClean, argConcurrency, argDestFile, argPause, argSourceFileOrFolder, createChatUx, getSearchQuestion, indexingStatsToCsv, pause, } from "./common.js";
import chalk from "chalk";
import { convertMsgFiles } from "./importer.js";
import fs from "fs";
import { error, success } from "typechat";
export async function createEmailMemory(models, storePath, settings, useSqlite = false, createNew = false) {
    const emailSettings = {
        ...settings,
    };
    if (models.embeddingModelSmall) {
        emailSettings.entityIndexSettings = {
            ...settings.indexSettings,
        };
        emailSettings.entityIndexSettings.embeddingModel =
            models.embeddingModelSmall;
        emailSettings.actionIndexSettings = {
            ...settings.indexSettings,
        };
        emailSettings.actionIndexSettings.embeddingModel =
            models.embeddingModelSmall;
    }
    const emailStorePath = path.join(storePath, ReservedConversationNames.outlook);
    await ensureDir(emailStorePath);
    const storage = useSqlite
        ? await sqlite.createStorageDb(emailStorePath, "outlook.db", createNew)
        : undefined;
    const memory = await knowLib.email.createEmailMemory(models.chatModel, models.answerModel, ReservedConversationNames.outlook, storePath, emailSettings, storage);
    memory.searchProcessor.answers.settings.chunking.enable = true;
    memory.searchProcessor.answers.settings.chunking.fastStop = true;
    memory.searchProcessor.answers.settings.maxCharsInContext = 4096 * 4; // 4096 tokens * 4 chars per token
    return memory;
}
export function createEmailCommands(context, commands) {
    commands.importEmail = importEmail;
    commands.emailConvertMsg = emailConvertMsg;
    commands.emailStats = emailStats;
    commands.emailFastStop = emailFastStop;
    commands.emailNameAlias = emailNameAlias;
    commands.emailActionItems = emailActionItems;
    commands.emailInteractiveSearch = emailInteractiveSearch;
    //--------
    // Commands
    //---------
    function importEmailDef() {
        return {
            description: "Import emails in a folder",
            args: {
                sourcePath: argSourceFileOrFolder(),
            },
            options: {
                concurrency: argConcurrency(1),
                clean: argClean(),
                chunkSize: argChunkSize(context.maxCharsPerChunk),
                maxMessages: argNum("Max messages", 25),
                pauseMs: argPause(),
            },
        };
    }
    commands.importEmail.metadata = importEmailDef();
    async function importEmail(args, io) {
        const namedArgs = parseNamedArguments(args, importEmailDef());
        let sourcePath = namedArgs.sourcePath;
        let isDir = isDirectoryPath(sourcePath);
        let isJson = sourcePath.endsWith("json");
        if (isDir) {
            await indexEmails(namedArgs, sourcePath);
        }
        else if (isJson) {
            if (!(await knowLib.email.addEmailFileToConversation(context.emailMemory, sourcePath, namedArgs.chunkSize))) {
                context.printer.writeLine(`Could not load ${sourcePath}`);
            }
        }
    }
    function emailConvertMsgDef() {
        return {
            description: "Convert msg files in a folder",
            args: {
                sourcePath: argSourceFileOrFolder(),
            },
        };
    }
    commands.emailConvertMsg.metadata = emailConvertMsgDef();
    async function emailConvertMsg(args, io) {
        const namedArgs = parseNamedArguments(args, emailConvertMsgDef());
        let sourcePath = namedArgs.sourcePath;
        /*
        let isDir = isDirectoryPath(sourcePath);
        if (isDir) {
            context.printer.writeInColor(
                chalk.cyan,
                "Converting message files",
            );
            await convertMsgFiles(sourcePath, io);
        }
            */
        context.printer.writeInColor(chalk.cyan, "Converting message files");
        await convertMsgFiles(sourcePath, io);
    }
    function emailStatsDef() {
        return {
            description: "Email indexing statistics",
            options: {
                destFile: argDestFile(),
                displayFull: argBool("Display full stats", false),
            },
        };
    }
    commands.emailStats.metadata = emailStatsDef();
    async function emailStats(args) {
        const namedArgs = parseNamedArguments(args, emailStatsDef());
        const stats = await loadStats(false);
        context.printer.writeBullet(`Email count: ${stats.itemStats.length}`);
        if (namedArgs.displayFull) {
            context.printer.writeBullet(`Total chars: ${stats.totalStats.charCount}`);
            context.printer.writeCompletionStats(stats.totalStats.tokenStats);
        }
        if (stats.itemStats && stats.itemStats) {
            const csv = indexingStatsToCsv(stats.itemStats);
            if (namedArgs.destFile) {
                await fs.promises.writeFile(namedArgs.destFile, csv);
            }
            else if (namedArgs.displayFull) {
                context.printer.writeLine(csv);
            }
        }
    }
    function emailFastStopDef() {
        return {
            description: "Enable or disable fast stopping during answer generation",
            options: {
                enable: argBool("Enable"),
            },
        };
    }
    commands.emailFastStop.metadata = emailFastStopDef();
    async function emailFastStop(args) {
        const chunkingSettings = context.emailMemory.searchProcessor.answers.settings.chunking;
        if (args.length > 0) {
            const namedArgs = parseNamedArguments(args, emailFastStopDef());
            chunkingSettings.fastStop = namedArgs.enable;
        }
        else {
            context.printer.writeLine(`Enabled ${chunkingSettings.fastStop ?? false}`);
        }
    }
    function emailNameAliasDef() {
        return {
            description: "Add an alias for a person's name",
            options: {
                name: arg("Person's name"),
                alias: arg("Alias"),
            },
        };
    }
    commands.emailNameAlias.metadata = emailNameAliasDef();
    async function emailNameAlias(args) {
        const namedArgs = parseNamedArguments(args, emailNameAliasDef());
        const aliases = (await context.emailMemory.conversation.getEntityIndex()).nameAliases;
        if (namedArgs.name && namedArgs.alias) {
            await aliases.addAlias(namedArgs.alias, namedArgs.name);
        }
        else if (namedArgs.alias) {
            const names = await aliases.getByAlias(namedArgs.alias);
            if (names) {
                context.printer.writeLines(names);
            }
        }
        else {
            for await (const entry of aliases.entries()) {
                context.printer.writeLine(entry.name);
                context.printer.writeList(entry.value, { type: "ul" });
            }
        }
    }
    function emailActionItemsDef() {
        return {
            description: "Display action items for person",
            args: {
                name: arg("Name of person"),
            },
            options: {
                verb: arg("Verb to look for"),
                period: arg("past | present | future"),
                showSnippet: argBool("Show message snippet", false),
                showMessages: argBool("Show source messages", true),
            },
        };
    }
    commands.emailActionItems.metadata = emailActionItemsDef();
    async function emailActionItems(args) {
        const namedArgs = parseNamedArguments(args, emailActionItemsDef());
        let tenses = [];
        if (namedArgs.period) {
            tenses.push(namedArgs.period);
        }
        else {
            tenses.push("past", "present", "future");
        }
        for (let tense of tenses) {
            const actionItems = await emailActionItemsFromConversation(context.emailMemory, namedArgs.name, namedArgs.verb, tense);
            if (actionItems) {
                context.printer.writeTitle(tense.toUpperCase() + " Actions");
                for (const actionItem of actionItems) {
                    context.printer.writeAction(actionItem.action);
                    if (namedArgs.showSnippet) {
                        context.printer.writeBlocks(chalk.gray, actionItem.sourceBlocks);
                    }
                    for (const source of actionItem.sourceBlocks) {
                        writeMessageLinks(source.sourceIds);
                    }
                    context.printer.writeLine();
                }
            }
        }
    }
    function emailQueryDef() {
        return {
            description: "Interactive querying",
            args: {
                query: arg("Query"),
            },
            options: {
                maxMessagesForAnswer: argNum("Max messages to generate answers from", 10),
                maxMessagesToMatch: argNum("Max messages to search for", 50),
            },
        };
    }
    commands.emailInteractiveSearch.metadata = emailQueryDef();
    async function emailInteractiveSearch(args, io) {
        const namedArgs = parseNamedArguments(args, emailQueryDef());
        const query = namedArgs.query;
        const ux = createChatUx(io, chalk.cyan);
        const searchProcessor = context.emailMemory.searchProcessor;
        const options = {
            maxMatches: 2,
            minScore: 0.8,
            maxMessages: namedArgs.maxMessagesToMatch,
            skipAnswerGeneration: true,
        };
        const result = await conversation.interactivelyProcessUserInput(ux, query, undefined, async (userInput, previousUserInputs) => {
            const searchResults = await searchProcessor.searchTermsV2(userInput, undefined, options, previousUserInputs);
            if (!searchResults) {
                return error("No search results");
            }
            context.printer.writeLine();
            context.printer.writeSearchQuestion(searchResults);
            context.printer.writeResultStats(searchResults?.response);
            context.printer.writeLine();
            return success(searchResults);
        }, async (userInput, previousUserInputs, value) => {
            const r = value;
            const messageCount = r.response?.messageIds?.length ?? 0;
            if (messageCount > namedArgs.maxMessagesForAnswer) {
                // Too many messages. Try to fine
                return {
                    retVal: success(r),
                    followUpMessageForUser: `${messageCount} messages matched. Recommend max is ${namedArgs.maxMessagesForAnswer}.\n` +
                        "Please provide additional input to refine the search, or hit return.",
                };
            }
            return {
                retVal: success(r),
            };
        });
        if (result?.success && result.data.response) {
            // Generate answers
            const answer = await context.emailMemory.searchProcessor.generateAnswerV2(getSearchQuestion(result.data), result.data, options);
            context.printer.writeLine();
            context.printer.writeSearchTermsResult(answer, false);
        }
    }
    //-------------
    // End commands
    //-------------
    async function indexEmails(namedArgs, sourcePath) {
        if (!sourcePath.endsWith("json")) {
            sourcePath = path.join(sourcePath, "json");
        }
        context.printer.writeInColor(chalk.cyan, "Adding emails to memory");
        if (namedArgs.clean) {
            await context.emailMemory.clear(true);
        }
        const queue = await createWorkQueueFolder(path.dirname(sourcePath), path.basename(sourcePath), getNamesOfNewestEmails);
        queue.onError = (err) => context.printer.writeError(err);
        context.stats = await loadStats(namedArgs.clean);
        let attempts = 1;
        const clock = new StopWatch();
        const maxAttempts = 2;
        let maxMessages = namedArgs.maxMessages;
        let grandTotal = context.stats.itemStats.length;
        while (attempts <= maxAttempts) {
            const successCount = await queue.drain(namedArgs.concurrency, async (filePath, index, total) => {
                context.printer.writeProgress(index + 1, total);
                let email = await knowLib.email.loadEmailFile(filePath);
                const emailLength = email.body.length;
                context.printer.writeLine(`${email.sourcePath}\n${emailLength} chars`);
                context.stats.startItem();
                clock.start();
                await knowLib.email.addEmailToConversation(context.emailMemory, email, namedArgs.chunkSize);
                clock.stop();
                context.stats.updateCurrent(clock.elapsedMs, emailLength);
                await saveStats();
                grandTotal++;
                const status = `[${clock.elapsedString()}, ${millisecondsToString(context.stats.totalStats.timeMs, "m")} for ${grandTotal} msgs.]`;
                context.printer.writeLine();
                context.printer.writeInColor(chalk.green, status);
                context.printer.writeLine();
                if (namedArgs.pauseMs > 0) {
                    await pause(namedArgs.pauseMs);
                }
            }, maxMessages);
            // Replay any errors
            if (!(await queue.requeueErrors())) {
                break;
            }
            if (maxMessages) {
                maxMessages -= successCount;
            }
            ++attempts;
            if (attempts <= maxAttempts) {
                context.printer.writeHeading("Retrying errors");
            }
        }
        context.printer.writeHeading("Indexing Stats");
        context.printer.writeIndexingStats(context.stats);
        context.stats = undefined;
    }
    async function loadStats(clean) {
        return knowLib.loadIndexingStats(getStatsFilePath(), clean);
    }
    async function saveStats() {
        if (context.stats) {
            await knowLib.saveIndexingStats(context.stats, getStatsFilePath(), false);
        }
    }
    function getStatsFilePath() {
        return path.join(context.statsPath, `${context.emailMemory.conversationName}_stats.json`);
    }
    async function getNamesOfNewestEmails(rootPath, fileNames) {
        let timestampedNames = [];
        for (const fileName of fileNames) {
            const filePath = path.join(rootPath, fileName);
            const email = await knowLib.email.loadEmailFile(filePath);
            if (email && email.sentOn) {
                const timestamp = dateTime.stringToDate(email.sentOn) ?? new Date();
                timestampedNames.push({ value: fileName, timestamp });
            }
        }
        timestampedNames.sort((x, y) => y.timestamp.getTime() - x.timestamp.getTime());
        return timestampedNames.map((t) => t.value);
    }
    function writeMessageLinks(sourceIds) {
        if (sourceIds) {
            for (const id of sourceIds) {
                context.printer.writeLink(id);
            }
        }
    }
}
export async function emailActionItemsFromConversation(cm, subject, action, timePeriod) {
    const actionIndex = await cm.conversation.getActionIndex();
    const filter = {
        filterType: "Action",
        subjectEntityName: subject,
    };
    if (action) {
        filter.verbFilter = { verbs: [action], verbTense: timePeriod };
    }
    const results = await actionIndex.search(filter, conversation.createActionSearchOptions(false));
    const actionIds = results.actionIds;
    if (!actionIds || actionIds.length === 0) {
        return undefined;
    }
    const actions = await actionIndex.getMultiple(actionIds);
    const messages = cm.conversation.messages;
    const actionItems = [];
    for (let i = 0; i < actions.length; ++i) {
        const action = actions[i];
        if (knowLib.email.isEmailVerb(action.value.verbs) ||
            (timePeriod && action.value.verbTense !== timePeriod)) {
            continue;
        }
        const sourceBlocks = await messages.getMultipleText(action.sourceIds);
        actionItems.push({ action: action.value, sourceBlocks });
    }
    return actionItems;
}
//# sourceMappingURL=emailMemory.js.map