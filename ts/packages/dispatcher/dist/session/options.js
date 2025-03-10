// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function cloneConfig(config) {
    return structuredClone(config);
}
export function mergeConfig(config, options, strict = true, flexKeys) {
    const changed = {};
    const keys = strict ? Object.keys(config) : Object.keys(options);
    for (const key of keys) {
        if (options.hasOwnProperty(key)) {
            const optionValue = options[key];
            if (optionValue === undefined) {
                continue;
            }
            // null means undefined
            const value = optionValue === null ? undefined : optionValue;
            let configValue = config[key];
            const strictKey = flexKeys ? !flexKeys.includes(key) : strict;
            if (strictKey && typeof configValue !== typeof value) {
                // Ignore invalid options.
                continue;
            }
            if (typeof value === "object") {
                if (typeof configValue !== "object") {
                    configValue = {};
                    config[key] = configValue;
                }
                const changedValue = mergeConfig(configValue, value, strictKey);
                if (Object.keys(changedValue).length !== 0) {
                    changed[key] = changedValue;
                }
            } else if (
                configValue !== value &&
                (!strict || config.hasOwnProperty(key))
            ) {
                if (!strict && value === undefined) {
                    delete config[key];
                } else {
                    config[key] = value;
                }
                changed[key] = optionValue;
            }
        }
    }
    return changed;
}
//# sourceMappingURL=options.js.map
