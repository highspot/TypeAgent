// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const skipSpace = [
    true, // Element,
    false, // LiteralString,
    false, // LiteralStringEscape,
    false, // LiteralStringUnicodeEscape,
    false, // LiteralNumberInteger,
    false, // LiteralNumberFraction,
    false, // LiteralNumberExponent,
    false, // LiteralKeyword,
    true, // ObjectStart,
    true, // ObjectPropStart,
    true, // ObjectPropColon,
    true, // ObjectPropEnd,
    true, // ArrayStart,
    true, // ArrayElemEnd,
    true, // End,
    false, // Error
];
export function createIncrementalJsonParser(callback, options) {
    function tryCallBack(prop, value, delta) {
        try {
            parser.callback(prop, value, delta);
        }
        catch (e) {
            // callback throw, just set it to error state and stop incremental parsing.
            currentState = 15 /* State.Error */;
        }
    }
    // Literal value
    let currentLiteral = "";
    let literalDelta = "";
    let currentUnicodeEscape = "";
    let expectedKeyword = "";
    let expectedKeywordValue = null;
    // Nested object/arrays property names
    let props = [];
    // For full mode
    let nested = [];
    let currentNested = undefined;
    function parseLiteralKeyword(c) {
        currentLiteral += c;
        if (currentLiteral === expectedKeyword) {
            return finishElementValue(expectedKeywordValue);
        }
        if (!expectedKeyword.startsWith(currentLiteral)) {
            // invalid keyword
            return 15 /* State.Error */;
        }
        return currentState;
    }
    function finishLiteralNumber(c) {
        if ("0123456789".includes(currentLiteral[currentLiteral.length - 1])) {
            const nextState = finishElementValue(parseFloat(currentLiteral));
            return incrParseChar(c, nextState);
        }
        // Invalid number
        return 15 /* State.Error */;
    }
    function finishElementValue(value) {
        if (value === undefined) {
            // finishing structures (object/array)
            if (options?.full) {
                value = currentNested;
                tryCallBack(props.join("."), value);
                currentNested = nested.pop();
            }
        }
        else {
            reportStringDelta();
            tryCallBack(props.join("."), value);
        }
        const lastProp = props.pop();
        if (lastProp === undefined) {
            return 14 /* State.End */;
        }
        if (options?.full) {
            currentNested[lastProp] = value;
        }
        if (typeof lastProp === "string") {
            return 11 /* State.ObjectPropEnd */;
        }
        props.push(lastProp + 1);
        return 13 /* State.ArrayElemEnd */;
    }
    function startObject() {
        if (options?.full) {
            nested.push(currentNested);
            currentNested = {};
        }
        return 8 /* State.ObjectStart */;
    }
    function startArray() {
        if (options?.full) {
            nested.push(currentNested);
            currentNested = [];
        }
        props.push(0); // push the index
        return 12 /* State.ArrayStart */;
    }
    function finishArray() {
        props.pop(); // pop the index
        return finishElementValue();
    }
    function startLiteral(c, newState) {
        currentLiteral = c;
        return newState;
    }
    function startKeyword(c, keyword, value) {
        expectedKeyword = keyword;
        expectedKeywordValue = value;
        return startLiteral(c, 7 /* State.LiteralKeyword */);
    }
    function parseElement(c) {
        switch (c) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "-":
                return startLiteral(c, 4 /* State.LiteralNumberInteger */);
            case '"':
                return startLiteral("", 1 /* State.LiteralString */);
            case "t": // true
                return startKeyword(c, "true", true);
            case "f": // false
                return startKeyword(c, "false", false);
            case "n": // null
                return startKeyword(c, "null", null);
            case "{":
                return startObject();
            case "[":
                return startArray();
            default:
                // Invalid start of an element
                return 15 /* State.Error */;
        }
    }
    function isPendingPropertyName() {
        return props.length !== 0 && props[props.length - 1] === "";
    }
    function appendStringLiteral(c) {
        literalDelta += c;
        currentLiteral += c;
    }
    function parseLiteralString(c) {
        switch (c) {
            case '"':
                if (isPendingPropertyName()) {
                    if (currentLiteral === "") {
                        // Can't have empty property name
                        return 15 /* State.Error */;
                    }
                    // Property name
                    props[props.length - 1] = currentLiteral;
                    return 10 /* State.ObjectPropColon */;
                }
                return finishElementValue(currentLiteral);
            case "\\":
                return 2 /* State.LiteralStringEscape */;
            default:
                if (c.charCodeAt(0) < 0x20) {
                    // Invalid control character in string literal
                    return 15 /* State.Error */;
                }
                appendStringLiteral(c);
                return 1 /* State.LiteralString */;
        }
    }
    function parseLiteralStringEscape(c) {
        switch (c) {
            case '"':
            case "\\":
            case "/":
                appendStringLiteral(c);
                break;
            case "b":
                appendStringLiteral("\b");
                break;
            case "f":
                appendStringLiteral("\f");
                break;
            case "n":
                appendStringLiteral("\n");
                break;
            case "r":
                appendStringLiteral("\r");
                break;
            case "t":
                appendStringLiteral("\t");
                break;
            case "u":
                currentUnicodeEscape = "";
                return 3 /* State.LiteralStringUnicodeEscape */;
            default:
                // Invalid escape character
                return 15 /* State.Error */;
        }
        return 1 /* State.LiteralString */;
    }
    function parseLiteralStringUnicodeEscape(c) {
        if (!"0123456789abcdefABCDEF".includes(c)) {
            // Invalid unicode escape character
            return 15 /* State.Error */;
        }
        currentUnicodeEscape += c;
        if (currentUnicodeEscape.length === 4) {
            appendStringLiteral(String.fromCharCode(parseInt(currentUnicodeEscape, 16)));
            return 1 /* State.LiteralString */;
        }
        return 3 /* State.LiteralStringUnicodeEscape */;
    }
    function parseLiteralNumberInteger(c) {
        switch (c) {
            case "E":
            case "e":
            case ".":
                if (currentLiteral === "-") {
                    // Invalid integer
                    return 15 /* State.Error */;
                }
                currentLiteral += c;
                return c === "."
                    ? 5 /* State.LiteralNumberFraction */
                    : 6 /* State.LiteralNumberExponent */;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                if (currentLiteral === "0" || currentLiteral === "-0") {
                    // Invalid number (leading zero)
                    return 15 /* State.Error */;
                }
                currentLiteral += c;
                return 4 /* State.LiteralNumberInteger */;
            default:
                return finishLiteralNumber(c);
        }
    }
    function parseLiteralNumberFraction(c) {
        switch (c) {
            case "E":
            case "e":
                if (currentLiteral.endsWith(".")) {
                    // Invalid number (missing number in fraction)
                    return 15 /* State.Error */;
                }
                currentLiteral += c;
                return 6 /* State.LiteralNumberExponent */;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                currentLiteral += c;
                return 5 /* State.LiteralNumberFraction */;
        }
        return finishLiteralNumber(c);
    }
    function parseLiteralNumberExponent(c) {
        switch (c) {
            case "+":
            case "-":
                if (!currentLiteral.endsWith("e") &&
                    !currentLiteral.endsWith("E")) {
                    // Invalid number (sign after numbers in exponent)
                    return 15 /* State.Error */;
                }
            // fall thru
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                currentLiteral += c;
                return 6 /* State.LiteralNumberExponent */;
            default:
                return finishLiteralNumber(c);
        }
    }
    function parseObjectPropStart(c) {
        if (c === '"') {
            // Push an empty property name to indicate the next string literal is a property name
            props.push("");
            return startLiteral("", 1 /* State.LiteralString */);
        }
        // Expect a property name
        return 15 /* State.Error */;
    }
    function parseObjectPropEnd(c) {
        switch (c) {
            case "}":
                return finishElementValue();
            case ",":
                return 9 /* State.ObjectPropStart */;
            default:
                // Expecting a comma or end of object
                return 15 /* State.Error */;
        }
    }
    function parseArrayElemEnd(c) {
        switch (c) {
            case "]":
                return finishArray();
            case ",":
                return 0 /* State.Element */;
            default:
                // Expecting a comma or end of array
                return 15 /* State.Error */;
        }
    }
    function incrParseChar(c, state) {
        if (skipSpace[state]) {
            switch (c) {
                case " ":
                case "\n":
                case "\r":
                case "\t":
                    return state;
            }
        }
        switch (state) {
            case 8 /* State.ObjectStart */:
                if (c === "}") {
                    return finishElementValue();
                }
            // fall thru
            case 9 /* State.ObjectPropStart */:
                return parseObjectPropStart(c);
            case 10 /* State.ObjectPropColon */:
                // Expect a colon
                return c === ":" ? 0 /* State.Element */ : 15 /* State.Error */;
            case 11 /* State.ObjectPropEnd */:
                return parseObjectPropEnd(c);
            case 12 /* State.ArrayStart */:
                if (c === "]") {
                    return finishArray();
                }
            // fall thru
            case 0 /* State.Element */:
                return parseElement(c);
            case 13 /* State.ArrayElemEnd */:
                return parseArrayElemEnd(c);
            case 1 /* State.LiteralString */:
                return parseLiteralString(c);
            case 2 /* State.LiteralStringEscape */:
                return parseLiteralStringEscape(c);
            case 3 /* State.LiteralStringUnicodeEscape */:
                return parseLiteralStringUnicodeEscape(c);
            case 4 /* State.LiteralNumberInteger */:
                return parseLiteralNumberInteger(c);
            case 5 /* State.LiteralNumberFraction */:
                return parseLiteralNumberFraction(c);
            case 6 /* State.LiteralNumberExponent */:
                return parseLiteralNumberExponent(c);
            case 7 /* State.LiteralKeyword */:
                return parseLiteralKeyword(c);
        }
        // Invalid state
        return 15 /* State.Error */;
    }
    function reportStringDelta() {
        if (options?.partial) {
            // States that expect a value and the value is a literal string
            if ((currentState === 1 /* State.LiteralString */ ||
                currentState === 2 /* State.LiteralStringEscape */ ||
                currentState === 3 /* State.LiteralStringUnicodeEscape */) &&
                !isPendingPropertyName()) {
                tryCallBack(props.join("."), currentLiteral, literalDelta);
            }
        }
        literalDelta = "";
    }
    let currentState = 0 /* State.Element */;
    const parser = {
        callback,
        parse: (chunk) => {
            if (currentState === 15 /* State.Error */) {
                // Short circuit if we are in an error state
                return false;
            }
            for (const c of chunk) {
                currentState = incrParseChar(c, currentState);
                if (currentState === 15 /* State.Error */) {
                    // Short circuit if we are in an error state
                    return false;
                }
            }
            reportStringDelta();
            return true;
        },
        complete: () => {
            if (currentState === 15 /* State.Error */) {
                return false;
            }
            if (currentState === 14 /* State.End */) {
                return true;
            }
            // Flush the last number literal
            if (currentState === 4 /* State.LiteralNumberInteger */ ||
                currentState === 5 /* State.LiteralNumberFraction */ ||
                currentState === 6 /* State.LiteralNumberExponent */) {
                currentState = finishLiteralNumber(" ");
                return currentState === 14 /* State.End */;
            }
            // Finishing in any other state is an error
            currentState = 15 /* State.Error */;
            return false;
        },
    };
    return parser;
}
//# sourceMappingURL=incrementalJsonParser.js.map