// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { readJsonFile, removeFile, writeJsonFile } from "typeagent";
export function createIndexingStats(existingStats) {
    let current;
    const indexingStats = {
        totalStats: existingStats?.totalStats ?? emptyStats(),
        itemStats: existingStats?.itemStats ?? [],
        startItem,
        updateCurrent,
        updateCurrentTokenStats,
        clear,
    };
    return indexingStats;
    function startItem(name) {
        current = emptyStats();
        current.name = name;
        indexingStats.itemStats.push(current);
    }
    function updateCurrent(timeMs, charCount) {
        const totalStats = indexingStats.totalStats;
        totalStats.timeMs += timeMs;
        totalStats.charCount += charCount;
        if (current) {
            current.timeMs = timeMs;
            current.charCount = charCount;
        }
    }
    function updateCurrentTokenStats(stats) {
        const totalStats = indexingStats.totalStats;
        totalStats.tokenStats.completion_tokens += stats.completion_tokens;
        totalStats.tokenStats.prompt_tokens += stats.prompt_tokens;
        totalStats.tokenStats.total_tokens += stats.total_tokens;
        if (current) {
            current.tokenStats.prompt_tokens += stats.prompt_tokens;
            current.tokenStats.completion_tokens += stats.completion_tokens;
            current.tokenStats.total_tokens += stats.total_tokens;
        }
    }
    function clear() {
        indexingStats.totalStats = emptyStats();
        indexingStats.itemStats = [];
    }
    function emptyStats() {
        return {
            timeMs: 0,
            charCount: 0,
            tokenStats: emptyTokenStats(),
        };
    }
    function emptyTokenStats() {
        return {
            completion_tokens: 0,
            prompt_tokens: 0,
            total_tokens: 0,
        };
    }
}
/**
 * Load indexing stats from a file
 * @param statsFilePath
 * @param clean
 * @returns
 */
export async function loadIndexingStats(statsFilePath, clean) {
    let stats;
    if (clean) {
        await removeFile(statsFilePath);
    }
    else {
        stats = await readJsonFile(statsFilePath);
    }
    return createIndexingStats(stats);
}
export async function saveIndexingStats(stats, statsFilePath, clean) {
    if (clean) {
        await removeFile(statsFilePath);
    }
    await writeJsonFile(statsFilePath, stats);
}
//# sourceMappingURL=indexingStats.js.map