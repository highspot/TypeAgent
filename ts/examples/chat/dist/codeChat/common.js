// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { tsCode } from "code-processor";
import path from "path";
import { readAllLines } from "typeagent";
import { fileURLToPath } from "url";
export const sampleFiles = {
    snippet: "../../src/codeChat/testCode/snippet.ts",
    testCode: "../../src/codeChat/testCode/testCode.ts",
    modules: "../../dist/codeChat/testCode",
};
export const sampleRootDir = path.dirname(fileURLToPath(import.meta.url));
export function isSampleFile(sourceFile) {
    sourceFile = sourceFile.toLowerCase();
    for (const value of Object.values(sampleFiles)) {
        if (value.toLowerCase() === sourceFile) {
            return true;
        }
    }
    return false;
}
export async function loadTypescriptCode(sourceFile, moduleDir) {
    const sourcePath = getSourcePath(sourceFile);
    const sourceText = await readAllLines(sourcePath); // Load lines of code
    const sourceCode = await tsCode.loadSourceFile(sourcePath);
    moduleDir = getModuleDirPath(sourceFile, moduleDir);
    let modules = moduleDir
        ? await tsCode.loadImports(sourceCode, moduleDir)
        : undefined;
    return {
        sourcePath,
        sourceText,
        sourceCode,
        modules,
    };
}
/**
 * Get full path
 * @param filePath
 * @param basePath
 * @returns
 */
function getAbsolutePath(filePath) {
    if (path.isAbsolute(filePath)) {
        // already absolute
        return filePath;
    }
    // Temporary support for current sample files
    // Eventually, all relative paths will be resolved only cwd
    const basePath = isSampleFile(filePath) ? sampleRootDir : process.cwd();
    return path.join(basePath, filePath);
}
export function loadCodeChunks(sourcePath, chunkSize = 2048) {
    const fullPath = getSourcePath(sourcePath);
    return tsCode.loadChunksFromFile(fullPath, chunkSize);
}
export function createTypescriptBlock(typescriptCode, sourcePath) {
    if (typeof typescriptCode === "string") {
        return {
            code: {
                code: typescriptCode,
                language: "typescript",
            },
            sourcePath,
        };
    }
    return {
        code: {
            code: typescriptCode.sourceText,
            language: "typescript",
        },
        sourcePath: typescriptCode.sourcePath,
    };
}
export function getSourcePath(sourcePath) {
    return getAbsolutePath(sourcePath ?? sampleFiles.testCode);
}
// Temporary, to support current sample files.
function getModuleDirPath(sourceFile, moduleDir) {
    if (isSampleFile(sourceFile) && !moduleDir) {
        moduleDir = sampleFiles.modules;
    }
    return moduleDir ? getAbsolutePath(moduleDir) : undefined;
}
export function argSourceFile() {
    return {
        description: "Path to source file",
        type: "path",
        defaultValue: sampleFiles.testCode,
    };
}
export function argDestFile() {
    return {
        description: "Path to dest file",
    };
}
export function argModule() {
    return {
        description: "Module name",
    };
}
export function argVerbose() {
    return {
        description: "Verbose output",
        type: "boolean",
        defaultValue: false,
    };
}
export function argConcurrency(value = 4) {
    return {
        description: "Concurrency",
        type: "number",
        defaultValue: value,
    };
}
export function argQuery() {
    return {
        description: "Natural language query",
        type: "string",
    };
}
export function argMaxMatches() {
    return {
        description: "Max query matches",
        type: "number",
        defaultValue: 1,
    };
}
export function argMinScore() {
    return {
        description: "Min query match score",
        type: "number",
        defaultValue: 0.7,
    };
}
export function argCount(count = Number.MAX_SAFE_INTEGER) {
    return {
        description: "Max items to display",
        type: "number",
        defaultValue: count,
    };
}
export function argSave(defaultValue = false) {
    return {
        type: "boolean",
        defaultValue,
    };
}
//# sourceMappingURL=common.js.map