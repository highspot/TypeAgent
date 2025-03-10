/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import fs from "node:fs";
import { ActionConfigProvider } from "../../translation/agentTranslators.js";
import { JSONAction, RequestAction, CorrectionRecord, ExplanationDataEntry, HistoryContext, ExplanationData } from "agent-cache";
import { Limiter } from "common-utils";
export type TestDataEntry<T extends object = object> = ExplanationDataEntry<T> & {
    corrections?: CorrectionRecord<T>[] | undefined;
    tags?: string[] | undefined;
};
export type TestData<T extends object = object> = {
    version: number;
    schemaName: string;
    sourceHash: string;
    explainerName: string;
    entries: TestDataEntry<T>[];
    failed?: FailedTestDataEntry<T>[] | undefined;
};
export type FailedTestDataEntry<T extends object = object> = {
    message: string;
    request: string;
    action?: JSONAction | JSONAction[] | undefined;
    history?: HistoryContext | undefined;
    explanation?: undefined;
    corrections?: CorrectionRecord<T>[] | undefined;
    tags?: string[] | undefined;
};
export declare function readLineData(file: fs.PathLike | fs.promises.FileHandle): Promise<string[]>;
export declare function getEmptyTestData(schemaName: string, sourceHash: string, explainerName: string): TestData;
export declare function readTestData(file: fs.PathLike | fs.promises.FileHandle): Promise<TestData>;
export type GenerateTestDataResult = {
    testData: TestData;
    fileName: string | undefined;
    elapsedMs: number;
};
export type GenerateDataInput = {
    inputs: (string | RequestAction)[];
    existingData: TestData;
    outputFile: string | undefined;
};
export declare function generateTestDataFiles(data: {
    inputs: (string | RequestAction)[];
    existingData: TestData;
    outputFile: string | undefined;
}[], provider: ActionConfigProvider, incremental: boolean, concurrency?: Limiter | number, model?: string, overwrite?: boolean): Promise<GenerateTestDataResult[]>;
export declare function printTestDataStats(results: GenerateTestDataResult[], prefix?: string): void;
export declare function convertTestDataToExplanationData(testData: TestData, outputFile?: string): ExplanationData;
//# sourceMappingURL=testData.d.ts.map