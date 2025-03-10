import { CodeGenResponse } from "./codeGenSchema.js";
import { TypeChatLanguageModel } from "typechat";
import { Api } from "./code.js";
export type CodeType = "Function" | "Class" | string;
export type CodeDefinition = {
    language: string | "typescript";
    codeType: CodeType;
    description: string;
};
/**
 * A code generator
 */
export interface CodeGenerator {
    /**
     * Generate a function that can call the given Api
     * @param funcDef
     * @param availableApi
     */
    generate(
        funcDef: CodeDefinition,
        availableApi?: Api[] | undefined,
    ): Promise<CodeGenResponse>;
}
/**
 * Create a code generator
 * @param language code language
 * @param model model to use
 * @returns
 */
export declare function createCodeGenerator(
    model?: TypeChatLanguageModel | undefined,
): CodeGenerator;
//# sourceMappingURL=codeGenerator.d.ts.map
