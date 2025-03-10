import { openai } from "aiclient";
export type ItemIndexingStats = {
    name?: string | undefined;
    timeMs: number;
    charCount: number;
    tokenStats: openai.CompletionUsageStats;
};
export interface IndexingStats {
    totalStats: ItemIndexingStats;
    itemStats: ItemIndexingStats[];
    clear(): void;
    startItem(name?: string): void;
    updateCurrent(timeMs: number, charCount: number): void;
    updateCurrentTokenStats(stats: openai.CompletionUsageStats): void;
}
export declare function createIndexingStats(existingStats?: IndexingStats): IndexingStats;
/**
 * Load indexing stats from a file
 * @param statsFilePath
 * @param clean
 * @returns
 */
export declare function loadIndexingStats(statsFilePath: string, clean: boolean): Promise<IndexingStats>;
export declare function saveIndexingStats(stats: IndexingStats, statsFilePath: string, clean: boolean): Promise<void>;
//# sourceMappingURL=indexingStats.d.ts.map