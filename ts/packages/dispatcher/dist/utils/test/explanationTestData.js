// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { loadAgentJsonTranslator, } from "../../translation/agentTranslators.js";
import { RequestAction, toJsonActions, createExecutableAction, } from "agent-cache";
import { getElapsedString, createLimiter } from "common-utils";
import { getCacheFactory } from "../cacheFactory.js";
import { isMultipleAction, isPendingRequest, } from "../../translation/multipleActionSchema.js";
import { DispatcherName } from "../../context/dispatcher/dispatcherUtils.js";
const testDataJSONVersion = 2;
// Read a text file and split it into an array of lines.
export async function readLineData(file) {
    const data = (await fs.promises.readFile(file, "utf8"))
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    return Array.from(new Set(data).keys());
}
export function getEmptyExplanationTestData(schemaName, sourceHash, explainerName) {
    return {
        version: testDataJSONVersion,
        schemaName,
        sourceHash,
        explainerName,
        entries: [],
    };
}
export async function readExplanationTestData(file) {
    const mayBeTestData = JSON.parse(await fs.promises.readFile(file, "utf8"));
    if (mayBeTestData.schemaName === undefined ||
        mayBeTestData.explainerName === undefined ||
        mayBeTestData.entries === undefined) {
        throw new Error(`'${file}' is not a test data file.`);
    }
    if (mayBeTestData.version === undefined) {
        // Patch the unknown format to version 2.
        const schemaName = mayBeTestData.schemaName;
        const patchEntry = (entry) => {
            if (entry.action !== undefined) {
                entry.action.fullActionName = `${schemaName}.${entry.action.actionName}`;
                delete entry.action.actionName;
            }
        };
        mayBeTestData.version = testDataJSONVersion;
        mayBeTestData.entries.forEach(patchEntry);
        mayBeTestData.failed?.forEach(patchEntry);
        return mayBeTestData;
    }
    if (mayBeTestData.version !== testDataJSONVersion) {
        throw new Error(`Test data file '${file}' has unknown version ${mayBeTestData.version}.`);
    }
    return mayBeTestData;
}
function getInitialTestData(inputs, existingData, overwrite, outputFile, prefix) {
    const tagsMap = new Map();
    const entries = new Map();
    const failedEntries = new Map();
    const addTags = (request, tags) => {
        if (tags) {
            const existingTags = tagsMap.get(request);
            if (existingTags) {
                existingTags.push(...tags);
            }
            else {
                tagsMap.set(request, [...tags]);
            }
        }
    };
    let duplicates = 0;
    let skip = 0;
    let add = 0;
    existingData.entries.forEach((e) => {
        // Collect the tags for all of them
        addTags(e.request, e.tags);
        // Prefer the first one if there are duplicates.
        if (!entries.has(e.request)) {
            entries.set(e.request, e);
        }
        else {
            duplicates++;
        }
    });
    existingData.failed?.forEach((e) => {
        // Collect the tags for all of them.
        addTags(e.request, e.tags);
        // Prefer the successful or the first failed one if there are duplicates.
        if (!entries.has(e.request) && !failedEntries.has(e.request)) {
            failedEntries.set(e.request, e);
        }
        else {
            duplicates++;
        }
    });
    const pending = new Map();
    for (const input of inputs) {
        const { request, actions, history } = typeof input === "string"
            ? { request: input, actions: undefined, history: undefined }
            : input;
        if (!overwrite) {
            if (entries.has(request) || failedEntries.has(request)) {
                // Skip if it already exists.
                skip++;
                continue;
            }
        }
        const exists = entries.delete(request);
        if (!failedEntries.delete(request) && !exists) {
            add++;
        }
        pending.set(request, {
            request,
            actions,
            history,
            tags: tagsMap.get(request),
        });
    }
    const testData = {
        version: testDataJSONVersion,
        schemaName: existingData.schemaName,
        sourceHash: existingData.sourceHash,
        explainerName: existingData.explainerName,
        entries: Array.from(entries.values()),
        failed: Array.from(failedEntries.values()),
    };
    return {
        testData,
        pending,
        outputFile,
        prefix,
        add,
        skip,
        duplicates,
    };
}
async function saveTestDataFile(file, testData, pending) {
    const saveData = { ...testData };
    if (pending.size > 0) {
        saveData.failed = (saveData.failed ?? []).concat(Array.from(pending.values()).map((e) => {
            return {
                request: e.request,
                action: e.actions ? toJsonActions(e.actions) : undefined,
                message: "Not processed",
            };
        }));
    }
    // sort the data so that it can be diffed easily
    saveData.entries.sort((a, b) => a.request.localeCompare(b.request));
    if (saveData.failed) {
        if (saveData.failed.length > 0) {
            saveData.failed.sort((a, b) => a.request.localeCompare(b.request));
        }
        else {
            saveData.failed = undefined;
        }
    }
    await fs.promises.writeFile(file, JSON.stringify(saveData, undefined, 2));
}
function toExceptionMessage(e) {
    const suffix = e.cause
        ? typeof e.cause === "string"
            ? e.cause
            : typeof e.cause === "object"
                ? e.cause.message
                : undefined
        : undefined;
    return `Exception: ${e.message}${suffix ? `: ${suffix}` : ""}`;
}
function getSafeTranslateFn(schemaName, provider, model) {
    const translator = loadAgentJsonTranslator([
        provider.getActionConfig(schemaName),
        provider.getActionConfig(DispatcherName), // make sure we have "unknown" action
    ], [], provider, false, // multiple
    true, // generated
    model);
    return async (request) => {
        try {
            return await translator.translate(request);
        }
        catch (e) {
            return { success: false, message: toExceptionMessage(e) };
        }
    };
}
function getSafeExplainFn(schemaNames, explainerName, model) {
    const explainer = getCacheFactory().getExplainer(schemaNames, explainerName, model);
    return async (requestAction) => {
        try {
            return await explainer.generate(requestAction);
        }
        catch (e) {
            return {
                success: false,
                message: toExceptionMessage(e),
            };
        }
    };
}
function getGenerateTestDataFn(schemaName, provider, explainerName, model) {
    const safeTranslate = getSafeTranslateFn(schemaName, provider, model);
    const safeExplain = getSafeExplainFn([schemaName], explainerName, model);
    return async (request, actions, history, tags) => {
        const startTime = performance.now();
        const toFailedResult = (entry) => {
            return {
                success: false,
                elapsedMs: performance.now() - startTime,
                entry,
            };
        };
        if (actions === undefined) {
            const result = await safeTranslate(request);
            if (!result.success) {
                return toFailedResult({
                    request,
                    message: `Failed translation: ${result.message}`,
                    tags,
                });
            }
            const translatedAction = result.data;
            if (isMultipleAction(translatedAction)) {
                const newActions = [];
                for (const e of translatedAction.parameters.requests) {
                    if (isPendingRequest(e)) {
                        return toFailedResult({
                            request,
                            message: "Failed translation: Pending action",
                            tags,
                        });
                    }
                    newActions.push(createExecutableAction(schemaName, e.action.actionName, e.action.parameters));
                }
                actions = newActions;
            }
            else {
                actions = [
                    createExecutableAction(schemaName, translatedAction.actionName, translatedAction.parameters),
                ];
            }
        }
        const requestAction = RequestAction.create(request, actions, history);
        for (const { action } of requestAction.actions) {
            if (action.actionName === "unknown") {
                return toFailedResult({
                    request,
                    message: "Failed translation: Unknown action",
                    tags,
                });
            }
        }
        const explanation = await safeExplain(requestAction);
        if (!explanation.success) {
            return toFailedResult({
                request,
                action: toJsonActions(requestAction.actions),
                message: `Failed Explanation: ${explanation.message}`,
                corrections: explanation.corrections,
                tags,
            });
        }
        return {
            success: true,
            elapsedMs: performance.now() - startTime,
            entry: {
                request,
                action: toJsonActions(requestAction.actions),
                explanation: explanation.data,
                corrections: explanation.corrections,
                tags,
            },
        };
    };
}
// If outputFile is provided, the generate data will be save per request.
export async function generateExplanationTestDataFiles(data, provider, incremental, concurrency = 1, model, overwrite = true) {
    const limit = typeof concurrency === "number"
        ? createLimiter(concurrency > 0 ? concurrency : 1)
        : concurrency;
    const initialData = data.map(({ inputs, existingData, outputFile }, index) => getInitialTestData(inputs, existingData, overwrite, outputFile, data.length === 1
        ? ""
        : `${(index + 1).toString().padStart(2)}> `));
    const total = initialData.reduce((acc, data) => acc + data.pending.size, 0);
    let curr = 0;
    const totalStr = total.toString();
    const done = () => {
        return `[${(++curr).toString().padStart(totalStr.length)}/${totalStr}]`;
    };
    const p = initialData.map((data) => generateTestDataFile(data, provider, incremental, limit, done, model));
    return await Promise.all(p);
}
async function generateTestDataFile(data, provider, incremental, limit, done, model) {
    const { testData, pending, outputFile, prefix } = data;
    const totalInput = pending.size;
    const total = testData.entries.length + (testData.failed?.length ?? 0) + pending.size;
    const generateTestData = getGenerateTestDataFn(testData.schemaName, provider, testData.explainerName, model);
    // Save the initial state for incremental processing.
    if (outputFile !== undefined && incremental) {
        await saveTestDataFile(outputFile, testData, pending);
    }
    const fullPrefix = `${prefix}[${testData.schemaName}|${testData.explainerName}]${outputFile ? ` ${chalk.cyanBright(path.relative("", outputFile))}` : ""}`;
    if (outputFile !== undefined) {
        const message = [];
        if (data.add) {
            message.push(`${data.add} added`);
        }
        if (data.duplicates) {
            message.push(`${data.duplicates} duplicate removed`);
        }
        if (data.skip) {
            message.push(`${data.skip} duplicate input skipped`);
        }
        console.log(`${fullPrefix}: Processing ${totalInput}/${total}${message.length ? ` (${message.join(", ")})` : ""}`);
    }
    // Process input
    let totalElapsedMs = 0;
    let failedCount = 0;
    let attemptsCount = 0;
    const processInput = async (pendingInput) => {
        const { success, elapsedMs, entry } = await generateTestData(pendingInput.request, pendingInput.actions, pendingInput.history, pendingInput.tags);
        const attempts = (entry.corrections?.length ?? 0) + 1;
        attemptsCount += attempts;
        totalElapsedMs += elapsedMs;
        const outputType = pendingInput.actions ? " explanation" : "";
        const statusPrefix = `${done()}${prefix}[${getElapsedString(elapsedMs, false).padStart(8)}]`;
        if (success) {
            testData.entries.push(entry);
            console.log(chalk.grey(`${statusPrefix} Generated${outputType}: ${entry.request}${attempts != 1 ? ` (+${attempts - 1} corrections)` : ""}`));
        }
        else {
            failedCount++;
            testData.failed = testData.failed ?? [];
            testData.failed.push(entry);
            console.log(chalk.yellow(`${statusPrefix} Error generating${outputType}: '${entry.request}': ${entry.message}`));
        }
        pending.delete(entry.request);
        if (outputFile !== undefined && incremental) {
            await saveTestDataFile(outputFile, testData, pending);
        }
    };
    const p = Array.from(pending.values()).map((pendingInput) => limit(() => processInput(pendingInput)));
    await Promise.all(p);
    // Save the result if it is not incrementally saved.
    if (outputFile !== undefined) {
        if (!incremental) {
            await saveTestDataFile(outputFile, testData, pending);
        }
    }
    // Report result
    const messages = [];
    const successCount = totalInput - failedCount;
    if (successCount !== 0) {
        messages.push(chalk.green(`${successCount} entries generated with ${attemptsCount} attempts (${(attemptsCount / successCount).toFixed(3)}).`));
    }
    if (failedCount !== 0) {
        messages.push(chalk.red(`${failedCount} failed.`));
    }
    if (messages.length) {
        console.log(`${fullPrefix}: Finished ${messages.join(", ")}`);
    }
    messages.length = 0;
    messages.push(chalk.green(`${testData.entries.length}/${total}`));
    const totalCorrection = testData.entries.reduce((acc, entry) => {
        acc += entry.corrections?.length ?? 0;
        return acc;
    }, 0) +
        (testData.failed?.reduce((acc, entry) => {
            acc += entry.corrections?.length ?? 0;
            return acc;
        }, 0) ?? 0);
    messages.push(`${totalCorrection} corrections (${(1 + totalCorrection / total).toFixed(3)}).`);
    const totalFailCount = testData.failed?.length ?? 0;
    if (totalFailCount !== 0) {
        messages.push(chalk.red(`${totalFailCount} (${((totalFailCount / total) * 100).toFixed(3)}%) failed.`));
    }
    console.log(`${fullPrefix}: Final stats ${messages.join(", ")}`);
    return { testData, fileName: outputFile, elapsedMs: totalElapsedMs };
}
export function printExplanationTestDataStats(results, prefix = "") {
    // Report total
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalAttempt = 0;
    let totalElapsedMs = 0;
    for (const result of results) {
        const data = result.testData;
        totalSuccess += data.entries.length;
        totalAttempt += data.entries.reduce((acc, entry) => {
            acc += (entry.corrections?.length ?? 0) + 1;
            return acc;
        }, 0);
        if (data.failed) {
            totalFailed += data.failed.length;
            totalAttempt += data.failed?.reduce((acc, entry) => {
                acc += (entry.corrections?.length ?? 0) + 1;
                return acc;
            }, 0);
        }
        totalElapsedMs += result.elapsedMs;
    }
    const totalEntries = totalSuccess + totalFailed;
    const failedStr = totalFailed !== 0
        ? chalk.red(` ${totalFailed} (${((totalFailed / totalEntries) * 100).toFixed(3)}%) failed.`)
        : "";
    console.log(`${prefix}Result: ${totalSuccess}/${totalEntries} entries, ${totalAttempt} attempts (${(totalAttempt / totalEntries).toFixed(3)}).${failedStr}`);
    if (totalElapsedMs !== 0) {
        console.log(`${prefix}Execution Time: ${getElapsedString(totalElapsedMs)}`);
    }
}
export function convertTestDataToExplanationData(testData, outputFile) {
    return {
        schemaNames: [testData.schemaName],
        sourceHashes: [testData.sourceHash],
        explainerName: testData.explainerName,
        entries: testData.entries,
        fileName: outputFile,
    };
}
//# sourceMappingURL=explanationTestData.js.map