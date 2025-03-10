import { ChatModel } from "aiclient";
import { CodeReview, BreakPointSuggestions } from "./codeReviewSchema.js";
import { CodeBlock, Module } from "./code.js";
import { CodeAnswer } from "./codeAnswerSchema.js";
import { CodeDocumentation } from "./codeDocSchema.js";
/**
 * A code reviewer
 */
export interface CodeReviewer {
    readonly model: ChatModel;
    review(
        codeToReview: string | string[],
        module?: Module[],
    ): Promise<CodeReview>;
    debug(
        observation: string,
        codeToReview: string | string[],
        module?: Module[],
    ): Promise<CodeReview>;
    breakpoints(
        observation: string,
        codeToReview: string | string[],
        module?: Module[],
    ): Promise<BreakPointSuggestions>;
    answer(
        question: string,
        codeToReview: string | string[],
        language?: string,
    ): Promise<CodeAnswer>;
    document(code: CodeBlock, facets?: string): Promise<CodeDocumentation>;
}
export declare function createCodeReviewer(
    model?: ChatModel | undefined,
): CodeReviewer;
//# sourceMappingURL=codeReviewer.d.ts.map
