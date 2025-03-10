// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createJsonTranslator } from "typechat";
import { openai as ai } from "aiclient";
import { createTypeScriptJsonValidator } from "typechat/ts";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
export async function createMarkdownAgent(model) {
    const packageRoot = path.join("../../");
    const schemaText = await fs.promises.readFile(fileURLToPath(new URL(path.join(packageRoot, "./src/agent/markdownDocumentSchema.ts"), import.meta.url)), "utf8");
    const agent = new MarkdownAgent(schemaText, "MarkdownContent", model);
    return agent;
}
export class MarkdownAgent {
    constructor(schema, schemaName, fastModelName) {
        this.schema = schema;
        const apiSettings = ai.azureApiSettingsFromEnv(ai.ModelType.Chat, undefined, fastModelName);
        this.model = ai.createChatModel(apiSettings, undefined, undefined, [
            "markdown",
        ]);
        const validator = createTypeScriptJsonValidator(this.schema, schemaName);
        this.translator = createJsonTranslator(this.model, validator);
    }
    getMarkdownUpdatePrompts(currentMarkdown, intent) {
        let contentPrompt = [];
        if (currentMarkdown) {
            contentPrompt.push({
                type: "text",
                text: `
            Here is the current markdown for the document.
            '''
            ${currentMarkdown}
            '''
            `,
            });
        }
        const promptSections = [
            {
                type: "text",
                text: "You are a virtual assistant that can help users to edit a markdown document. The document uses the github markdown flavor.",
            },
            ...contentPrompt,
            {
                type: "text",
                text: `
            Create an updated markdown document that applies the changes requested by the user below. Format your response as a "MarkdownContent" 
            object using the typescript schema below:
            '''
            ${this.schema}
            
            '''
            
            user:
            The following is a user request:
            '''
            ${intent}
            '''
            The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:
        `,
            },
        ];
        return promptSections;
    }
    async updateDocument(currentMarkdown, intent) {
        const promptSections = this.getMarkdownUpdatePrompts(currentMarkdown, intent);
        this.translator.createRequestPrompt = (input) => {
            console.log(input);
            return "";
        };
        const response = await this.translator.translate("", [
            { role: "user", content: JSON.stringify(promptSections) },
        ]);
        return response;
    }
}
//# sourceMappingURL=translator.js.map