// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { mergedEntities, mergeTopics } from "./knowledge.js";
import * as q from "./query.js";
import { resolveRelatedTerms } from "./relatedTermsIndex.js";
export function createSearchTerm(text, score) {
    return {
        term: {
            text,
            weight: score,
        },
    };
}
export function createPropertySearchTerm(key, value) {
    let propertyName;
    let propertyValue;
    switch (key) {
        default:
            propertyName = createSearchTerm(key);
            break;
        case "name":
        case "type":
        case "verb":
        case "subject":
        case "object":
        case "indirectObject":
        case "tag":
            propertyName = key;
            break;
    }
    propertyValue = createSearchTerm(value);
    return { propertyName, propertyValue };
}
/**
 * Searches conversation for terms
 */
export async function searchConversation(conversation, searchTermGroup, filter, options) {
    if (!q.isConversationSearchable(conversation)) {
        return undefined;
    }
    const secondaryIndexes = conversation.secondaryIndexes ?? {};
    const queryBuilder = new SearchQueryBuilder(conversation, secondaryIndexes);
    const query = await queryBuilder.compile(searchTermGroup, filter, options);
    const queryResults = query.eval(new q.QueryEvalContext(conversation, options?.usePropertyIndex
        ? secondaryIndexes.propertyToSemanticRefIndex
        : undefined, options?.useTimestampIndex
        ? secondaryIndexes.timestampIndex
        : undefined));
    return queryResults;
}
export function getDistinctEntityMatches(semanticRefs, searchResults, topK) {
    return mergedEntities(semanticRefs, searchResults, topK);
}
export function getDistinctTopicMatches(semanticRefs, searchResults, topK) {
    return mergeTopics(semanticRefs, searchResults, topK);
}
class SearchQueryBuilder {
    constructor(conversation, secondaryIndexes, entityTermMatchWeight = 100, defaultTermMatchWeight = 10, relatedIsExactThreshold = 0.95) {
        this.conversation = conversation;
        this.secondaryIndexes = secondaryIndexes;
        this.entityTermMatchWeight = entityTermMatchWeight;
        this.defaultTermMatchWeight = defaultTermMatchWeight;
        this.relatedIsExactThreshold = relatedIsExactThreshold;
        // All SearchTerms used which compiling the 'select' portion of the query
        this.allSearchTerms = [];
        // All search terms used while compiling predicates in the query
        this.allPredicateSearchTerms = [];
        this.allScopeSearchTerms = [];
    }
    async compile(terms, filter, options) {
        let query = await this.compileQuery(terms, filter, options);
        const exactMatch = options?.exactMatch ?? false;
        if (!exactMatch) {
            // For all individual SearchTerms created during query compilation, resolve any related terms
            await this.resolveRelatedTerms(this.allSearchTerms, true);
            await this.resolveRelatedTerms(this.allPredicateSearchTerms, false);
            await this.resolveRelatedTerms(this.allScopeSearchTerms, false);
        }
        return new q.GroupSearchResultsExpr(query);
    }
    async compileQuery(searchTermGroup, filter, options) {
        let selectExpr = this.compileSelect(searchTermGroup, filter
            ? await this.compileScope(searchTermGroup, filter)
            : undefined, options);
        // Constrain the select with scopes and 'where'
        if (filter) {
            selectExpr = new q.WhereSemanticRefExpr(selectExpr, this.compileWhere(filter));
        }
        // And lastly, select 'TopN' and group knowledge by type
        return new q.SelectTopNKnowledgeGroupExpr(new q.GroupByKnowledgeTypeExpr(selectExpr), options?.maxMatches);
    }
    compileSelect(termGroup, scopeExpr, options) {
        // Select is a combination of ordinary search terms and property search terms
        let [searchTermUsed, selectExpr] = this.compileSearchGroup(termGroup, scopeExpr);
        this.allSearchTerms.push(...searchTermUsed);
        return selectExpr;
    }
    compileSearchGroup(searchGroup, scopeExpr) {
        const searchTermsUsed = [];
        const termExpressions = [];
        for (const term of searchGroup.terms) {
            if (isPropertyTerm(term)) {
                termExpressions.push(new q.MatchPropertySearchTermExpr(term));
                if (typeof term.propertyName !== "string") {
                    searchTermsUsed.push(term.propertyName);
                }
                if (isEntityPropertyTerm(term)) {
                    term.propertyValue.term.weight ??=
                        this.entityTermMatchWeight;
                }
                searchTermsUsed.push(term.propertyValue);
            }
            else {
                termExpressions.push(new q.MatchSearchTermExpr(term, (term, sr, scored) => this.boostEntities(term, sr, scored, 10)));
                searchTermsUsed.push(term);
            }
        }
        return [
            searchTermsUsed,
            searchGroup.booleanOp === "and"
                ? new q.MatchTermsAndExpr(termExpressions, scopeExpr)
                : new q.MatchTermsOrExpr(termExpressions, scopeExpr),
        ];
    }
    async compileScope(searchGroup, filter) {
        let scopeSelectors;
        // First, use any provided date ranges to select scope
        if (filter.dateRange) {
            scopeSelectors ??= [];
            scopeSelectors.push(new q.TextRangesInDateRangeSelector(filter.dateRange));
        }
        // Actions are inherently scope selecting. If any present in the query, use them
        // to restrict scope
        const actionTermsGroup = this.getActionTermsFromSearchGroup(searchGroup);
        if (actionTermsGroup) {
            scopeSelectors ??= [];
            const [searchTermsUsed, selectExpr] = this.compileSearchGroup(actionTermsGroup);
            scopeSelectors.push(new q.TextRangesWithTermMatchesSelector(selectExpr));
            this.allScopeSearchTerms.push(...searchTermsUsed);
        }
        // If a thread index is available...
        const threads = this.secondaryIndexes?.threads;
        if (filter.threadDescription && threads) {
            const threadsInScope = await threads.lookupThread(filter.threadDescription);
            if (threadsInScope) {
                scopeSelectors ??= [];
                scopeSelectors.push(new q.ThreadSelector(threadsInScope.map((t) => threads.threads[t.threadIndex])));
            }
        }
        return scopeSelectors ? new q.GetScopeExpr(scopeSelectors) : undefined;
    }
    compileWhere(filter) {
        let predicates = [];
        if (filter.knowledgeType) {
            predicates.push(new q.KnowledgeTypePredicate(filter.knowledgeType));
        }
        return predicates;
    }
    /*
    private compilePropertyMatchPredicates(
        propertyTerms: PropertySearchTerm[],
    ) {
        return propertyTerms.map((p) => {
            if (typeof p.propertyName !== "string") {
                this.allPredicateSearchTerms.push(p.propertyName);
            }
            this.allPredicateSearchTerms.push(p.propertyValue);
            return new q.PropertyMatchPredicate(p);
        });
    }
    */
    getActionTermsFromSearchGroup(searchGroup) {
        let actionGroup;
        for (const term of searchGroup.terms) {
            if (isPropertyTerm(term) && isActionPropertyTerm(term)) {
                actionGroup ??= {
                    booleanOp: "and",
                    terms: [],
                };
                actionGroup.terms.push(term);
            }
        }
        return actionGroup;
    }
    async resolveRelatedTerms(searchTerms, dedupe) {
        this.validateAndPrepareSearchTerms(searchTerms);
        if (this.secondaryIndexes?.termToRelatedTermsIndex) {
            await resolveRelatedTerms(this.secondaryIndexes.termToRelatedTermsIndex, searchTerms, dedupe);
            // Ensure that the resolved terms are valid etc.
            this.validateAndPrepareSearchTerms(searchTerms);
        }
    }
    validateAndPrepareSearchTerms(searchTerms) {
        for (const searchTerm of searchTerms) {
            this.validateAndPrepareSearchTerm(searchTerm);
        }
    }
    validateAndPrepareSearchTerm(searchTerm) {
        if (!this.validateAndPrepareTerm(searchTerm.term)) {
            return false;
        }
        searchTerm.term.weight ??= this.defaultTermMatchWeight;
        if (searchTerm.relatedTerms) {
            for (const relatedTerm of searchTerm.relatedTerms) {
                if (!this.validateAndPrepareTerm(relatedTerm)) {
                    return false;
                }
                if (relatedTerm.weight &&
                    relatedTerm.weight >= this.relatedIsExactThreshold) {
                    relatedTerm.weight = this.defaultTermMatchWeight;
                }
            }
        }
        return true;
    }
    /**
     * Currently, just changes the case of a term
     *  But here, we may do other things like:
     * - Check for noise terms
     * - Do additional rewriting
     * - Additional checks that *reject* certain search terms
     * Return false if the term should be rejected
     */
    validateAndPrepareTerm(term) {
        if (term) {
            term.text = term.text.toLowerCase();
        }
        return true;
    }
    boostEntities(searchTerm, sr, scoredRef, boostWeight) {
        if (sr.knowledgeType === "entity" &&
            q.matchEntityNameOrType(searchTerm, sr.knowledge)) {
            scoredRef = {
                semanticRefIndex: scoredRef.semanticRefIndex,
                score: scoredRef.score * boostWeight,
            };
        }
        return scoredRef;
    }
}
function isPropertyTerm(term) {
    return term.hasOwnProperty("propertyName");
}
function isEntityPropertyTerm(term) {
    switch (term.propertyName) {
        default:
            break;
        case "name":
        case "type":
            return true;
    }
    return false;
}
function isActionPropertyTerm(term) {
    switch (term.propertyName) {
        default:
            break;
        case "subject":
        case "verb":
        case "object":
        case "indirectObject":
            return true;
    }
    return false;
}
export function getTimeRangeForConversation(conversation) {
    const messages = conversation.messages;
    const start = messages[0].timestamp;
    const end = messages[messages.length - 1].timestamp;
    if (start !== undefined) {
        return {
            start: new Date(start),
            end: end ? new Date(end) : undefined,
        };
    }
    return undefined;
}
export function getTimeRangeSectionForConversation(conversation) {
    const timeRange = getTimeRangeForConversation(conversation);
    if (timeRange) {
        return [
            {
                role: "system",
                content: `ONLY IF user request explicitly asks for time ranges, THEN use the CONVERSATION TIME RANGE: "${timeRange.start} to ${timeRange.end}"`,
            },
        ];
    }
    return [];
}
//# sourceMappingURL=search.js.map