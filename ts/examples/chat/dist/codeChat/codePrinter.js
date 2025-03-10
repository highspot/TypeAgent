// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ChatPrinter } from "../chatPrinter.js";
import chalk from "chalk";
import { pathToFileURL } from "url";
export class CodePrinter extends ChatPrinter {
    constructor(io) {
        super(io);
    }
    writeCode(lines) {
        if (typeof lines === "string") {
            this.writeInColor(chalk.cyanBright, lines);
        }
        else {
            this.writeCodeLines(lines);
        }
    }
    writeCodeLines(lines) {
        for (let i = 0; i < lines.length; ++i) {
            this.writeCodeLine(i + 1, lines[i]);
        }
    }
    writeCodeLine(lineNumber, line) {
        this.write(`${lineNumber} `);
        this.writeInColor(chalk.cyanBright, line);
    }
    writeBug(bug) {
        this.writeInColor(chalk.redBright, `⚠️ ${bug.severity}: ${bug.comment}`);
    }
    writeComment(comment) {
        this.writeInColor(chalk.white, `💬 ${comment.severity}: ${comment.comment}`);
    }
    writeBreakpoint(breakpoint) {
        this.writeInColor(chalk.redBright, `🛑 ${breakpoint.priority}: ${breakpoint.comment}`);
    }
    writeRelevantLine(line) {
        this.writeInColor(chalk.redBright, `💡 ${line.relevance}: ${line.comment}`);
    }
    writeDocLine(line) {
        this.writeInColor(chalk.greenBright, `✍🏼 ${line.comment}`);
    }
    writeCodeReview(line, lineNumber, review) {
        if (review.bugs) {
            const bug = review.bugs.find((b) => b.lineNumber === lineNumber);
            if (bug) {
                this.writeBug(bug);
            }
        }
        if (review.comments) {
            const comment = review.comments.find((c) => c.lineNumber === lineNumber);
            if (comment) {
                this.writeComment(comment);
            }
        }
    }
    writeBreakpoints(line, lineNumber, review) {
        if (review.breakPoints) {
            const breakpoint = review.breakPoints.find((b) => b.lineNumber === lineNumber);
            if (breakpoint) {
                this.writeBreakpoint(breakpoint);
            }
        }
    }
    writeAnswer(line, lineNumber, answer) {
        if (answer.answerLines) {
            const relevantLine = answer.answerLines.find((l) => l.lineNumber === lineNumber);
            if (relevantLine) {
                this.writeRelevantLine(relevantLine);
            }
        }
    }
    writeDocs(line, lineNumber, docs) {
        if (docs.comments) {
            const relevantLine = docs.comments.find((l) => l.lineNumber === lineNumber);
            if (relevantLine) {
                this.writeDocLine(relevantLine);
            }
        }
    }
    writeAllDocs(lines, docs) {
        for (let i = 0; i < lines.length; ++i) {
            this.writeDocs(lines[i], i + 1, docs);
            this.writeCodeLine(i + 1, lines[i]);
        }
    }
    writeFullCodeReview(lines, review, showTitle = true) {
        if (showTitle) {
            this.writeHeading("\nCODE REVIEW\n");
        }
        for (let i = 0; i < lines.length; ++i) {
            this.writeCodeReview(lines[i], i + 1, review);
            this.writeCodeLine(i + 1, lines[i]);
        }
    }
    writeSourceLink(sourcePath) {
        if (sourcePath) {
            this.writeInColor(chalk.blueBright, pathToFileURL(sourcePath).toString());
        }
    }
    writeScore(score) {
        this.writeInColor(chalk.green, `[${score}]`);
    }
    writeTimestamp(timestamp) {
        if (timestamp) {
            this.writeInColor(chalk.gray, timestamp.toString());
        }
    }
}
//# sourceMappingURL=codePrinter.js.map