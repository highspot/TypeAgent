// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { toJsonActions, normalizeParamString, } from "../requestAction.js";
import { form } from "./explanationV5.js";
import { getActionDescription, getSubphraseExplanationInstruction, } from "../explainer.js";
import { TypeChatAgent } from "../typeChatAgent.js";
import { createJsonTranslatorFromFile } from "common-utils";
import { getPackageFilePath } from "../../utils/getPackageFilePath.js";
import { checkActionPropertyValue, validateSubPhraseText, } from "../validateExplanation.js";
import { isEntityParameter, isImplicitParameter, } from "./propertyExplainationV5.js";
function createInstructions([requestAction, parameterExplanation,]) {
    return [
        {
            role: "system",
            content: `${form}\n${getSubphraseExplanationInstruction()}\n${getActionDescription(requestAction)}`,
        },
        {
            role: "system",
            content: "The following JSON is provided to indicate the substring from the request that is input to the value of each property\n" +
                JSON.stringify(parameterExplanation, undefined, 2),
        },
    ];
}
export function createSubPhraseExplainer(model) {
    return new TypeChatAgent("sub-phrase explanation", () => {
        return createJsonTranslatorFromFile("SubPhraseExplanation", getPackageFilePath("./src/explanation/v5/subPhraseExplanationSchemaV5.ts"), { model });
    }, createInstructions, ([requestAction]) => requestAction.toPromptString(), validateSubPhraseExplanationV5);
}
export function isPropertySubPhrase(phrase) {
    return phrase.hasOwnProperty("propertyNames");
}
export function hasPropertyNames(phrase) {
    return isPropertySubPhrase(phrase) && phrase.propertyNames.length > 0;
}
function validateSubPhraseExplanationV5([requestAction, propertyExplanation], explanation) {
    const result = validateSubPhraseText(requestAction, explanation.subPhrases);
    // Verify parameter names
    const corrections = result ? [result] : [];
    const actionProps = toJsonActions(requestAction.actions);
    const propertyToSubPhrase = new Map();
    for (const phrase of explanation.subPhrases) {
        // check if the parameter name is valid
        // Ideally LLM wouldn't emit a sub-phrase with parameter names array empty, but it does, so be relax about it
        if (hasPropertyNames(phrase)) {
            phrase.propertyNames.forEach((propertyName) => {
                // Call checkActionPropertyValue() to ensure the value exist for the parameter name in the sub-phrase
                try {
                    checkActionPropertyValue(actionProps, propertyName, false);
                }
                catch (e) {
                    corrections.push(e.message);
                }
                const propertySubPhrases = propertyToSubPhrase.get(propertyName);
                if (propertySubPhrases !== undefined) {
                    propertySubPhrases.push(phrase);
                }
                else {
                    propertyToSubPhrase.set(propertyName, [phrase]);
                }
            });
        }
    }
    for (const prop of propertyExplanation.properties) {
        const subPhrases = propertyToSubPhrase.get(prop.name);
        if (subPhrases !== undefined) {
            if (isImplicitParameter(prop)) {
                corrections.push(`Property '${prop.name}' is expected to be implicit and should not be included as a property name in a sub-phrase`);
                continue;
            }
            if (isEntityParameter(prop)) {
                continue;
            }
            prop.substrings.forEach((substring) => {
                const normalizedSubString = normalizeParamString(substring);
                const found = subPhrases.some((phrase) => {
                    const normalizedPhrase = normalizeParamString(phrase.text);
                    return (normalizedPhrase.includes(normalizedSubString) ||
                        normalizedSubString.includes(normalizedPhrase));
                });
                if (!found) {
                    corrections.push(`Explicit property '${prop.name}' must be included as property names for all subphrases that contain the substring '${substring}'`);
                }
            });
        }
        else {
            if (!isImplicitParameter(prop) && isEntityParameter(prop)) {
                corrections.push(`Property '${prop.name}' is expected to be explicit and should be included as a property name for a sub-phrase`);
            }
        }
    }
    return corrections.length > 0 ? corrections : undefined;
}
//# sourceMappingURL=subPhraseExplanationV5.js.map