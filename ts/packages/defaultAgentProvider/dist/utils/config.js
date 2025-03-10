// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { glob } from "glob";
import { getPackageFilePath } from "./getPackageFilePath.js";
import fs from "node:fs";
let config;
export function getConfig() {
    if (config === undefined) {
        config = JSON.parse(fs.readFileSync(getPackageFilePath("./data/config.json"), "utf8"));
    }
    return config;
}
export function getBuiltinConstructionConfig(explainerName) {
    const config = getConfig()?.explainers?.[explainerName]?.constructions;
    return config
        ? {
            data: config.data.map((f) => getPackageFilePath(f)),
            file: getPackageFilePath(config?.file),
        }
        : undefined;
}
export async function getTestDataFiles(extended = true) {
    const testDataFiles = getConfig()?.tests;
    if (testDataFiles === undefined) {
        return [];
    }
    const testDataFilePaths = extended
        ? testDataFiles
        : testDataFiles.slice(0, 1);
    return glob(testDataFilePaths.map((f) => getPackageFilePath(f)));
}
//# sourceMappingURL=config.js.map