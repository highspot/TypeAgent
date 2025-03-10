import { InteractiveIo } from "interactive-app";
import { ChatPrinter } from "../chatPrinter.js";
import { BreakPointSuggestions, Breakpoint, Bug, CodeAnswer, CodeDocumentation, CodeReview, LineDoc, LineReview, RelevantLine } from "code-processor";
export declare class CodePrinter extends ChatPrinter {
    constructor(io: InteractiveIo);
    writeCode(lines: string | string[]): void;
    writeCodeLines(lines: string[]): void;
    writeCodeLine(lineNumber: number, line: string): void;
    writeBug(bug: Bug): void;
    writeComment(comment: LineReview): void;
    writeBreakpoint(breakpoint: Breakpoint): void;
    writeRelevantLine(line: RelevantLine): void;
    writeDocLine(line: LineDoc): void;
    writeCodeReview(line: string, lineNumber: number, review: CodeReview): void;
    writeBreakpoints(line: string, lineNumber: number, review: BreakPointSuggestions): void;
    writeAnswer(line: string, lineNumber: number, answer: CodeAnswer): void;
    writeDocs(line: string, lineNumber: number, docs: CodeDocumentation): void;
    writeAllDocs(lines: string[], docs: CodeDocumentation): void;
    writeFullCodeReview(lines: string[], review: CodeReview, showTitle?: boolean): void;
    writeSourceLink(sourcePath: string | undefined): void;
    writeScore(score: number): void;
    writeTimestamp(timestamp?: Date): void;
}
//# sourceMappingURL=codePrinter.d.ts.map