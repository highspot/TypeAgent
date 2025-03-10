// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Functionalities
export { RequestAction, normalizeParamValue, normalizeParamString, equalNormalizedParamValue, equalNormalizedParamObject, toJsonActions, fromJsonActions, getFullActionName, createExecutableAction, toExecutableActions, toFullActions, } from "./explanation/requestAction.js";
export { AgentCacheFactory, getDefaultExplainerName } from "./cache/factory.js";
// Testing
export { getNamespaceForCache } from "./explanation/schemaInfoProvider.js";
export { createActionProps } from "./constructions/constructionValue.js";
// Console printing.  REVIEW: move it to a separate export path?
export { printProcessExplanationResult, printProcessRequestActionResult, printImportConstructionResult, } from "./utils/print.js";
//# sourceMappingURL=index.js.map