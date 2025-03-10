// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { runExe, StopWatch } from "interactive-app";
import { loadIndexingStats, saveIndexingStats, } from "knowledge-processor";
import { dateTime, getAbsolutePath } from "typeagent";
export function* timestampBlocks(blocks, startDate, minMsOffset, maxMsOffset) {
    const timestampGenerator = dateTime.generateRandomDates(startDate, minMsOffset, maxMsOffset);
    for (let value of blocks) {
        const timestamp = timestampGenerator.next().value;
        yield {
            timestamp,
            value,
        };
    }
}
export async function convertMsgFiles(sourcePath, io) {
    await runExe(getAbsolutePath(`../../../../../dotnet/email/bin/Debug/net8.0-windows7.0/outlookEmail.exe`, import.meta.url), [sourcePath], io);
}
export async function runImportQueue(queue, statsFilePath, clean, maxItems, pauseMs, printer, itemProcessor) {
    queue.onError = (err) => printer.writeError(err);
    let attempts = 1;
    const timing = new StopWatch();
    const maxAttempts = 2;
    let stats = await loadIndexingStats(statsFilePath, clean);
    let grandTotal = stats.itemStats.length;
    while (attempts <= maxAttempts) {
        const successCount = await queue.drain(1, async (filePath, index, total) => {
            printer.writeProgress(index + 1, total);
            stats.startItem();
            timing.start();
            const itemCharCount = await itemProcessor(filePath, index, total);
            timing.stop();
            stats.updateCurrent(timing.elapsedMs, itemCharCount);
            await saveIndexingStats(stats, statsFilePath, clean);
            grandTotal++;
            printer.writeLine();
            printer.writeIndexingMetrics(stats, grandTotal, timing);
            printer.writeLine();
        }, maxItems, pauseMs);
        // Replay any errors
        if (!(await queue.requeueErrors())) {
            break;
        }
        if (maxItems) {
            maxItems -= successCount;
        }
        ++attempts;
        if (attempts <= maxAttempts) {
            printer.writeHeading("Retrying errors");
        }
    }
    printer.writeHeading("Indexing Stats");
    printer.writeIndexingStats(stats);
}
//# sourceMappingURL=importer.js.map