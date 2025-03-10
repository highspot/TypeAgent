// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createTranslator, MessageSourceRole } from "typeagent";
import { openai } from "aiclient";
import { getData } from "typechat";
import { createApiSection } from "./code.js";
/**
 * Create a code generator
 * @param language code language
 * @param model model to use
 * @returns
 */
export function createCodeGenerator(model) {
    model ??= openai.createChatModelDefault("codeGenerator");
    const codeGenSchema = ["codeGenSchema.ts"];
    const codeGenTranslator = createTranslator(model, codeGenSchema, import.meta.url, "CodeGenResponse", createCodeGenPrompt);
    return {
        generate,
    };
    async function generate(funcDef, availableApi) {
        const funcDefText = JSON.stringify(funcDef);
        const request = `Generate code according to the following definitions:\n` +
            `\`\`\`\n${funcDefText}\`\`\`\n`;
        return getData(await codeGenTranslator.translate(request, createApiSections(availableApi)));
    }
    function createCodeGenPrompt(request, schema, typeName) {
        return (`Generate code according to the following TypeScript definitions:\n` +
            `\`\`\`\n${schema}\`\`\`\n` +
            `The following is user request:\n` +
            `"""typescript\n${request}\n"""\n` +
            `The following is your JSON response of type ${typeName} with 2 spaces of indentation and no properties with the value undefined:\n`);
    }
    function createApiSections(apis) {
        if (apis === undefined || apis.length === 0) {
            return undefined;
        }
        const sections = [];
        sections.push({
            role: MessageSourceRole.user,
            content: "Apis you can call are included below.",
        });
        for (const api of apis) {
            sections.push(createApiSection(api));
        }
        return sections;
    }
}
//# sourceMappingURL=codeGenerator.js.map