/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import fs from "node:fs";
import { ActionConfigProvider } from "../../translation/actionConfigProvider.js";
import { JSONAction, RequestAction, CorrectionRecord, ExplanationDataEntry, HistoryContext, ExplanationData } from "agent-cache";
import { Limiter } from "common-utils";
export type ExplanationTestDataEntry<T extends object = object> = ExplanationDataEntry<T> & {
    corrections?: CorrectionRecord<T>[] | undefined;
    tags?: string[] | undefined;
};
export type ExplanationTestData<T extends object = object> = {
    version: number;
    schemaName: string;
    sourceHash: string;
    explainerName: string;
    entries: ExplanationTestDataEntry<T>[];
    failed?: FailedExplanationTestDataEntry<T>[] | undefined;
};
export type FailedExplanationTestDataEntry<T extends object = object> = {
    message: string;
    request: string;
    action?: JSONAction | JSONAction[] | undefined;
    history?: HistoryContext | undefined;
    explanation?: undefined;
    corrections?: CorrectionRecord<T>[] | undefined;
    tags?: string[] | undefined;
};
export declare function readLineData(file: fs.PathLike | fs.promises.FileHandle): Promise<string[]>;
export declare function getEmptyExplanationTestData(schemaName: string, sourceHash: string, explainerName: string): ExplanationTestData;
export declare function readExplanationTestData(file: fs.PathLike | fs.promises.FileHandle): Promise<ExplanationTestData>;
export type GenerateTestDataResult = {
    testData: ExplanationTestData;
    fileName: string | undefined;
    elapsedMs: number;
};
export type GenerateDataInput = {
    inputs: (string | RequestAction)[];
    existingData: ExplanationTestData;
    outputFile: string | undefined;
};
export declare function generateExplanationTestDataFiles(data: {
    inputs: (string | RequestAction)[];
    existingData: ExplanationTestData;
    outputFile: string | undefined;
}[], provider: ActionConfigProvider, incremental: boolean, concurrency?: Limiter | number, model?: string, overwrite?: boolean): Promise<GenerateTestDataResult[]>;
export declare function printExplanationTestDataStats(results: GenerateTestDataResult[], prefix?: string): void;
export declare function convertTestDataToExplanationData(testData: ExplanationTestData, outputFile?: string): ExplanationData;
//# sourceMappingURL=explanationTestData.d.ts.map