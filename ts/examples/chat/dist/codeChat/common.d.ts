import { Module, StoredCodeBlock } from "code-processor";
import { ArgDef } from "interactive-app";
import ts from "typescript";
export declare const sampleFiles: {
    snippet: string;
    testCode: string;
    modules: string;
};
export declare const sampleRootDir: string;
export declare function isSampleFile(sourceFile: string): boolean;
export type TypeScriptCode = {
    sourcePath: string;
    sourceText: string[];
    sourceCode: ts.SourceFile;
    modules: Module[] | undefined;
};
export declare function loadTypescriptCode(sourceFile: string, moduleDir?: string | undefined): Promise<TypeScriptCode>;
export declare function loadCodeChunks(sourcePath?: string, chunkSize?: number): Promise<string[]>;
export declare function createTypescriptBlock(typescriptCode: string | TypeScriptCode, sourcePath?: string): StoredCodeBlock;
export declare function getSourcePath(sourcePath?: string): string;
export declare function argSourceFile(): ArgDef;
export declare function argDestFile(): ArgDef;
export declare function argModule(): ArgDef;
export declare function argVerbose(): ArgDef;
export declare function argConcurrency(value?: number): ArgDef;
export declare function argQuery(): ArgDef;
export declare function argMaxMatches(): ArgDef;
export declare function argMinScore(): ArgDef;
export declare function argCount(count?: number): ArgDef;
export declare function argSave(defaultValue?: boolean): ArgDef;
//# sourceMappingURL=common.d.ts.map