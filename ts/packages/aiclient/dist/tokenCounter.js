"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenCounter = void 0;
const debug_1 = __importDefault(require("debug"));
const debugTokens = (0, debug_1.default)("typeagent:tokenCounter");
function initTokenStats() {
    return {
        max: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
        total: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
        count: 0,
    };
}
function updateStats(data, tokens) {
    data.total.completion_tokens += tokens.completion_tokens;
    data.total.prompt_tokens += tokens.prompt_tokens;
    data.total.total_tokens += tokens.total_tokens;
    data.count++;
    data.max.completion_tokens = Math.max(data.max.completion_tokens, tokens.completion_tokens);
    data.max.prompt_tokens = Math.max(data.max.prompt_tokens, tokens.prompt_tokens);
    data.max.total_tokens = Math.max(data.max.total_tokens, tokens.total_tokens);
}
/**
 *  Token counter for LLM calls.
 *  Counter has total counts and counts grouped by tags
 *  along with other stats like max, min, average, etc.
 */
class TokenCounter {
    constructor() {
        this._counters = new Map();
        this.all = initTokenStats();
    }
    /**
     * Counts the supplied totken counts
     * @param tokens - the tokens to count
     * @param tags - the tags to which the tokens apply (if any)
     */
    add(tokens, tags) {
        // bump the totals
        updateStats(this.all, tokens);
        // bump the counts for the supplied tags
        tags?.map((t) => {
            let data = this._counters.get(t);
            if (data === undefined) {
                data = initTokenStats();
                this._counters.set(t, data);
            }
            updateStats(data, tokens);
        });
        debugTokens("Token Increment: " + JSON.stringify(tokens));
        debugTokens("Token Odometer: " +
            JSON.stringify(this.all.total) +
            "\nAverage Tokens per call: " +
            (this.all.total.total_tokens / this.all.count).toFixed(0));
    }
    toJSON() {
        return {
            counters: Object.fromEntries(this._counters.entries()),
            all: this.all,
        };
    }
    static fromJSON(json) {
        const counter = new TokenCounter();
        if (json.numSamples !== undefined) {
            // old format, ignore
            return counter;
        }
        counter.all = json.all;
        counter._counters = new Map(Object.entries(json.counters));
        return counter;
    }
    /**
     * Gets the # of tokens for the supplied tag.
     * @param tag The tag for which to get the token counts
     * @returns The token usage stats
     */
    getTokenUsage(tag) {
        return this._counters.get(tag);
    }
    /**
     * Sets the token counter to a specific state (i.e. continuing from a previously stored state)
     * @param data the token counter data to load
     */
    static load(data) {
        if (data.numSamples !== undefined) {
            // old format, ignore
            return;
        }
        this.instance = TokenCounter.fromJSON(data);
    }
    get total() {
        return {
            completion_tokens: this.all.total.completion_tokens,
            prompt_tokens: this.all.total.prompt_tokens,
            total_tokens: this.all.total.total_tokens,
        };
    }
    get average() {
        return {
            completion_tokens: this.all.total.completion_tokens / this.all.count,
            prompt_tokens: this.all.total.prompt_tokens / this.all.count,
            total_tokens: this.all.total.total_tokens / this.all.count,
        };
    }
    get maximum() {
        return {
            completion_tokens: this.all.max.completion_tokens,
            prompt_tokens: this.all.max.prompt_tokens,
            total_tokens: this.all.max.total_tokens,
        };
    }
    get counters() {
        return this._counters;
    }
}
exports.TokenCounter = TokenCounter;
// TODO: intermittently cache these with the session
TokenCounter.getInstance = () => {
    if (!TokenCounter.instance) {
        TokenCounter.instance = new TokenCounter();
    }
    return TokenCounter.instance;
};
//# sourceMappingURL=tokenCounter.js.map