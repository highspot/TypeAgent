// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// REVIEW: Use \p{P}?  Will need to turn on unicode flag.  Need to assess perf impact.
const punctuations = [",", ".", "?", "!"];
export const spaceAndPunctuationRegexStr = `[${punctuations.join("")}\\s]`;
export const wordBoundaryRegexStr = "(?:(?<!\\w)|(?!\\w))";
export function escapeMatch(m) {
    // escape all regex special characters
    return m.replaceAll(/([()\][{*+.$^\\|?])/g, "\\$1");
}
const spaceAndPunctuationRegex = new RegExp(spaceAndPunctuationRegexStr, "y");
export function isSpaceOrPunctuation(s, index) {
    spaceAndPunctuationRegex.lastIndex = index;
    return spaceAndPunctuationRegex.test(s);
}
export function isSpaceOrPunctuationRange(s, start, end) {
    for (let i = start; i < end; i++) {
        if (!isSpaceOrPunctuation(s, i)) {
            return false;
        }
    }
    return true;
}
const wordBoundaryRegex = /\w\W|\W./iuy;
export function isWordBoundary(s, index) {
    if (index === 0 || s.length == index) {
        return true;
    }
    wordBoundaryRegex.lastIndex = index - 1;
    return wordBoundaryRegex.test(s);
}
//# sourceMappingURL=regexp.js.map