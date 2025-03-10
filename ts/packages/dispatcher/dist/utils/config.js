// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getPackageFilePath } from "./getPackageFilePath.js";
import fs from "node:fs";
import { glob } from "glob";
let config;
export function getDispatcherConfig() {
    if (config === undefined) {
        config = JSON.parse(fs.readFileSync(getPackageFilePath("./data/config.json"), "utf8"));
    }
    return config;
}
export function getBuiltinConstructionConfig(explainerName) {
    const config = getDispatcherConfig()?.explainers?.[explainerName]?.constructions;
    return config
        ? {
            data: config.data.map((f) => getPackageFilePath(f)),
            file: getPackageFilePath(config?.file),
        }
        : undefined;
}
export async function getTestDataFiles() {
    const config = await getDispatcherConfig();
    return glob(config.tests.map((f) => getPackageFilePath(f)));
}
//# sourceMappingURL=config.js.map