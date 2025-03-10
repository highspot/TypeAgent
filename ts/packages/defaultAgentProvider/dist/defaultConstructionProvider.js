// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getTestDataFiles } from "./utils/config.js";
import { getBuiltinConstructionConfig } from "./utils/config.js";
export function getDefaultConstructionProvider() {
    return {
        getBuiltinConstructionConfig,
        getImportTranslationFiles: getTestDataFiles,
    };
}
//# sourceMappingURL=defaultConstructionProvider.js.map