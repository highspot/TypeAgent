// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { isMatchPart } from "./matchPart.js";
import { getPropertyParser } from "./propertyParser.js";
export class ParsePart {
    constructor(propertyName, parser) {
        this.propertyName = propertyName;
        this.parser = parser;
    }
    get wildcardMode() {
        return 0 /* WildcardMode.Disabled */;
    }
    get capture() {
        return true;
    }
    get regExp() {
        return this.parser.regExp;
    }
    get optional() {
        return false;
    }
    convertToValue(match) {
        return this.parser.convertToValue(match);
    }
    equals(e) {
        return (isParsePart(e) &&
            e.propertyName === this.propertyName &&
            e.parser === this.parser);
    }
    toJSON() {
        return {
            propertyName: this.propertyName,
            parserName: this.parser.name,
        };
    }
    toString(verbose = false) {
        return `<P:${this.parser.name}${verbose ? `=${this.propertyName}` : ""}>`;
    }
}
export function createParsePart(propertyName, parser) {
    return new ParsePart(propertyName, parser);
}
export function createParsePartFromJSON(json) {
    const parser = getPropertyParser(json.parserName);
    if (parser === undefined) {
        throw new Error(`Unable to resolve property parser ${json.parserName}`);
    }
    return createParsePart(json.propertyName, parser);
}
export function isParsePart(part) {
    return !isMatchPart(part);
}
//# sourceMappingURL=parsePart.js.map