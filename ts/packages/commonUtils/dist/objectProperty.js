// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function getObjectProperty(data, objectName, name) {
    if (name === "") {
        return data[objectName];
    }
    const properties = name.split(".");
    let lastName = objectName;
    let curr = data;
    for (const name of properties) {
        // Protect against prototype pollution
        if (name === "__proto__" ||
            name === "constructor" ||
            name === "prototype") {
            throw new Error(`Invalid property name: ${name}`);
        }
        const next = curr[lastName];
        if (next === undefined) {
            return undefined;
        }
        const maybeIndex = parseInt(name);
        if (maybeIndex.toString() === name) {
            // Array index
            if (!Array.isArray(next)) {
                return undefined;
            }
            lastName = maybeIndex;
        }
        else {
            if (typeof next !== "object") {
                return undefined;
            }
            lastName = name;
        }
        curr = next;
    }
    return curr[lastName];
}
export function setObjectProperty(data, objectName, name, value, override = false) {
    const properties = name.split(".");
    let lastName = objectName;
    let curr = data;
    for (const name of properties) {
        // Protect against prototype pollution
        if (name === "__proto__" ||
            name === "constructor" ||
            name === "prototype") {
            throw new Error(`Invalid property name: ${name}`);
        }
        let next = curr[lastName];
        const maybeIndex = parseInt(name);
        if (maybeIndex.toString() === name) {
            // Array index
            if (next === undefined || (override && !Array.isArray(next))) {
                next = [];
                curr[lastName] = next;
            }
            curr = next;
            if (!Array.isArray(curr)) {
                throw new Error(`Internal error: ${lastName} is not an array`);
            }
            lastName = maybeIndex;
        }
        else {
            if (next === undefined || (override && typeof next !== "object")) {
                next = {};
                curr[lastName] = next;
            }
            curr = next;
            if (typeof curr !== "object") {
                throw new Error(`Internal error: ${lastName} is not an object`);
            }
            lastName = name;
        }
    }
    curr[lastName] = value;
}
//# sourceMappingURL=objectProperty.js.map