// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { MessageSourceRole, readAllText } from "typeagent";
/**
 * Split the given code into individual lines
 * @param code
 * @returns
 */
export function codeToLines(code) {
    return code.split(/\r?\n/);
}
/**
 * Annotate the given code with line numbers
 * @param codeText code to annotate
 * @returns
 */
export function annotateCodeWithLineNumbers(codeText) {
    const lines = typeof codeText === "string" ? codeToLines(codeText) : codeText;
    codeText = "";
    for (let i = 0; i < lines.length; ++i) {
        codeText += `//${i + 1}: ` + lines[i];
    }
    return codeText;
}
/**
 * Load code from given file and return it annotated with line numbers
 * Does not parse the code; just views the code as lines...
 * @param filePath
 * @param basePath
 * @returns
 */
export async function loadCodeWithLineNumbers(filePath, basePath) {
    let codeText = await readAllText(filePath, basePath);
    return annotateCodeWithLineNumbers(codeText);
}
export function codeBlockToString(code) {
    const text = code.code;
    return typeof text === "string" ? text : text.join("\n");
}
//---
// Code related prompt sections
//--
// A prompt section to tell the LLM about an imported module
export function createModuleSection(module) {
    if (module.moduleName) {
        return {
            role: MessageSourceRole.user,
            content: `Module name: ${module.moduleName}\n${module.text}`,
        };
    }
    return {
        role: MessageSourceRole.user,
        content: module.text,
    };
}
export function codeSectionFromBlock(code) {
    return createCodeSection(code.code, code.language ?? "typescript");
}
/**
 * Return a prompt section full of code, with each line annotated with line numbers
 * @param code string or array of string lines
 * @param language default language is typescript
 * @returns
 */
export function createCodeSection(code, language = "typescript") {
    code = annotateCodeWithLineNumbers(code);
    let content = `${language} code prefixed with line numbers:\n"""\n${code}\n"""\n`;
    return {
        role: MessageSourceRole.user,
        content,
    };
}
export function createApiSection(api) {
    let content = api.callConditions
        ? `Call this Api when the following conditions are met:\n${api.callConditions}\n\n${api.apiSignatures}`
        : api.apiSignatures;
    return {
        role: MessageSourceRole.user,
        content,
    };
}
//# sourceMappingURL=code.js.map