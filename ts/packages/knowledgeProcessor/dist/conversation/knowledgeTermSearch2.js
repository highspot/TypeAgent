// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { setFrom } from "../setOperations.js";
import { NoEntityName } from "./knowledge.js";
export function getAllTermsInFilter(filter, includeVerbs = true) {
    const action = filter.action;
    if (action) {
        let terms = [];
        const subject = getSubjectFromActionTerm(action);
        if (subject && subject !== NoEntityName) {
            terms.push(subject);
        }
        if (includeVerbs && action.verbs) {
            terms.push(...action.verbs.words);
        }
        if (action.object) {
            terms.push(action.object);
        }
        if (filter.searchTerms && filter.searchTerms.length > 0) {
            terms.push(...filter.searchTerms);
        }
        terms = [...setFrom(terms).values()];
        return terms;
    }
    return filter.searchTerms ?? [];
}
export function getSubjectFromActionTerm(term) {
    if (term) {
        if (typeof term.subject !== "string" && !term.subject.isPronoun) {
            return term.subject.subject;
        }
    }
    return undefined;
}
//# sourceMappingURL=knowledgeTermSearch2.js.map