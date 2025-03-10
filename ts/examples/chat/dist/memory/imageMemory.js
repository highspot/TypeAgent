// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { parseNamedArguments, StopWatch, } from "interactive-app";
import { ReservedConversationNames, } from "./chatMemory.js";
import { argDestFile, argSourceFileOrFolder, argSourceFolder, } from "./common.js";
import { ensureDir, isDirectoryPath } from "typeagent";
import fs from "node:fs";
import * as knowLib from "knowledge-processor";
import path from "node:path";
import { sqlite } from "memory-providers";
import { isImageFileType } from "common-utils";
import { TokenCounter } from "aiclient";
export async function createImageMemory(models, storePath, settings, useSqlite = false, createNew = false) {
    const imageSettings = {
        ...settings,
    };
    if (models.embeddingModelSmall) {
        imageSettings.entityIndexSettings = {
            ...settings.indexSettings,
        };
        imageSettings.entityIndexSettings.embeddingModel =
            models.embeddingModelSmall;
        imageSettings.actionIndexSettings = {
            ...settings.indexSettings,
        };
        imageSettings.actionIndexSettings.embeddingModel =
            models.embeddingModelSmall;
    }
    const imageStorePath = path.join(storePath, ReservedConversationNames.images);
    await ensureDir(imageStorePath);
    const storage = useSqlite
        ? await sqlite.createStorageDb(imageStorePath, "images.db", createNew)
        : undefined;
    const memory = await knowLib.image.createImageMemory(models.chatModel, models.answerModel, ReservedConversationNames.images, storePath, imageSettings, storage);
    memory.searchProcessor.answers.settings.chunking.fastStop = true;
    return memory;
}
export function argPause(defaultValue = 0) {
    return {
        type: "number",
        defaultValue,
        description: "Pause for given milliseconds after each iteration",
    };
}
export function importImageDef() {
    return {
        description: "Imports an image or set of images in a folder",
        args: {
            sourcePath: argSourceFileOrFolder(),
        },
        options: {
            pauseMs: argPause(),
        },
    };
}
export function buildImageCountHistogramDef() {
    return {
        description: "Builds a time series histogram from images in the supplied folder",
        args: {
            sourcePath: argSourceFolder(),
        },
        options: {
            destPath: argDestFile(),
        },
    };
}
export function createImageCommands(context, commands) {
    commands.importImage = importImage;
    commands.importImage.metadata = importImageDef();
    commands.buildImageCountHistogram = buildImageCountHistogram;
    commands.buildImageCountHistogram.metadata = buildImageCountHistogramDef();
    async function importImage(args, io) {
        const namedArgs = parseNamedArguments(args, importImageDef());
        let sourcePath = namedArgs.sourcePath;
        let isDir = isDirectoryPath(sourcePath);
        if (!fs.existsSync(sourcePath)) {
            console.log(`The supplied file or folder '${sourcePath}' does not exist.`);
            return;
        }
        const clock = new StopWatch();
        const tokenCountStart = TokenCounter.getInstance().total;
        if (isDir) {
            await indexImages(sourcePath, namedArgs.value("cachePath", "string", false), context, clock);
        }
        else {
            await indexImage(sourcePath, namedArgs.value("cachePath", "string", false), context);
        }
        const tokenCountFinish = TokenCounter.getInstance().total;
        clock.stop();
        console.log(`Total Duration: ${clock.elapsedSeconds} seconds`);
        console.log(`Prompt Token Consupmtion: ${tokenCountFinish.prompt_tokens - tokenCountStart.prompt_tokens}`);
        console.log(`Completion Token Consupmtion: ${tokenCountFinish.completion_tokens - tokenCountStart.completion_tokens}`);
        console.log(`Total Tokens: ${tokenCountFinish.total_tokens - tokenCountStart.total_tokens}`);
    }
    async function buildImageCountHistogram(args, io) {
        const namedArgs = parseNamedArguments(args, importImageDef());
        let sourcePath = namedArgs.sourcePath;
        knowLib.image.buildImageCountHistogram(sourcePath);
    }
    async function indexImages(sourcePath, cachePath, context, clock) {
        // load files from directory
        const fileNames = await fs.promises.readdir(sourcePath, {
            recursive: true,
        });
        // index each image
        for (let i = 0; i < fileNames.length; i++) {
            const fullFilePath = path.join(sourcePath, fileNames[i]);
            console.log(`${fullFilePath} [${i + 1} of ${fileNames.length}] (estimated time remaining: ${(clock.elapsedSeconds / (i + 1)) * (fileNames.length - i)})`);
            await indexImage(fullFilePath, cachePath, context);
        }
    }
    async function indexImage(fileName, cachePath, context) {
        if (!fs.existsSync(fileName)) {
            console.log(`Could not find part of the file path '${fileName}'`);
            return;
        }
        else if (!isImageFileType(path.extname(fileName))) {
            console.log(`Skipping '${fileName}', not a known image file.`);
            return;
        }
        // load the image
        const image = await knowLib.image.loadImage(fileName, context.models.chatModel, true, cachePath);
        if (image) {
            await knowLib.image.addImageToConversation(context.imageMemory, image, context.maxCharsPerChunk, context.conversationManager.knowledgeExtractor);
        }
    }
}
//# sourceMappingURL=imageMemory.js.map