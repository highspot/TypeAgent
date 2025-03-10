// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "path";
import { asyncArray, getFileName, readAllLines, readJsonFile, stringSimilarity, writeJsonFile, } from "typeagent";
export async function searchBatchFile(cm, filePath, destPath, concurrency, progress) {
    if (!destPath) {
        destPath = path.join(path.dirname(filePath), `${getFileName(filePath)}_result.json`);
    }
    let lines = await readAllLines(filePath, undefined, true, true);
    let results = await searchBatch(cm, lines, concurrency, progress);
    await writeJsonFile(destPath, results);
}
export async function searchBatch(cm, queries, concurrency, progress) {
    let results = await asyncArray.mapAsync(queries, concurrency, async (query, index) => {
        const rr = await cm.search(query);
        return { query, answer: rr?.response?.answer };
    }, progress
        ? (item, index, answer) => progress(item, index, queries.length, answer)
        : undefined);
    return results;
}
export async function compareQueryBatchFile(cm, model, filePath, concurrency, progress) {
    const baseLine = await readJsonFile(filePath);
    if (!baseLine || baseLine.length === 0) {
        return [];
    }
    const queries = baseLine.map((qa) => qa.query);
    const results = await searchBatch(cm, queries, concurrency, progress);
    return compareQueryBatch(model, baseLine, results, concurrency, progress);
}
export async function compareQueryBatch(model, baseLine, results, concurrency, progress) {
    let comparisons = await asyncArray.mapAsync(baseLine, concurrency, async (item, index) => {
        const similarity = await compareAnswers(model, item.answer, results[index].answer);
        if (progress) {
            progress(baseLine[index].query, index, baseLine.length, results[index]);
        }
        return {
            baseLine: item,
            answer: results[index].answer,
            similarity,
        };
    });
    return comparisons;
}
export async function compareAnswers(model, baseLine, answer) {
    if (baseLine && answer) {
        if (baseLine.type !== answer.type) {
            return 0;
        }
        switch (baseLine.type) {
            default:
                break;
            case "Answered":
                return stringSimilarity(model, baseLine.answer, answer.answer);
            case "NoAnswer":
                return stringSimilarity(model, baseLine.whyNoAnswer, answer.whyNoAnswer);
        }
    }
    else if (baseLine === undefined && answer === undefined) {
        return 1.0;
    }
    return 0;
}
//# sourceMappingURL=testData.js.map