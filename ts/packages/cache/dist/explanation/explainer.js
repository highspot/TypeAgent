// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { toJsonActions, } from "./requestAction.js";
export function getExactStringRequirementMessage(subphraseText = true) {
    const name = subphraseText ? "Sub-phrase text" : "Substring";
    const wholeWords = subphraseText ? ", include whole words and" : "and";
    return `${name} must be exact copy of part of the original request ${wholeWords} is not changed by correcting misspelling or grammar.`;
}
export function getSubphraseExplanationInstruction() {
    return `Break the words of Request into non-overlapping phrases in exactly the order they appear and explain the role of each phrase in the translation. ${getExactStringRequirementMessage()}`;
}
function getContextPart(history) {
    if (history && history.entities.length > 0) {
        const contextNames = history.entities.map((c, i) => {
            return { index: i, entity: c.name };
        });
        return `\n. The entities in the conversation history in a JSON array is: ${JSON.stringify(contextNames)}.`;
    }
    return "";
}
export function getActionDescription(requestAction) {
    const actions = requestAction.actions;
    const leafPropertyNames = getLeafNames(toJsonActions(actions));
    let propertyPart = "";
    if (leafPropertyNames.length > 0) {
        propertyPart = `The property name${leafPropertyNames.length > 1 ? "s are " : " is "}${leafPropertyNames.join(", ")}.`;
    }
    else {
        propertyPart = `There are no properties.`;
    }
    return `${propertyPart} Ignore properties that are not listed. ${getContextPart(requestAction.history)}`;
}
function getLeafNames(params) {
    const names = [];
    for (const [key, value] of Object.entries(params)) {
        if (typeof value === "object") {
            const children = getLeafNames(value);
            for (const child of children) {
                names.push(`${key}.${child}`);
            }
        }
        else if (typeof value === "function") {
            throw new Error("Function is not supported as an action value");
        }
        else {
            names.push(key);
        }
    }
    return names;
}
export class Explainer {
    constructor(agent, createConstruction, toPrettyString, augmentExplanation) {
        this.agent = agent;
        this.createConstruction = createConstruction;
        this.toPrettyString = toPrettyString;
        this.augmentExplanation = augmentExplanation;
    }
    validate(requestAction, explanation, config) {
        return this.agent.validate?.(requestAction, explanation, config);
    }
    async generate(requestAction, config) {
        const result = await this.agent.run(requestAction, config);
        const constructionCreationConfig = config?.constructionCreationConfig;
        if (result.success &&
            this.augmentExplanation &&
            constructionCreationConfig) {
            await this.augmentExplanation(result.data, requestAction, constructionCreationConfig);
        }
        if (result.success &&
            constructionCreationConfig &&
            this.createConstruction) {
            result.construction = this.createConstruction(requestAction, result.data, constructionCreationConfig);
        }
        return result;
    }
    async correct(requestAction, explanation, correction) {
        if (!this.agent.correct) {
            throw new Error("Explainer doesn't support correction");
        }
        return this.agent.correct(requestAction, explanation, correction);
    }
}
//# sourceMappingURL=explainer.js.map