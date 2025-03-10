// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { openai } from "aiclient";
import { MessageSourceRole, loadSchema } from "typeagent";
import { createJsonTranslator, getData, } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
import { annotateCodeWithLineNumbers, codeSectionFromBlock, createCodeSection, createModuleSection, } from "./code.js";
export function createCodeReviewer(model) {
    model ??= openai.createChatModelDefault("codeReviewer");
    const codeReviewSchema = ["codeReviewSchema.ts"];
    const reviewTranslator = createReviewTranslator(model, codeReviewSchema, "CodeReview");
    const breakpointTranslator = createReviewTranslator(model, codeReviewSchema, "BreakPointSuggestions");
    const answerTranslator = createAnswerTranslator(model);
    const docTranslator = createDocTranslator(model);
    return {
        get model() {
            return model;
        },
        review,
        debug,
        breakpoints,
        answer,
        document,
    };
    async function review(codeToReview, modules) {
        const annotatedCode = annotateCodeWithLineNumbers(codeToReview);
        let sections;
        if (modules) {
            sections = createModuleSections(modules);
        }
        else {
            sections = [];
        }
        return getData(await reviewTranslator.translate(annotatedCode, sections));
    }
    async function debug(observation, codeToReview, modules) {
        const annotatedCode = annotateCodeWithLineNumbers(codeToReview);
        let sections;
        if (modules) {
            sections = createModuleSections(modules);
        }
        else {
            sections = [];
        }
        sections.push({ role: MessageSourceRole.user, content: observation });
        return getData(await reviewTranslator.translate(annotatedCode, sections));
    }
    async function breakpoints(observation, codeToReview, modules) {
        const annotatedCode = annotateCodeWithLineNumbers(codeToReview);
        let sections;
        if (modules) {
            sections = createModuleSections(modules);
        }
        else {
            sections = [];
        }
        sections.push({ role: MessageSourceRole.user, content: observation });
        return getData(await breakpointTranslator.translate(annotatedCode, sections));
    }
    async function answer(question, codeToReview, language) {
        const annotatedCode = createCodeSection(codeToReview, language);
        return getData(await answerTranslator.translate(question, [annotatedCode]));
    }
    async function document(code, facets) {
        const annotatedCode = codeSectionFromBlock(code);
        facets ??= "accurate, active voice, crisp, succinct";
        let request = "Understand the included code and document it where necessary, especially complicated loops. Also explain parameters as needed using JSDoc syntax." +
            `The docs must be: ${facets}`;
        return getData(await docTranslator.translate(request, [annotatedCode]));
    }
    function createModuleSections(modules) {
        const sections = [];
        sections.push({
            role: MessageSourceRole.user,
            content: "Imports used by user code are included below.",
        });
        for (const m of modules) {
            sections.push(createModuleSection(m));
        }
        return sections;
    }
    function createReviewTranslator(model, schemaPaths, typeName) {
        const schema = loadSchema(schemaPaths, import.meta.url);
        const validator = createTypeScriptJsonValidator(schema, typeName);
        const translator = createJsonTranslator(model, validator);
        translator.createRequestPrompt = (request) => createCodeReviewPrompt(request, schema, typeName);
        return translator;
    }
    function createCodeReviewPrompt(request, schema, typeName) {
        return (`Return a code review of user code according to the following TypeScript definitions:\n` +
            `\`\`\`\n${schema}\`\`\`\n` +
            `The following is user code prefixed with line numbers:\n` +
            `"""typescript\n${request}\n"""\n` +
            `The following is your JSON response of type ${typeName} with 2 spaces of indentation and no properties with the value undefined:\n`);
    }
    function createCodeAnswerPrompt(request, schema, typeName) {
        return (`Answer questions about the included code. Return answers according to the following TypeScript definitions:\n` +
            `\`\`\`\n${schema}\`\`\`\n` +
            `QUESTION: ${request}` +
            `The following is your JSON response of type ${typeName} with 2 spaces of indentation and no properties with the value undefined:\n`);
    }
    function createAnswerTranslator(model) {
        const typeName = "CodeAnswer";
        const schema = loadSchema(["codeAnswerSchema.ts"], import.meta.url);
        const validator = createTypeScriptJsonValidator(schema, typeName);
        const translator = createJsonTranslator(model, validator);
        translator.createRequestPrompt = (request) => createCodeAnswerPrompt(request, schema, typeName);
        return translator;
    }
    function createDocTranslator(model) {
        const typeName = "CodeDocumentation";
        const schema = loadSchema(["codeDocSchema.ts"], import.meta.url);
        const validator = createTypeScriptJsonValidator(schema, typeName);
        const translator = createJsonTranslator(model, validator);
        return translator;
    }
}
//# sourceMappingURL=codeReviewer.js.map