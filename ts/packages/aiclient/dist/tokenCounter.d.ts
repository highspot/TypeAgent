import { CompletionUsageStats } from "./openai.js";
type TokenStats = {
    max: CompletionUsageStats;
    total: CompletionUsageStats;
    count: number;
};
export type TokenCounterData = {
    counters: Record<string, TokenStats>;
    all: TokenStats;
};
/**
 *  Token counter for LLM calls.
 *  Counter has total counts and counts grouped by tags
 *  along with other stats like max, min, average, etc.
 */
export declare class TokenCounter {
    private static instance;
    private _counters;
    private all;
    static getInstance: () => TokenCounter;
    /**
     * Counts the supplied totken counts
     * @param tokens - the tokens to count
     * @param tags - the tags to which the tokens apply (if any)
     */
    add(tokens: CompletionUsageStats, tags?: string[]): void;
    toJSON(): TokenCounterData;
    private static fromJSON;
    /**
     * Gets the # of tokens for the supplied tag.
     * @param tag The tag for which to get the token counts
     * @returns The token usage stats
     */
    getTokenUsage(tag: string): TokenStats | undefined;
    /**
     * Sets the token counter to a specific state (i.e. continuing from a previously stored state)
     * @param data the token counter data to load
     */
    static load(data: TokenCounterData): void;
    get total(): CompletionUsageStats;
    get average(): CompletionUsageStats;
    get maximum(): CompletionUsageStats;
    get counters(): Map<string, TokenStats>;
}
export {};
//# sourceMappingURL=tokenCounter.d.ts.map