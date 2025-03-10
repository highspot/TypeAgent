export interface StatsResult {
    request: string;
    actualActionName: string;
    precision?: number;
    recall?: number;
    rank: number;
    rankActualAction: number;
    scoreActualAction: number;
    top10Matches: {
        actionName: string;
        score: number;
    }[];
    meanScore: number;
    medianScore: number;
    stdDevScore: number;
}
export declare function loadActionData(filePath: string): Promise<any[]>;
export declare function generateStats(data: any[], threshold?: number): {
    request: any;
    actualActionName: any;
    rank: number;
    rankActualAction: number;
    scoreActualAction: number;
    top10Matches: {
        actionName: any;
        typeName: any;
        score: number;
    }[];
    meanScore: number;
    medianScore: number;
    stdDevScore: number;
}[];
export declare function printDetailedMarkdownTable(results: StatsResult[], statsfile: string, zerorankStatsFile?: string | undefined, actionSchemaComments?: Record<string, string> | undefined): void;
export declare function saveStatsToFile(stats: StatsResult[], filePath: string): void;
export type NameValue<T = string, N = string> = {
    name: N;
    value: T;
};
export declare function loadCommentsActionSchema(filePath: string): Record<string, string>;
export declare function processActionSchemaAndReqData(actionreqEmbeddingsFile: string, threshold: number | undefined, statsfile: string, zerorankStatsFile: string | undefined): Promise<void>;
export declare function processActionReqDataWithComments(schemaFilePath: string, actionreqEmbeddingsFile: string, threshold: number | undefined, statsfile: string, zerorankStatsFile: string | undefined): Promise<void>;
//# sourceMappingURL=genStats.d.ts.map