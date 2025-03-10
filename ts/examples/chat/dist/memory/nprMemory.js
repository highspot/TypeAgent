import { ProgressBar, arg, argBool, argNum, parseNamedArguments } from "interactive-app";
import { ensureDir, writeJsonFile } from "typeagent";
import * as kp from "knowpro";
import * as knowLib from "knowledge-processor";
import fs from "fs";
import chalk from "chalk";
import path from "path";
import { ChatPrinter } from "../chatPrinter.js";
import { getPodcastParticipants } from "./knowproMemory.js";
import { addFileNameSuffixToPath, argDestFile } from "./common.js";
export async function createNPRCommands(chatContext, commands) {
    const context = {
        knowledgeModel: chatContext.models.chatModel,
        basePath: "./data/testChat/npr",
        printer: new KnowProPrinter()
    };
    await ensureDir(context.basePath);
    commands.nprImport = nprImport;
    /*----------------
     * COMMANDS
     *---------------*/
    function nprImportDef() {
        return {
            description: "Create npr index",
            args: {
                filePath: arg("File path to npr chunks"),
            },
            options: {
                index: argBool("Build index", true),
                indexFilePath: arg("Output path for index file"),
                maxMessages: argNum("Maximum messages to index"),
            },
        };
    }
    commands.nprImport.metadata = nprImportDef();
    async function nprImport(args) {
        const namedArgs = parseNamedArguments(args, nprImportDef());
        if (!fs.existsSync(namedArgs.filePath)) {
            context.printer.writeError(`${namedArgs.filePath} not found`);
            return;
        }
        context.corpus = await kp.importPodcast(namedArgs.filePath);
        context.conversation = context.corpus;
        context.printer.writeLine("Imported npr:");
        context.printer.writePodcastInfo(context.corpus);
        const messageCount = context.corpus.messages.length;
        if (messageCount === 0 || !namedArgs.index) {
            return;
        }
        if (!namedArgs.index) {
            return;
        }
        // Build index
        context.printer.writeLine();
        context.printer.writeLine("Building index");
        const maxMessages = namedArgs.maxMessages ?? messageCount;
        let progress = new ProgressBar(context.printer, maxMessages);
        const indexResult = await context.corpus.buildIndex((text, result) => {
            progress.advance();
            if (!result.success) {
                context.printer.writeError(`${result.message}\n${text}`);
            }
            return progress.count < maxMessages;
        });
        progress.complete();
        context.printer.writeLine(`Indexed ${maxMessages} items`);
        context.printer.writeIndexingResults(indexResult);
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
        if (!context.corpus) {
            context.printer.writeError("No podcast loaded");
            return;
        }
        context.printer.writeLine("Saving index");
        context.printer.writeLine(namedArgs.filePath);
        const cData = context.corpus.serialize();
        await ensureDir(path.dirname(namedArgs.filePath));
        await writeJsonFile(namedArgs.filePath, cData);
    }
    const IndexFileSuffix = "_index.json";
    function sourcePathToIndexPath(sourcePath, indexFilePath) {
        return (indexFilePath ??
            addFileNameSuffixToPath(sourcePath, IndexFileSuffix));
    }
}
class KnowProPrinter extends ChatPrinter {
    constructor() {
        super();
    }
    writeEntity(entity) {
        if (entity) {
            this.writeLine(entity.name.toUpperCase());
            this.writeList(entity.type, { type: "csv" });
            if (entity.facets) {
                const facetList = entity.facets.map((f) => knowLib.conversation.facetToString(f));
                this.writeList(facetList, { type: "ul" });
            }
        }
        return this;
    }
    writeSemanticRef(ref, score) {
        if (score) {
            this.writeInColor(chalk.greenBright, `[${score}]`);
        }
        switch (ref.knowledgeType) {
            default:
                this.writeLine(ref.knowledgeType);
                break;
            case "entity":
                this.writeEntity(ref.knowledge);
                break;
        }
        return this;
    }
    writeSemanticRefs(refs) {
        if (refs && refs.length > 0) {
            for (const ref of refs) {
                this.writeSemanticRef(ref);
                this.writeLine();
            }
        }
        return this;
    }
    writeConversationInfo(conversation) {
        this.writeTitle(conversation.nameTag);
        this.writeLine(`${conversation.messages.length} messages`);
        return this;
    }
    writePodcastInfo(podcast) {
        this.writeConversationInfo(podcast);
        this.writeList(getPodcastParticipants(podcast), {
            type: "csv",
            title: "Participants",
        });
    }
    writeIndexingResults(results, verbose = false) {
        if (results.failedMessages.length > 0) {
            this.writeError(`Errors for ${results.failedMessages.length} messages`);
            if (verbose) {
                for (const failedMessage of results.failedMessages) {
                    this.writeInColor(chalk.cyan, failedMessage.message.textChunks[0]);
                    this.writeError(failedMessage.error);
                }
            }
        }
    }
}
//# sourceMappingURL=nprMemory.js.map