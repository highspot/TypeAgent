// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const propertyParsers = [
    {
        name: "number",
        valueType: "number",
        regExp: /-?\d+/y,
        convertToValue: (str) => parseInt(str),
    },
    {
        name: "percentage",
        valueType: "number",
        regExp: /-?\d+%/y,
        convertToValue: (str) => parseInt(str),
    },
];
const propertyParserMap = new Map(propertyParsers.map((p) => [p.name, p]));
export function getPropertyParser(name) {
    return propertyParserMap.get(name);
}
//# sourceMappingURL=propertyParser.js.map