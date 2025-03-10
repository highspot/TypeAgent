// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Returns:
 *  0 if locations are equal
 *  < 0 if x is less than y
 *  > 0 if x is greater than y
 * @param x
 * @param y
 * @returns
 */
export function compareTextLocation(x, y) {
    let cmp = x.messageIndex - y.messageIndex;
    if (cmp !== 0) {
        return cmp;
    }
    cmp = (x.chunkIndex ?? 0) - (y.chunkIndex ?? 0);
    if (cmp !== 0) {
        return cmp;
    }
    return (x.charIndex ?? 0) - (y.charIndex ?? 0);
}
export function compareTextRange(x, y) {
    let cmp = compareTextLocation(x.start, y.start);
    if (cmp !== 0) {
        return cmp;
    }
    if (x.end === undefined && y.end === undefined) {
        return cmp;
    }
    cmp = compareTextLocation(x.end ?? x.start, y.end ?? y.start);
    return cmp;
}
export function isInTextRange(outerRange, innerRange) {
    // outer start must be <= inner start
    // inner end must be < outerEnd (which is exclusive)
    let cmpStart = compareTextLocation(outerRange.start, innerRange.start);
    if (outerRange.end === undefined && innerRange.end === undefined) {
        // Since both ends are undefined, we have an point location, not a range.
        // Points must be equal
        return cmpStart == 0;
    }
    let cmpEnd = compareTextLocation(
    // innerRange.end must be < outerRange end
    innerRange.end ?? innerRange.start, outerRange.end ?? outerRange.start);
    return cmpStart <= 0 && cmpEnd < 0;
}
export function compareDates(x, y) {
    return x.getTime() - y.getTime();
}
export function isInDateRange(outerRange, date) {
    // outer start must be <= date
    // date must be <= outer end
    let cmpStart = compareDates(outerRange.start, date);
    let cmpEnd = outerRange.end !== undefined ? compareDates(date, outerRange.end) : -1;
    return cmpStart <= 0 && cmpEnd <= 0;
}
export function isSearchTermWildcard(searchTerm) {
    return searchTerm.term.text === "*";
}
//# sourceMappingURL=common.js.map