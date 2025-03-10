// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function string(...union) {
    const flat = union.flat();
    return flat.length !== 0
        ? {
            type: "string-union",
            typeEnum: flat,
        }
        : { type: "string" };
}
export function number() {
    return { type: "number" };
}
export function boolean() {
    return { type: "boolean" };
}
export function array(elementType) {
    return { type: "array", elementType };
}
function toComments(comments) {
    return Array.isArray(comments)
        ? comments
        : comments
            ? [comments]
            : undefined;
}
// alias definition
export function type(name, type, comments, exported) {
    return {
        alias: true,
        name,
        type,
        comments: toComments(comments),
        exported,
    };
}
// interface definition
export function intf(name, type, comments, exported) {
    return {
        alias: false,
        name,
        type,
        comments: toComments(comments),
        exported,
    };
}
export function field(type, comments) {
    return { type, comments: toComments(comments) };
}
export function optional(type, comments) {
    return { optional: true, type, comments: toComments(comments) };
}
export function obj(f) {
    const fields = {};
    for (const [key, value] of Object.entries(f)) {
        const fl = typeof value.type === "string" ? field(value) : value;
        fields[key] = fl;
    }
    return {
        type: "object",
        fields: fields,
    };
}
export function ref(definition) {
    if (typeof definition === "string") {
        return { type: "type-reference", name: definition };
    }
    return { type: "type-reference", name: definition.name, definition };
}
export function union(...types) {
    return { type: "type-union", types: types.flat() };
}
//# sourceMappingURL=creator.js.map