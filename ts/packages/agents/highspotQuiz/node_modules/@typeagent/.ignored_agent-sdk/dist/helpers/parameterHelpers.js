// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function getTypeFromValue(value) {
    if (value === undefined) {
        return "string";
    }
    if (Array.isArray(value)) {
        const element = value[0];
        if (Array.isArray(element)) {
            throw new Error(`Invalid nested array default value for flag definition`);
        }
        return getTypeFromValue(element);
    }
    const type = typeof value;
    if (type === "object") {
        return "json";
    }
    return type;
}
export function getFlagMultiple(def) {
    return def.multiple ?? Array.isArray(def.default);
}
export function getFlagType(def) {
    return def.type ?? getTypeFromValue(def.default);
}
export function resolveFlag(definitions, flag) {
    if (flag.startsWith("--")) {
        const key = flag.substring(2);
        const def = definitions[key];
        if (def !== undefined) {
            return [key, def];
        }
        const split = key.split(".");
        if (split.length > 1) {
            const def = definitions[split[0]];
            if (def?.type === "json") {
                return [split[0], def];
            }
        }
        return undefined;
    }
    if (flag.startsWith("-")) {
        const alias = flag.substring(1);
        for (const [key, def] of Object.entries(definitions)) {
            if (def?.char === alias) {
                return [key, def];
            }
        }
    }
}
//# sourceMappingURL=parameterHelpers.js.map