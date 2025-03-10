import { PromptSection } from "typechat";
/**
 * Split the given code into individual lines
 * @param code
 * @returns
 */
export declare function codeToLines(code: string): string[];
/**
 * Annotate the given code with line numbers
 * @param codeText code to annotate
 * @returns
 */
export declare function annotateCodeWithLineNumbers(
    codeText: string | string[],
): string;
/**
 * Load code from given file and return it annotated with line numbers
 * Does not parse the code; just views the code as lines...
 * @param filePath
 * @param basePath
 * @returns
 */
export declare function loadCodeWithLineNumbers(
    filePath: string,
    basePath?: string,
): Promise<string>;
export type CodeBlock = {
    code: string | string[];
    language: string;
};
export declare function codeBlockToString(code: CodeBlock): string;
export interface StoredCodeBlock {
    code: CodeBlock;
    sourcePath?: string | undefined;
}
/**
 * The text of a code module
 */
export type Module = {
    text: string;
    moduleName?: string | undefined;
};
export declare function createModuleSection(module: Module): PromptSection;
export declare function codeSectionFromBlock(code: CodeBlock): PromptSection;
/**
 * Return a prompt section full of code, with each line annotated with line numbers
 * @param code string or array of string lines
 * @param language default language is typescript
 * @returns
 */
export declare function createCodeSection(
    code: string | string[],
    language?: string,
): PromptSection;
export type Api = {
    callConditions?: string | undefined;
    apiSignatures: string;
};
export declare function createApiSection(api: Api): PromptSection;
//# sourceMappingURL=code.d.ts.map
