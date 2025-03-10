// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createJsonTranslator, } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
import { loadSchema } from "typeagent";
export function createKnowledgeActionTranslator(model) {
    const typeName = "SearchAction";
    const searchActionSchema = loadSchema(["dateTimeSchema.ts", "knowledgeSearchSchema.ts"], import.meta.url);
    const validator = createTypeScriptJsonValidator(searchActionSchema, typeName);
    const knowledgeActionTranslator = createJsonTranslator(model, validator);
    knowledgeActionTranslator.createRequestPrompt = createRequestPrompt;
    const searchTermsTranslator = createJsonTranslator(model, createTypeScriptJsonValidator(loadSchema(["dateTimeSchema.ts", "knowledgeTermSearchSchema.ts"], import.meta.url), "SearchTermsAction"));
    const searchTermsTranslatorV2 = createJsonTranslator(model, createTypeScriptJsonValidator(loadSchema(["dateTimeSchema.ts", "knowledgeTermSearchSchema2.ts"], import.meta.url), "SearchTermsActionV2"));
    searchTermsTranslatorV2.createRequestPrompt = (request) => createSearchTermsPrompt(searchTermsTranslatorV2, request);
    const translators = {
        requestInstructions: "The following is a user request about a conversation between one or more users and assistants:\n",
        translateSearch,
        translateSearchTerms,
        translateSearchTermsV2,
    };
    return translators;
    async function translateSearch(userRequest, context) {
        return knowledgeActionTranslator.translate(userRequest, context);
    }
    async function translateSearchTerms(userRequest, context) {
        console.log("USER REQUEST: ", userRequest);
        console.log("CONTEXT: ", context);
        return searchTermsTranslator.translate(userRequest, context);
    }
    async function translateSearchTermsV2(userRequest, context) {
        return searchTermsTranslatorV2.translate(userRequest, context);
    }
    function createRequestPrompt(request) {
        return (`You are a service who translates user requests into a JSON object of type "${typeName}" according to the following TypeScript definitions:\n` +
            `\`\`\`\n${searchActionSchema}\`\`\`\n` +
            translators.requestInstructions +
            `"""\n${request}\n"""\n\n` +
            `The following is a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`);
    }
    function createSearchTermsPrompt(translator, request) {
        return (`You are a service who translates user requests into a JSON object of type "${translator.validator.getTypeName()}" according to the following TypeScript definitions:\n` +
            `\`\`\`\n${translator.validator.getSchemaText()}\`\`\`\n` +
            "When translating user requests, ensure that all pronouns are contextualized (using history as needed) and replaced with the person or entity they refer to.\n" +
            translators.requestInstructions +
            `"""\n${request}\n"""\n\n` +
            `The following is a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`);
    }
}
export function toDateRange(range) {
    return {
        startDate: toStartDate(range.startDate),
        stopDate: toStopDate(range.stopDate),
    };
}
export function toStartDate(dateTime) {
    let dt;
    if (dateTime.time) {
        return dateTimeToDate(dateTime);
    }
    else {
        dt = new Date(dateTime.date.year, dateTime.date.month - 1, dateTime.date.day, 0, 0, 0, 0);
    }
    return dt;
}
export function toStopDate(dateTime) {
    if (!dateTime) {
        return undefined;
    }
    let dt;
    if (dateTime.time) {
        return dateTimeToDate(dateTime);
    }
    else {
        dt = new Date(dateTime.date.year, dateTime.date.month - 1, dateTime.date.day, 23, 59, 59, 999);
    }
    return dt;
}
export function dateTimeToDate(dateTime) {
    let dt;
    if (dateTime.time) {
        dt = new Date(dateTime.date.year, dateTime.date.month - 1, dateTime.date.day, dateTime.time.hour, dateTime.time.minute, dateTime.time.seconds);
    }
    else {
        dt = new Date(dateTime.date.year, dateTime.date.month - 1, dateTime.date.day);
    }
    return dt;
}
export function dateToDateTime(dt) {
    const date = {
        day: dt.getDate(),
        month: dt.getMonth() + 1,
        year: dt.getFullYear(),
    };
    const time = {
        hour: dt.getHours(),
        minute: dt.getMinutes(),
        seconds: dt.getSeconds(),
    };
    return {
        date,
        time,
    };
}
export function isFilterWithTagScope(obj) {
    return obj.hasOwnProperty("scopeType") && obj.scopeType === "tags";
}
//# sourceMappingURL=knowledgeActions.js.map