// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { collections, createTopNList } from "typeagent";
import { compareTextRange, isInTextRange } from "./common.js";
/**
 * Sort in place
 * @param matches
 */
export function sortMatchesByRelevance(matches) {
    matches.sort((x, y) => y.score - x.score);
}
export class MatchAccumulator {
    constructor() {
        this.matches = new Map();
    }
    get size() {
        return this.matches.size;
    }
    has(value) {
        return this.matches.has(value);
    }
    getMatch(value) {
        return this.matches.get(value);
    }
    setMatch(match) {
        this.matches.set(match.value, match);
    }
    setMatches(matches, clear = false) {
        if (clear) {
            this.clearMatches();
        }
        for (const match of matches) {
            this.setMatch(match);
        }
    }
    getMaxHitCount() {
        let maxHitCount = 0;
        for (const match of this.matches.values()) {
            if (match.hitCount > maxHitCount) {
                maxHitCount = match.hitCount;
            }
        }
        return maxHitCount;
    }
    add(value, score, isExactMatch) {
        const existingMatch = this.getMatch(value);
        if (existingMatch) {
            //this.updateExisting(existingMatch, score, isExactMatch);
            if (isExactMatch) {
                existingMatch.hitCount++;
                existingMatch.score += score;
            }
            else {
                existingMatch.relatedHitCount++;
                existingMatch.relatedScore += score;
            }
        }
        else {
            if (isExactMatch) {
                this.setMatch({
                    value,
                    hitCount: 1,
                    score,
                    relatedHitCount: 0,
                    relatedScore: 0,
                });
            }
            else {
                this.setMatch({
                    value,
                    hitCount: 1,
                    score: 0,
                    relatedHitCount: 1,
                    relatedScore: score,
                });
            }
        }
    }
    addUnion(other) {
        for (const otherMatch of other.getMatches()) {
            const existingMatch = this.getMatch(otherMatch.value);
            if (existingMatch) {
                this.combineMatches(existingMatch, otherMatch);
            }
            else {
                this.setMatch(otherMatch);
            }
        }
    }
    intersect(other, intersection) {
        intersection ??= new MatchAccumulator();
        for (const thisMatch of this.getMatches()) {
            const otherMatch = other.getMatch(thisMatch.value);
            if (otherMatch) {
                this.combineMatches(thisMatch, otherMatch);
                intersection.setMatch(thisMatch);
            }
        }
        return intersection;
    }
    combineMatches(match, other) {
        match.hitCount += other.hitCount;
        match.score += other.score;
        match.relatedHitCount += other.relatedHitCount;
        match.relatedScore += other.relatedScore;
    }
    calculateTotalScore() {
        for (const match of this.getMatches()) {
            if (match.relatedHitCount > 0) {
                // Smooth the impact of multiple related term matches
                // If we just add up scores, a larger number of moderately related
                // but noisy matches can overwhelm a small # of highly related matches... etc
                const avgScore = match.relatedScore / match.relatedHitCount;
                const normalizedScore = Math.log(1 + avgScore);
                match.score += normalizedScore;
            }
        }
    }
    getSortedByScore(minHitCount) {
        if (this.matches.size === 0) {
            return [];
        }
        const matches = [...this.matchesWithMinHitCount(minHitCount)];
        matches.sort((x, y) => y.score - x.score);
        return matches;
    }
    /**
     * Return the top N scoring matches
     * @param maxMatches
     * @returns
     */
    getTopNScoring(maxMatches, minHitCount) {
        if (this.matches.size === 0) {
            return [];
        }
        if (maxMatches && maxMatches > 0) {
            const topList = createTopNList(maxMatches);
            for (const match of this.matchesWithMinHitCount(minHitCount)) {
                topList.push(match.value, match.score);
            }
            const ranked = topList.byRank();
            return ranked.map((m) => this.matches.get(m.item));
        }
        else {
            return this.getSortedByScore(minHitCount);
        }
    }
    getWithHitCount(minHitCount) {
        return [...this.matchesWithMinHitCount(minHitCount)];
    }
    *getMatches(predicate) {
        for (const match of this.matches.values()) {
            if (predicate === undefined || predicate(match)) {
                yield match;
            }
        }
    }
    clearMatches() {
        this.matches.clear();
    }
    selectTopNScoring(maxMatches, minHitCount) {
        const topN = this.getTopNScoring(maxMatches, minHitCount);
        this.setMatches(topN, true);
        return topN.length;
    }
    selectWithHitCount(minHitCount) {
        const matches = this.getWithHitCount(minHitCount);
        this.setMatches(matches, true);
        return matches.length;
    }
    matchesWithMinHitCount(minHitCount) {
        return minHitCount !== undefined && minHitCount > 0
            ? this.getMatches((m) => m.hitCount >= minHitCount)
            : this.matches.values();
    }
}
export class SemanticRefAccumulator extends MatchAccumulator {
    constructor(searchTermMatches = new Set()) {
        super();
        this.searchTermMatches = searchTermMatches;
    }
    addTermMatches(searchTerm, scoredRefs, isExactMatch, weight) {
        if (scoredRefs) {
            weight ??= searchTerm.weight ?? 1;
            for (const scoredRef of scoredRefs) {
                this.add(scoredRef.semanticRefIndex, scoredRef.score * weight, isExactMatch);
            }
            this.searchTermMatches.add(searchTerm.text);
        }
    }
    getSortedByScore(minHitCount) {
        return super.getSortedByScore(minHitCount);
    }
    getTopNScoring(maxMatches, minHitCount) {
        return super.getTopNScoring(maxMatches, minHitCount);
    }
    *getSemanticRefs(semanticRefs, predicate) {
        for (const match of this.getMatches()) {
            const semanticRef = semanticRefs[match.value];
            if (predicate === undefined || predicate(semanticRef))
                yield semanticRef;
        }
    }
    *getMatchesOfType(semanticRefs, knowledgeType, predicate) {
        for (const match of this.getMatches()) {
            const semanticRef = semanticRefs[match.value];
            if (semanticRef.knowledgeType === knowledgeType) {
                if (predicate === undefined ||
                    predicate(semanticRef.knowledge))
                    yield match;
            }
        }
    }
    groupMatchesByType(semanticRefs) {
        const groups = new Map();
        for (const match of this.getMatches()) {
            const semanticRef = semanticRefs[match.value];
            let group = groups.get(semanticRef.knowledgeType);
            if (group === undefined) {
                group = new SemanticRefAccumulator();
                group.searchTermMatches = this.searchTermMatches;
                groups.set(semanticRef.knowledgeType, group);
            }
            group.setMatch(match);
        }
        return groups;
    }
    getMatchesInScope(semanticRefs, rangesInScope) {
        const accumulator = new SemanticRefAccumulator(this.searchTermMatches);
        for (const match of this.getMatches()) {
            if (rangesInScope.isRangeInScope(semanticRefs[match.value].range)) {
                accumulator.setMatch(match);
            }
        }
        return accumulator;
    }
    intersect(other) {
        const intersection = new SemanticRefAccumulator();
        super.intersect(other, intersection);
        return intersection;
    }
    toScoredSemanticRefs() {
        return this.getSortedByScore(0).map((m) => {
            return {
                semanticRefIndex: m.value,
                score: m.score,
            };
        }, 0);
    }
    clearMatches() {
        super.clearMatches();
        this.searchTermMatches.clear();
    }
}
export class MessageAccumulator extends MatchAccumulator {
}
export class TextRangeCollection {
    constructor(ranges) {
        this.ranges = ranges ?? [];
    }
    get size() {
        return this.ranges.length;
    }
    addRange(textRange) {
        // Future: merge ranges
        // Is this text range already in this collection?
        let pos = collections.binarySearch(this.ranges, textRange, compareTextRange);
        if (pos >= 0) {
            // Already exists
            return false;
        }
        this.ranges.splice(~pos, 0, textRange);
        return true;
    }
    addRanges(textRanges) {
        if (Array.isArray(textRanges)) {
            textRanges.forEach((t) => this.addRange(t));
        }
        else {
            textRanges.ranges.forEach((t) => this.addRange(t));
        }
    }
    isInRange(rangeToMatch) {
        if (this.ranges.length === 0) {
            return false;
        }
        // Find the first text range with messageIndex == rangeToMatch.start.messageIndex
        let i = collections.binarySearchFirst(this.ranges, rangeToMatch, (x, y) => x.start.messageIndex - y.start.messageIndex);
        if (i < 0) {
            return false;
        }
        if (i == this.ranges.length) {
            i--;
        }
        // Now loop over all text ranges that start at rangeToMatch.start.messageIndex
        for (; i < this.ranges.length; ++i) {
            const range = this.ranges[i];
            if (range.start.messageIndex > rangeToMatch.start.messageIndex) {
                break;
            }
            if (isInTextRange(range, rangeToMatch)) {
                return true;
            }
        }
        return false;
    }
}
export class TextRangesInScope {
    constructor(textRanges = undefined) {
        this.textRanges = textRanges;
    }
    addTextRanges(ranges) {
        this.textRanges ??= [];
        this.textRanges.push(ranges);
    }
    isRangeInScope(innerRange) {
        if (this.textRanges !== undefined) {
            /**
                Since outerRanges come from a set of range selectors, they may overlap, or may not agree.
                Outer ranges allowed by say a date range selector... may not be allowed by a tag selector.
                We have a very simple impl: we don't intersect/union ranges yet.
                Instead, we ensure that the innerRange is not rejected by any outerRanges
             */
            for (const outerRanges of this.textRanges) {
                if (!outerRanges.isInRange(innerRange)) {
                    return false;
                }
            }
        }
        return true;
    }
}
export class TermSet {
    constructor(terms) {
        this.terms = new Map();
        if (terms) {
            this.addOrUnion(terms);
        }
    }
    get size() {
        return this.terms.size;
    }
    add(term) {
        const existingTerm = this.terms.get(term.text);
        if (existingTerm) {
            return false;
        }
        this.terms.set(term.text, term);
        return true;
    }
    addOrUnion(terms) {
        if (terms === undefined) {
            return;
        }
        if (Array.isArray(terms)) {
            for (const term of terms) {
                this.addOrUnion(term);
            }
        }
        else {
            const term = terms;
            const existingTerm = this.terms.get(term.text);
            if (existingTerm) {
                const existingScore = existingTerm.weight ?? 0;
                const newScore = term.weight ?? 0;
                if (existingScore < newScore) {
                    existingTerm.weight = newScore;
                }
            }
            else {
                this.terms.set(term.text, term);
            }
        }
    }
    get(term) {
        return typeof term === "string"
            ? this.terms.get(term)
            : this.terms.get(term.text);
    }
    getWeight(term) {
        return this.terms.get(term.text)?.weight;
    }
    has(term) {
        return this.terms.has(term.text);
    }
    remove(term) {
        this.terms.delete(term.text);
    }
    clear() {
        this.terms.clear();
    }
    values() {
        return this.terms.values();
    }
}
export class PropertyTermSet {
    constructor(terms = new Map()) {
        this.terms = terms;
    }
    add(propertyName, propertyValue) {
        const key = this.makeKey(propertyName, propertyValue);
        const existingTerm = this.terms.get(key);
        if (!existingTerm) {
            this.terms.set(key, propertyValue);
        }
    }
    has(propertyName, propertyValue) {
        const key = this.makeKey(propertyName, propertyValue);
        return this.terms.has(key);
    }
    clear() {
        this.terms.clear();
    }
    makeKey(propertyName, propertyValue) {
        return propertyName + ":" + propertyValue.text;
    }
}
/**
 * Unions two un-sorted arrays
 * @param xArray
 * @param yArray
 */
export function unionArrays(x, y) {
    if (x) {
        if (y) {
            return [...union(x.values(), y.values())];
        }
        return x;
    }
    return y;
}
/**
 * Unions two un-sorted iterators/arrays using a set
 * @param xArray
 * @param yArray
 */
function* union(xArray, yArray) {
    const x = Array.isArray(xArray) ? xArray.values() : xArray;
    const y = Array.isArray(yArray) ? yArray.values() : yArray;
    let unionSet = new Set();
    let xVal = x.next();
    while (!xVal.done) {
        unionSet.add(xVal.value);
        xVal = x.next();
    }
    let yVal = y.next();
    while (!yVal.done) {
        unionSet.add(yVal.value);
        yVal = y.next();
    }
    for (const value of unionSet.values()) {
        yield value;
    }
}
//# sourceMappingURL=collections.js.map