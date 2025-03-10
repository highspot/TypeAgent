// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function createActionResultNoDisplay(literalText) {
    return {
        literalText,
        entities: [],
    };
}
export function createActionResult(literalText, speak, entities) {
    entities ??= [];
    return {
        literalText,
        entities,
        displayContent: speak
            ? {
                type: "text",
                content: literalText,
                speak: true,
            }
            : literalText,
    };
}
export function createActionResultFromTextDisplay(displayText, literalText) {
    return {
        literalText,
        entities: [],
        displayContent: displayText,
    };
}
export function createActionResultFromHtmlDisplay(displayText, literalText) {
    return {
        literalText,
        entities: [],
        displayContent: {
            type: "html",
            content: displayText,
        },
    };
}
export function createActionResultFromHtmlDisplayWithScript(displayText, literalText) {
    return {
        literalText,
        entities: [],
        displayContent: {
            type: "iframe",
            content: displayText,
        },
    };
}
export function createActionResultFromMarkdownDisplay(literalText, entities = [], resultEntity) {
    return {
        literalText,
        entities,
        resultEntity,
        displayContent: { type: "markdown", content: literalText },
    };
}
export function createActionResultFromError(error) {
    return {
        error,
    };
}
function entitiesToString(entities, indent = "") {
    // entities in the format "name (type1, type2)"
    return entities
        .map((entity) => `${indent}${entity.name} (${entity.type.join(", ")})`)
        .join("\n");
}
export function actionResultToString(actionResult) {
    if (actionResult.error) {
        return `Error: ${actionResult.error}`;
    }
    else {
        // add to result all non-empty fields of the turn impression, using entitiesToString for the entities
        const fields = Object.entries(actionResult)
            .filter(([key, value]) => Array.isArray(value) && value.length > 0)
            .map(([key, value]) => {
            if (key === "entities") {
                return `${key}:\n${entitiesToString(value, "  ")}`;
            }
            return `${key}: ${value}`;
        });
        return fields.join("\n");
    }
}
//# sourceMappingURL=actionHelpers.js.map