// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function getParamRange(spec) {
    switch (spec) {
        case "ordinal":
            return { min: "1", max: "50", step: "1", convertToInt: true };
        case "percentage":
            return { min: "0", max: "50", step: "1", convertToInt: true };
        case "time":
            return { min: "12:00", max: "11:45", step: "00:15" };
    }
}
export function doCacheAction(action, schemaInfoProvider) {
    return schemaInfoProvider?.getActionCacheEnabled(action.action.translatorName, action.action.actionName);
}
export function getParamSpec(action, paramName, schemaInfoProvider) {
    return schemaInfoProvider?.getActionParamSpec(action.translatorName, action.actionName, paramName);
}
export function getNamespaceForCache(schemaName, actionName, schemaInfoProvider) {
    if (schemaInfoProvider?.getActionNamespace(schemaName) === true) {
        // REVIEW: this requires that subtranslator name doesn't conflict with actionName
        return `${schemaName}.${actionName}`;
    }
    return schemaName;
}
//# sourceMappingURL=schemaInfoProvider.js.map