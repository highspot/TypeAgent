// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getInteractiveIO, millisecondsToString, } from "interactive-app";
import chalk from "chalk";
import { ChalkWriter } from "./chalkWriter.js";
export class ChatPrinter extends ChalkWriter {
    constructor(io) {
        if (!io) {
            io = getInteractiveIO();
        }
        super(io);
    }
    writeTranslation(result) {
        this.writeLine();
        if (result.success) {
            this.writeJson(result.data);
        }
        else {
            this.writeError(result.message);
        }
        return this;
    }
    writeTitle(title) {
        if (title) {
            this.writeUnderline(title);
        }
        return this;
    }
    writeLog(value) {
        if (value) {
            this.writeLine(chalk.gray(value));
        }
        return this;
    }
    writeCompletionStats(stats) {
        this.writeInColor(chalk.gray, () => {
            this.writeLine(`Prompt tokens: ${stats.prompt_tokens}`);
            this.writeLine(`Completion tokens: ${stats.completion_tokens}`);
            this.writeLine(`Total tokens: ${stats.total_tokens}`);
        });
        return this;
    }
    writeIndexingStats(stats) {
        this.writeInColor(chalk.cyan, `Chars: ${stats.totalStats.charCount}`);
        this.writeInColor(chalk.green, `Time: ${millisecondsToString(stats.totalStats.timeMs, "m")}`);
        this.writeCompletionStats(stats.totalStats.tokenStats);
        return this;
    }
    writeProgress(curCount, total, label) {
        label = label ? label + " " : "";
        const text = `[${label}${curCount} / ${total}]`;
        this.writeInColor(chalk.gray, text);
        return this;
    }
}
//# sourceMappingURL=chatPrinter.js.map