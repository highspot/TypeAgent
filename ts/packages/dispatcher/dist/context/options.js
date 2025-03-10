// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function cloneConfig(config) {
    return structuredClone(config);
}
/**
 * Merge options into config.
 *
 * @param config Config to merge into
 * @param options Options to change the config with
 * @param overwrite whether to overwrite the config even if the type mismatch. If an array is given, then those keys that the nested object will be overwritten when new types.
 * @param prefix Prefix for error message (for nested object)
 * @returns
 */
export function mergeConfig(config, options, overwrite = false, defaultConfig, prefix = "") {
    const changed = {};
    // Ignore extra properties when not overwrite by using the keys in config to
    // process option properties.
    const keys = Object.keys(options !== null ? options : config);
    for (const key of keys) {
        const overwriteKey = Array.isArray(overwrite)
            ? overwrite.includes(key)
            : overwrite;
        if (!overwriteKey && !config.hasOwnProperty(key)) {
            continue;
        }
        const optionValue = options !== null ? options[key] : null;
        // undefined means no change
        if (optionValue === undefined) {
            continue;
        }
        if (Array.isArray(optionValue)) {
            throw new Error(`Invalid option '${prefix}${key}': array is not a valid value`);
        }
        // null means set it to default value (overwrite keys default value is always undefined)
        const defaultValue = defaultConfig?.[key];
        const value = optionValue === null
            ? overwriteKey
                ? undefined
                : defaultValue
            : optionValue;
        let existingValue = config[key];
        if (!overwriteKey && typeof existingValue !== typeof value) {
            throw new Error(`Invalid option '${prefix}${key}': type mismatch (expected: ${typeof existingValue}, actual: ${typeof value})`);
        }
        if (typeof value === "object") {
            if (typeof existingValue !== "object") {
                // overwrite existing config as an object. for non-strictKey
                existingValue = {};
                config[key] = existingValue;
            }
            if (defaultValue !== undefined &&
                typeof defaultValue !== "object") {
                throw new Error(`Invalid option '${prefix}${key}': default value is not an object`);
            }
            const changedValue = mergeConfig(existingValue, value, overwriteKey, defaultValue, `${prefix}${key}.`);
            if (changedValue) {
                changed[key] = changedValue;
            }
        }
        else if (existingValue !== value) {
            if (overwriteKey && value === undefined) {
                delete config[key];
            }
            else {
                config[key] = value;
            }
            changed[key] = value;
        }
    }
    return Object.keys(changed).length !== 0 ? changed : undefined;
}
export function sanitizeConfig(config, settings, override = false, prefix = "") {
    if (typeof settings !== "object" || settings === null) {
        return undefined;
    }
    let changed = false;
    for (const [key, value] of Object.entries(settings)) {
        if (value === null) {
            // Serialized options can't have a null value.
            throw new Error(`Invalid option: '${prefix}${key}' cannot be null`);
        }
        if (value === undefined || !config.hasOwnProperty(key)) {
            // Ignore options with no effect and extraneous options.
            continue;
        }
        const existingValue = config[key];
        const overrideKey = Array.isArray(override)
            ? override.includes(key)
            : override;
        if (!overrideKey && typeof existingValue !== typeof value) {
            // Clear value for mismatched types.
            delete settings[key];
            changed = true;
            continue;
        }
        if (typeof existingValue === "object" && typeof value === "object") {
            if (sanitizeConfig(existingValue, value, overrideKey, `${prefix}${key}.`)) {
                changed = true;
            }
        }
    }
    return changed;
}
export function isEmptySettings(settings) {
    const keys = Object.keys(settings);
    if (keys.length === 0) {
        return true;
    }
    for (const key of keys) {
        const value = settings[key];
        if (typeof value === "object") {
            if (!isEmptySettings(value)) {
                return false;
            }
        }
        else if (value !== undefined) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=options.js.map