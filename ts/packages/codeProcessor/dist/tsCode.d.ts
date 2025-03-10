import ts from "typescript";
import { Module } from "./code.js";
/**
 * Load Typescript source
 * @param filePath
 * @param basePath
 * @returns
 */
export declare function loadSourceFile(
    filePath: string,
    basePath?: string,
): Promise<ts.SourceFile>;
/**
 * Get statements from Typescript source
 * @param sourceFile
 * @param filter
 * @returns
 */
export declare function getStatements<T extends ts.Statement>(
    sourceFile: ts.SourceFile,
    filter: (s: ts.Statement) => boolean,
): T[];
export declare function getTextOfStatement(
    sourceFile: ts.SourceFile,
    s: ts.Statement,
): string;
/**
 * Return all top-level statements in this file
 * @param sourceFile
 */
export declare function getTopLevelStatements(
    sourceFile: ts.SourceFile,
): ts.Statement[];
export declare function getStatementName(
    statement: ts.Statement,
): string | undefined;
/**
 * Return leading and trailing comments on a node
 * @param sourceFile
 * @param node
 * @returns
 */
export declare function getComments(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    leading?: boolean,
    trailing?: boolean,
): string;
/**
 * Get functions from Typescript source
 * @param sourceFile
 * @returns
 */
export declare function getFunctions(
    sourceFile: ts.SourceFile,
): ts.FunctionDeclaration[];
/**
 * Iteratively return the name and text of each function in the source file
 * @param sourceFile
 */
export declare function getFunctionsText(
    sourceFile: ts.SourceFile,
): IterableIterator<string>;
/**
 * Return the text of all top level statements in the file
 * @param sourceFile
 */
export declare function getTextOfTopLevelStatements(
    sourceFile: ts.SourceFile,
): IterableIterator<string>;
/**
 * Gets blocks of statements, such that the text of the function block does not exceed maxCharsPerChunk
 * @param sourceFile
 * @param maxCharsPerChunk
 * @returns
 */
export declare function getStatementChunks(
    sourceFile: ts.SourceFile,
    maxCharsPerChunk: number,
): IterableIterator<string>;
/**
 * Load text for typescript functions from a file
 * @param filePath
 * @param basePath
 * @returns Text for all functions
 */
export declare function loadFunctionsTextFromFile(
    filePath: string,
    basePath?: string,
): Promise<string[]>;
/**
 * Gets blocks of text at statement boundaries, such that the text of the function block does not exceed maxCharsPerChunk
 * @param filePath
 * @param maxCharsPerChunk
 * @returns
 */
export declare function loadChunksFromFile(
    filePath: string,
    maxCharsPerChunk: number,
    basePath?: string,
): Promise<string[]>;
/**
 * Get all imports from a Typescript file
 * @param sourceFile
 * @returns
 */
export declare function getImports(
    sourceFile: ts.SourceFile,
): Promise<string[]>;
/**
 * Load typescript modules.
 * Currently very simplistic. Only works if if your modules names are are files in baseDirPath. Relative paths not supported
 * @param sourceFile import modules from this file
 * @param baseDirPath directory where modules are located.
 * @returns
 */
export declare function loadImports(
    sourceFile: ts.SourceFile,
    baseDirPath?: string,
): Promise<Module[]>;
export type Schema = {
    types?: ts.TypeAliasDeclaration[];
    interfaces?: ts.InterfaceDeclaration[];
};
export declare function getSchemaTypes(sourceFile: ts.SourceFile): Schema;
//# sourceMappingURL=tsCode.d.ts.map
