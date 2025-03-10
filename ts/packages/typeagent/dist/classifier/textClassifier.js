"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.classify = exports.createTextClassifier = void 0;
const typechat_1 = require("typechat");
const ts_1 = require("typechat/ts");
const classificationSchemaText = `// The schema for Class object
export type Class = {
    className: string;
    description: string;
};

// The schema for the classification response.
export interface ClassificationResponse {
  // className from classification table
  className: string;
}
`;
async function createTextClassifier(model, existingClasses) {
    const utils = await import("common-utils");
    const classes = existingClasses ?? [];
    const validator = (0, ts_1.createTypeScriptJsonValidator)(classificationSchemaText, "ClassificationResponse");
    const translator = (0, typechat_1.createJsonTranslator)(model, validator);
    const constraintsValidator = utils.createConstraintsValidator((action, context) => validateConstraints(action, context));
    translator.validateInstance = constraintsValidator.validateConstraints;
    const classifier = {
        translator,
        classes,
        classify,
        addClass,
    };
    async function validateConstraints(action, context) {
        if (!action.className) {
            context.addDiagnostic("Error", "Missing class name");
        }
        if (!action.className ||
            !classes.some((c) => c.className === action.className)) {
            const vocab = classes.map((c) => c.className).join(", ");
            context.addDiagnostic("Error", `'${action.className}' does not exist. Permitted values: ${vocab}`);
        }
    }
    async function classify(query, context) {
        const initClasses = JSON.stringify(classes, undefined);
        const fullRequest = `Classify "${query}" using the following classification table:\n${initClasses}\n`;
        return await translator.translate(fullRequest, context);
    }
    async function addClass(newClassOrClasses) {
        if (Array.isArray(newClassOrClasses)) {
            classes.push(...newClassOrClasses);
        }
        else {
            classes.push(newClassOrClasses);
        }
    }
    return classifier;
}
exports.createTextClassifier = createTextClassifier;
async function classify(model, classes, query, context) {
    const classifier = await createTextClassifier(model, classes);
    const result = await classifier.classify(query, context);
    if (!result.success) {
        return result;
    }
    return (0, typechat_1.success)(result.data.className);
}
exports.classify = classify;
//# sourceMappingURL=textClassifier.js.map