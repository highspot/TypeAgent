// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createJsonTranslatorFromFile } from "common-utils";
import { toJsonActions } from "../requestAction.js";
import { TypeChatAgent } from "../typeChatAgent.js";
import { checkActionProperty, getActionProperty, } from "../validateExplanation.js";
import { getPackageFilePath } from "../../utils/getPackageFilePath.js";
import { form } from "./explanationV5.js";
import { hasPropertyNames } from "./subPhraseExplanationV5.js";
function createInstructions([requestAction, propertyExplanation, subPhraseExplanation,]) {
    const propertySubPhraseMap = new Map();
    const subPhraseText = [];
    for (const subPhrase of subPhraseExplanation.subPhrases) {
        subPhraseText.push(subPhrase.text);
        if (hasPropertyNames(subPhrase)) {
            for (const propertyName of subPhrase.propertyNames) {
                const existing = propertySubPhraseMap.get(propertyName);
                if (existing !== undefined) {
                    existing.push(subPhrase.text);
                }
                else {
                    propertySubPhraseMap.set(propertyName, [subPhrase.text]);
                }
            }
        }
    }
    const actionProps = toJsonActions(requestAction.actions);
    const propertySubPhraseDescription = Array.from(propertySubPhraseMap.entries()).map(([propertyName, subPhrases]) => {
        return {
            propertyName,
            propertyValue: getActionProperty(actionProps, propertyName),
            propertySubPhrases: subPhrases,
        };
    });
    const instructions = [
        form,
        "The request is broken down into non-overlapping sub-phrases in the order they appear in the following array:",
        `  ${JSON.stringify(subPhraseText)}`,
        "For each non-implicit property, the following list are the property name and the sub-phrases that determine the property value.",
        JSON.stringify(propertySubPhraseDescription, undefined, 2),
        "For each non-implicit property and their subpharses, provide possible alternative property values and their substitue sub-phrases to get this alternative property value.",
    ];
    return [
        {
            role: "system",
            content: instructions.join("\n"),
        },
    ];
}
export function createAlternativesExplainer(model) {
    return new TypeChatAgent("alternatives explanation", () => {
        return createJsonTranslatorFromFile("AlternativesExplanation", getPackageFilePath("./src/explanation/v5/alternativesExplanationSchemaV5.ts"), { model });
    }, createInstructions, ([requestAction]) => requestAction.toPromptString(), validateAlternativesExplanationV5);
}
export function validateAlternativesExplanationV5([requestAction, propertyExplanation, subPhraseExplanation,], alternativeExplanation) {
    const propertySubPhraseMap = new Map();
    for (const subPhrase of subPhraseExplanation.subPhrases) {
        if (hasPropertyNames(subPhrase)) {
            for (const propertyName of subPhrase.propertyNames) {
                const existing = propertySubPhraseMap.get(propertyName);
                if (existing !== undefined) {
                    existing.push(subPhrase.text);
                }
                else {
                    propertySubPhraseMap.set(propertyName, [subPhrase.text]);
                }
            }
        }
    }
    const actionProps = toJsonActions(requestAction.actions);
    // Validate parameters
    const corrections = [];
    const propertyNameSet = new Set();
    for (const alternatives of alternativeExplanation.propertyAlternatives) {
        if (propertyNameSet.has(alternatives.propertyName)) {
            corrections.push(`Multiple properties with property name '${alternatives.propertyName}' found`);
            // Don't check the rest.
            continue;
        }
        propertyNameSet.add(alternatives.propertyName);
        try {
            checkActionProperty(actionProps, {
                paramName: alternatives.propertyName,
                paramValue: alternatives.propertyValue,
            }, false);
        }
        catch (e) {
            corrections.push(e.message);
        }
        const propertySubPhrases = propertySubPhraseMap.get(alternatives.propertyName);
        if (propertySubPhrases === undefined) {
            corrections.push(`Implicit property shouldn't have alternatives`);
            continue;
        }
        if (alternatives.propertySubPhrases.length === 0) {
            corrections.push(`Property Value '${alternatives.propertyName}' has no sub-phrases.  Switch to implicit property or specify the sub-phrases as appropriate`);
            continue;
        }
        if (propertySubPhrases === undefined ||
            propertySubPhrases.length !== alternatives.propertySubPhrases.length) {
            corrections.push(`Number of sub-phrases with property name '${alternatives.propertyName}' doesn't match the number of sub-phrases in the property value`);
            continue;
        }
        for (let i = 0; i < propertySubPhrases.length; i++) {
            if (propertySubPhrases[i] !== alternatives.propertySubPhrases[i]) {
                corrections.push(`Property '${alternatives.propertyName}' has propertySubPhrase '${alternatives.propertySubPhrases[i]}', which doesn't match with any of the sub-phrases (found '${propertySubPhrases[i]}' instead).`);
            }
        }
        alternatives.alternatives.forEach((alt) => {
            if (alt.propertySubPhrases.length !==
                alternatives.propertySubPhrases.length) {
                corrections.push(`Mismatch number of sub-phrases: alternatives value '${alt.propertyValue}' for property '${alternatives.propertyName}' must have ${alternatives.propertySubPhrases.length} sub-phrases`);
            }
        });
    }
    for (const propertyName of propertySubPhraseMap.keys()) {
        if (!propertyNameSet.has(propertyName)) {
            corrections.push(`Missing alternatives for non-implicit property '${propertyName}'`);
        }
    }
    return corrections.length > 0 ? corrections : undefined;
}
//# sourceMappingURL=alternativesExplanationV5.js.map