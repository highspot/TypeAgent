// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as fs from "fs";
import chalk from "chalk";
import { similarity, SimilarityType } from "typeagent";
import { SchemaParser } from "action-schema";
import { distance } from "fastest-levenshtein";
export async function loadActionData(filePath) {
    const readStream = fs.createReadStream(filePath, { encoding: "utf8" });
    const results = [];
    let leftover = "";
    for await (const chunk of readStream) {
        const lines = (leftover + chunk).split("\n");
        leftover = lines.pop();
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const item = JSON.parse(line);
                    results.push({
                        ...item,
                        embedding: new Float32Array(item.embedding),
                        requests: item.requests.map((request) => ({
                            ...request,
                            embedding: new Float32Array(request.embedding),
                        })),
                    });
                }
                catch (error) {
                    console.error(`Error parsing line: ${line}`);
                    console.error(`Error details: ${error.message}`);
                }
            }
        }
    }
    if (leftover.trim()) {
        try {
            const item = JSON.parse(leftover);
            results.push({
                ...item,
                embedding: new Float32Array(item.embedding),
                requests: item.requests.map((request) => ({
                    ...request,
                    embedding: new Float32Array(request.embedding),
                })),
            });
        }
        catch (error) {
            console.error(`Error parsing leftover: ${leftover}`);
            console.error(`Error details: ${error.message}`);
        }
    }
    return results;
}
function calcMean(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function calcMedian(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}
function calcStdDeviation(values) {
    const mean = calcMean(values);
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    const avgSquaredDiff = calcMean(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
}
function calcLevenshteinSimilarity(request, action) {
    const maxLength = Math.max(request.length, action.length);
    if (maxLength === 0)
        return 1;
    const levenshteinDistance = distance(request.toLowerCase(), action.toLowerCase());
    return 1 - levenshteinDistance / maxLength;
}
export function generateStats(data, threshold = 0.7) {
    const allRequests = data.flatMap((action) => action.requests.map((request) => ({
        request: request.request,
        embedding: request.embedding,
        actualActionName: action.actionName,
    })));
    const results = allRequests.map((requestObj) => {
        const { request, embedding: requestEmbedding, actualActionName, } = requestObj;
        const allMatches = data
            .map((action) => ({
            actionName: action.actionName,
            typeName: action.typeName,
            score: parseFloat(similarity(action.embedding, requestEmbedding, SimilarityType.Cosine).toFixed(2)),
        }))
            .sort((a, b) => {
            if (b.score === a.score) {
                if (b.actionName === actualActionName)
                    return 1;
                if (a.actionName === actualActionName)
                    return -1;
                return 0;
            }
            return b.score - a.score;
        });
        const rankActualAction = allMatches.findIndex((match) => match.actionName === actualActionName) + 1;
        const actualActionMatch = allMatches.find((match) => match.actionName === actualActionName);
        const scoreActualAction = actualActionMatch
            ? actualActionMatch.score
            : -1;
        const top10Matches = allMatches.slice(0, 10);
        const rank = rankActualAction <= 10
            ? top10Matches.findIndex((match) => match.actionName === actualActionName) + 1
            : 0;
        const scores = top10Matches.map((match) => match.score);
        const meanScore = calcMean(scores);
        const medianScore = calcMedian(scores);
        const stdDevScore = calcStdDeviation(scores);
        return {
            request,
            actualActionName,
            rank,
            rankActualAction,
            scoreActualAction,
            top10Matches,
            meanScore,
            medianScore,
            stdDevScore,
        };
    });
    return results;
}
export function printDetailedMarkdownTable(results, statsfile, zerorankStatsFile, actionSchemaComments) {
    console.log(chalk.bold("\n## Results for User Request Matches\n"));
    console.log("| Request                            | Actual Action            | Actual Rank | Lev Score | Mean Score | Median Score | Std Dev | Top Matches (Similarity)                                        |");
    console.log("|------------------------------------|--------------------------|-------------|-----------|--------------|---------|-----------------------------------------------------------------|");
    let csvContent = "Request,Actual Action,Actual Rank,Top 10 Rank,Actual Action Score,Lev Score,Mean Score,Median Score,Std Dev,Top Matches\n";
    fs.writeFileSync(statsfile, csvContent);
    let csvZeroRankContent = "Request,Actual Action,Actual Rank,Actual Action Score,Lev Score,Comments,Mean Score,Median Score,Std Dev,Top Matches\n";
    if (zerorankStatsFile !== undefined) {
        fs.writeFileSync(zerorankStatsFile, csvZeroRankContent);
    }
    results.forEach((result) => {
        const { request, actualActionName, rank, rankActualAction, top10Matches, scoreActualAction, meanScore, medianScore, stdDevScore, } = result;
        const levScore = calcLevenshteinSimilarity(request, actualActionName).toFixed(2);
        const topMatches = top10Matches
            .map((match) => `${match.actionName} (${match.score.toFixed(2)},${calcLevenshteinSimilarity(request, match.actionName).toFixed(2)})`)
            .join(", ");
        let res = `| ${chalk.cyan(request.padEnd(34))} | ${chalk.yellow(actualActionName.padEnd(24))} | ${chalk.green(rank.toFixed(2))}    | ${chalk.magenta(meanScore.toFixed(2))}     | ${chalk.magenta(medianScore.toFixed(2))}       | ${chalk.magenta(stdDevScore.toFixed(2))}  | ${chalk.white(topMatches)} |`;
        let comments = "";
        if (actionSchemaComments !== undefined) {
            comments = actionSchemaComments[actualActionName] ?? "";
        }
        if (rank > 0) {
            console.log(res);
            csvContent += `"${request}",${actualActionName},${rankActualAction.toFixed(2)},${rank.toFixed(2)},${scoreActualAction},${levScore},${meanScore.toFixed(2)},${medianScore.toFixed(2)},${stdDevScore.toFixed(2)},"${topMatches}"\n`;
        }
        else {
            csvZeroRankContent += `"${request}",${actualActionName},${rankActualAction.toFixed(2)},${scoreActualAction},${levScore},${comments.length > 0 ? `"${comments}"` : ""},${meanScore.toFixed(2)},${medianScore.toFixed(2)},${stdDevScore.toFixed(2)},"${topMatches}"\n`;
            console.log(`${chalk.red("**")} + ${res}`);
        }
    });
    fs.writeFileSync(statsfile, csvContent);
    if (zerorankStatsFile !== undefined) {
        fs.writeFileSync(zerorankStatsFile, csvZeroRankContent);
    }
}
export function saveStatsToFile(stats, filePath) {
    const output = stats.map((result) => ({
        request: result.request,
        actualActionName: result.actualActionName,
        precision: result.precision,
        recall: result.recall,
        topMatches: result.top10Matches.map((match) => `${match.actionName} (${match.score.toFixed(2)})`),
    }));
    const fileContent = JSON.stringify(output, null, 2);
    fs.writeFileSync(filePath, fileContent);
}
function getActionName(node) {
    for (const child of node.children) {
        if (child.symbol.name === "actionName") {
            return child.symbol.value.slice(1, -1);
        }
    }
    return "";
}
export function loadCommentsActionSchema(filePath) {
    const schema = new SchemaParser();
    schema.loadSchema(filePath);
    const typeNames = schema.actionTypeNames();
    let actionSchemaComments = {};
    for (const type of typeNames) {
        const node = schema.openActionNode(type);
        if (node !== undefined) {
            let actionName = getActionName(node);
            if (actionName !== "") {
                let comments = node.leadingComments?.join(" ") ?? "";
                actionSchemaComments[actionName] = comments;
            }
        }
    }
    return actionSchemaComments;
}
export async function processActionSchemaAndReqData(actionreqEmbeddingsFile, threshold = 0.7, statsfile, zerorankStatsFile) {
    const data = await loadActionData(actionreqEmbeddingsFile);
    const results = generateStats(data, threshold);
    printDetailedMarkdownTable(results, statsfile, zerorankStatsFile?.toString());
}
export async function processActionReqDataWithComments(schemaFilePath, actionreqEmbeddingsFile, threshold = 0.7, statsfile, zerorankStatsFile) {
    const data = await loadActionData(actionreqEmbeddingsFile);
    const results = generateStats(data, threshold);
    const actionSchemaComments = loadCommentsActionSchema(schemaFilePath);
    printDetailedMarkdownTable(results, statsfile, zerorankStatsFile?.toString(), actionSchemaComments);
}
//# sourceMappingURL=genStats.js.map