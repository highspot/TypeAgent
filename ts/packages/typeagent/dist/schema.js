"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSchema = void 0;
// Module with Schema related functions
const fs_1 = __importDefault(require("fs"));
const typescript_1 = __importDefault(require("typescript"));
const url_1 = require("url");
/**
 * Loads schema files and combines them into one
 * Also removes all import statements from the combined file, to prevent
 * module install/dependency issues when TypeChat validates messages
 * @param filePaths file paths to import from
 * @param basePath base path if file paths are relative
 * @returns
 */
function loadSchema(filePaths, basePath) {
    let schemaText = "";
    for (const file of filePaths) {
        let filePath = file;
        if (basePath) {
            filePath = (0, url_1.fileURLToPath)(new URL(file, basePath));
        }
        const rawText = fs_1.default.readFileSync(filePath, "utf-8");
        let fileText = stripImports(filePath, rawText);
        fileText = stripCopyright(fileText);
        schemaText += fileText;
        schemaText += "\n";
    }
    return schemaText;
}
exports.loadSchema = loadSchema;
function stripImports(filePath, schemaText) {
    const sourceFile = typescript_1.default.createSourceFile(filePath, schemaText, typescript_1.default.ScriptTarget.Latest);
    const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
    const nodes = sourceFile?.statements.filter((node) => {
        return !typescript_1.default.isImportDeclaration(node);
    });
    let text = "";
    nodes.forEach((n) => (text +=
        printer.printNode(typescript_1.default.EmitHint.Unspecified, n, sourceFile) +
            "\n"));
    return text;
}
function stripCopyright(schemaText) {
    schemaText = schemaText.replace("// Copyright (c) Microsoft Corporation.", "");
    schemaText = schemaText.replace("// Licensed under the MIT License.", "");
    return schemaText;
}
//# sourceMappingURL=schema.js.map