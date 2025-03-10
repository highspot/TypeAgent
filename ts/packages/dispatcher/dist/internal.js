// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Internal exports for CLI/testing/debugging purposes
export { getCacheFactory } from "./utils/cacheFactory.js";
export { generateExplanationTestDataFiles, readLineData, getEmptyExplanationTestData, readExplanationTestData, printExplanationTestDataStats, convertTestDataToExplanationData, } from "./utils/test/explanationTestData.js";
export { getAssistantSelectionSchemas } from "./translation/unknownSwitcher.js";
export { getActionSchema } from "./translation/actionSchemaFileCache.js";
export { getFullSchemaText } from "./translation/agentTranslators.js";
export { getAppAgentName } from "./translation/agentTranslators.js";
export { createSchemaInfoProvider } from "./translation/actionSchemaFileCache.js";
export { createActionConfigProvider, getSchemaNamesForActionConfigProvider, } from "./agentProvider/agentProviderUtils.js";
//# sourceMappingURL=internal.js.map