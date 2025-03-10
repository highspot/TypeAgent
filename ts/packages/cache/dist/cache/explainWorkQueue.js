// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { queue } from "async";
import { getTranslationNamesForActions, normalizeParamString, } from "../explanation/requestAction.js";
import { getLanguageTools } from "../utils/language.js";
const langTool = getLanguageTools("en");
function checkExplainableValues(requestAction, valueInRequest, noReferences) {
    // Do a cheap parameter check first.
    const normalizedRequest = normalizeParamString(requestAction.request);
    const pending = [];
    for (const { action } of requestAction.actions) {
        pending.push(action.parameters);
    }
    while (pending.length > 0) {
        const value = pending.pop();
        if (!value) {
            continue;
        }
        // TODO: check number too.
        if (typeof value === "string") {
            if (noReferences && langTool?.possibleReferentialPhrase(value)) {
                throw new Error("Request contains a possible referential phrase used for property values.");
            }
            if (valueInRequest &&
                !normalizedRequest.includes(normalizeParamString(value))) {
                throw new Error(`Action parameter value '${value}' not found in the request`);
            }
            continue;
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                pending.push(...value);
            }
            else {
                pending.push(...Object.values(value));
            }
        }
    }
}
export class ExplainWorkQueue {
    constructor(getExplainerForTranslator) {
        this.getExplainerForTranslator = getExplainerForTranslator;
        this.queue = queue(async (item, callback) => {
            try {
                item.resolve(await item.task());
            }
            catch (e) {
                item.reject(e);
            }
        });
    }
    async queueTask(requestAction, cache, options, constructionCreationConfig, model) {
        const concurrent = options?.concurrent ?? false;
        const valueInRequest = options?.valueInRequest ?? true;
        const noReferences = options?.noReferences ?? true;
        const checkExplainable = options?.checkExplainable;
        checkExplainableValues(requestAction, valueInRequest, noReferences);
        const task = async () => {
            const startTime = performance.now();
            const actions = requestAction.actions;
            const explainer = this.getExplainerForTranslator(getTranslationNamesForActions(actions), model);
            const explainerConfig = {
                constructionCreationConfig,
            };
            await checkExplainable?.(requestAction);
            const explanation = await explainer.generate(requestAction, explainerConfig);
            const elapsedMs = performance.now() - startTime;
            return {
                explanation,
                elapsedMs,
                toPrettyString: explainer.toPrettyString,
            };
        };
        if (concurrent && !cache) {
            return task();
        }
        return new Promise((resolve, reject) => {
            this.queue.push({
                task,
                resolve,
                reject,
            });
        });
    }
}
//# sourceMappingURL=explainWorkQueue.js.map