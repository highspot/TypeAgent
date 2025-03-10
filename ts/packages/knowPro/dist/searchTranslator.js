// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createJsonTranslator, } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
import { loadSchema } from "typeagent";
import { createPropertySearchTerm, createSearchTerm, } from "./search.js";
import { PropertyNames } from "./propertyIndex.js";
import { conversation as kpLib } from "knowledge-processor";
export function createSearchTranslator(model) {
    const typeName = "SearchFilter";
    const searchActionSchema = loadSchema(["dateTimeSchema.ts", "searchSchema.ts"], import.meta.url);
    const validator = createTypeScriptJsonValidator(searchActionSchema, typeName);
    return createJsonTranslator(model, validator);
}
export function createSearchGroupFromSearchFilter(filter) {
    const searchGroup = { booleanOp: "or", terms: [] };
    if (filter.entities) {
        for (const entityFilter of filter.entities) {
            searchGroup.terms.push(...createPropertySearchTermsFromEntityTerm(entityFilter));
        }
    }
    if (filter.action) {
        searchGroup.terms.push(...createPropertySearchTermFromActionTerm(filter.action));
    }
    if (filter.searchTerms) {
        for (const term of filter.searchTerms) {
            searchGroup.terms.push(createSearchTerm(term));
        }
    }
    return searchGroup;
}
export function createWhenFromSearchFilter(filter) {
    const when = {};
    if (filter.timeRange) {
        when.dateRange = {
            start: kpLib.toStartDate(filter.timeRange.startDate),
            end: kpLib.toStopDate(filter.timeRange.stopDate),
        };
    }
    return when;
}
function createPropertySearchTermsFromEntityTerm(entityTerm) {
    const terms = [];
    if (entityTerm.name) {
        terms.push(createPropertySearchTerm(PropertyNames.EntityName, entityTerm.name));
    }
    if (entityTerm.type) {
        terms.push(...entityTerm.type.map((t) => createPropertySearchTerm(PropertyNames.EntityType, t)));
    }
    if (entityTerm.facets && entityTerm.facets.length > 0) {
        terms.push(...entityTerm.facets.map((f) => createPropertySearchTerm(f.name, f.value)));
    }
    return terms;
}
function createPropertySearchTermFromActionTerm(actionTerm) {
    const terms = [];
    if (actionTerm.verbs) {
        terms.push(...actionTerm.verbs.words.map((w) => createPropertySearchTerm(PropertyNames.Verb, w)));
    }
    if (actionTerm.from !== "none") {
        terms.push(createPropertySearchTerm(PropertyNames.Subject, actionTerm.from.text));
    }
    if (actionTerm.to) {
        terms.push(createPropertySearchTerm(PropertyNames.Object, actionTerm.to.text));
    }
    return terms;
}
//# sourceMappingURL=searchTranslator.js.map