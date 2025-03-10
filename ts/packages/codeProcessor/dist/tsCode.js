// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Functions for working with typescript code
 */
import { buildChunks, readAllText } from "typeagent";
import ts from "typescript";
/**
 * Load Typescript source
 * @param filePath
 * @param basePath
 * @returns
 */
export async function loadSourceFile(filePath, basePath) {
    const codeText = await readAllText(filePath, basePath);
    const sourceFile = ts.createSourceFile(filePath, codeText, ts.ScriptTarget.Latest);
    return sourceFile;
}
/**
 * Get statements from Typescript source
 * @param sourceFile
 * @param filter
 * @returns
 */
export function getStatements(sourceFile, filter) {
    const matches = [];
    for (const s of sourceFile.statements) {
        if (filter(s)) {
            matches.push(s);
        }
    }
    return matches;
}
export function getTextOfStatement(sourceFile, s) {
    let text = getComments(sourceFile, s);
    if (text) {
        text += "\n";
    }
    text += s.getText(sourceFile);
    return text;
}
/**
 * Return all top-level statements in this file
 * @param sourceFile
 */
export function getTopLevelStatements(sourceFile) {
    const statements = [];
    ts.forEachChild(sourceFile, (s) => {
        if (ts.isTypeAliasDeclaration(s) ||
            ts.isClassDeclaration(s) ||
            ts.isFunctionDeclaration(s) ||
            ts.isInterfaceDeclaration(s)) {
            statements.push(s);
        }
    });
    return statements;
}
export function getStatementName(statement) {
    if (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement)) {
        return statement.name?.text;
    }
    if (ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement)) {
        return statement.name?.escapedText.toString();
    }
    return undefined;
}
/**
 * Return leading and trailing comments on a node
 * @param sourceFile
 * @param node
 * @returns
 */
export function getComments(sourceFile, node, leading = true, trailing = false) {
    let text = "";
    if (leading) {
        const leadingRanges = ts.getLeadingCommentRanges(sourceFile.text, node.getFullStart());
        if (leadingRanges) {
            text += getCommentChunk(sourceFile, leadingRanges);
        }
    }
    if (trailing) {
        const trailingRanges = ts.getTrailingCommentRanges(sourceFile.text, node.getEnd());
        if (trailingRanges) {
            text += getCommentChunk(sourceFile, trailingRanges);
        }
    }
    return text;
    function getCommentChunk(sourceFile, ranges) {
        let text = "";
        for (const comment of ranges) {
            text += sourceFile.text.substring(comment.pos, comment.end);
        }
        return text;
    }
}
/**
 * Get functions from Typescript source
 * @param sourceFile
 * @returns
 */
export function getFunctions(sourceFile) {
    return getStatements(sourceFile, ts.isFunctionDeclaration);
}
/**
 * Iteratively return the name and text of each function in the source file
 * @param sourceFile
 */
export function* getFunctionsText(sourceFile) {
    for (const s of sourceFile.statements) {
        if (ts.isFunctionDeclaration(s)) {
            yield s.getText(sourceFile);
        }
    }
}
/**
 * Return the text of all top level statements in the file
 * @param sourceFile
 */
export function* getTextOfTopLevelStatements(sourceFile) {
    for (const s of getTopLevelStatements(sourceFile)) {
        let text = getComments(sourceFile, s);
        if (text) {
            text += "\n";
        }
        text += s.getText(sourceFile);
        yield text;
    }
}
/**
 * Gets blocks of statements, such that the text of the function block does not exceed maxCharsPerChunk
 * @param sourceFile
 * @param maxCharsPerChunk
 * @returns
 */
export function getStatementChunks(sourceFile, maxCharsPerChunk) {
    const statements = [...getTextOfTopLevelStatements(sourceFile)];
    return buildChunks(statements, maxCharsPerChunk, "\n");
}
/**
 * Load text for typescript functions from a file
 * @param filePath
 * @param basePath
 * @returns Text for all functions
 */
export async function loadFunctionsTextFromFile(filePath, basePath) {
    const sourceFile = await loadSourceFile(filePath, basePath);
    return [...getFunctionsText(sourceFile)];
}
/**
 * Gets blocks of text at statement boundaries, such that the text of the function block does not exceed maxCharsPerChunk
 * @param filePath
 * @param maxCharsPerChunk
 * @returns
 */
export async function loadChunksFromFile(filePath, maxCharsPerChunk, basePath) {
    const sourceFile = await loadSourceFile(filePath, basePath);
    return [...getStatementChunks(sourceFile, maxCharsPerChunk)];
}
/**
 * Get all imports from a Typescript file
 * @param sourceFile
 * @returns
 */
export async function getImports(sourceFile) {
    const imports = getStatements(sourceFile, ts.isImportDeclaration);
    return imports.map((i) => ts.isStringLiteral(i.moduleSpecifier) ? i.moduleSpecifier.text : "");
}
/**
 * Load typescript modules.
 * Currently very simplistic. Only works if if your modules names are are files in baseDirPath. Relative paths not supported
 * @param sourceFile import modules from this file
 * @param baseDirPath directory where modules are located.
 * @returns
 */
export async function loadImports(sourceFile, baseDirPath) {
    const imports = await getImports(sourceFile);
    const modules = [];
    for (const moduleName of imports) {
        const text = await readAllText(moduleName, baseDirPath);
        modules.push({ text, moduleName });
    }
    return modules;
}
function isExported(statement) {
    if (statement.modifiers) {
        return statement.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    }
    return false;
}
export function getSchemaTypes(sourceFile) {
    const types = getStatements(sourceFile, (s) => ts.isTypeAliasDeclaration(s) && isExported(s));
    const interfaces = getStatements(sourceFile, (s) => ts.isInterfaceDeclaration(s) && isExported(s));
    return { types, interfaces };
}
//# sourceMappingURL=tsCode.js.map