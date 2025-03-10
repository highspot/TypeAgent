export type Severity = "S1" | "S2" | "S3";
export type LineReview = {
    lineNumber: number;
    comment: string;
    severity: Severity;
};
export type Bug = {
    lineNumber: number;
    comment: string;
    severity: Severity;
};
export type Breakpoint = {
    lineNumber: number;
    comment: string;
    priority: "P1" | "P2" | "P3";
};
export type CodeReview = {
    comments?: LineReview[];
    bugs?: Bug[];
};
export type BreakPointSuggestions = {
    breakPoints: Breakpoint[];
};
//# sourceMappingURL=codeReviewSchema.d.ts.map
