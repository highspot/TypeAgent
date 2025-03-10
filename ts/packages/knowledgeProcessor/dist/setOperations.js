// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { mathLib } from "typeagent";
export var SetOp;
(function (SetOp) {
    SetOp[SetOp["Union"] = 0] = "Union";
    SetOp[SetOp["Intersect"] = 1] = "Intersect";
    SetOp[SetOp["IntersectUnion"] = 2] = "IntersectUnion";
})(SetOp || (SetOp = {}));
export function createPostings(ids) {
    const postings = new Uint32Array(ids);
    postings.sort();
    return postings;
}
export function* intersectMerge(xArray, yArray) {
    const x = Array.isArray(xArray) ? xArray.values() : xArray;
    const y = Array.isArray(yArray) ? yArray.values() : yArray;
    let xVal = x.next();
    let yVal = y.next();
    while (!xVal.done && !yVal.done) {
        if (xVal.value === yVal.value) {
            yield xVal.value;
            xVal = x.next();
            yVal = y.next();
        }
        else if (xVal.value < yVal.value) {
            xVal = x.next();
        }
        else {
            yVal = y.next();
        }
    }
}
export function* intersect(xArray, yArray) {
    const x = Array.isArray(xArray) ? xArray.values() : xArray;
    const y = Array.isArray(yArray) ? yArray.values() : yArray;
    const xSet = new Set();
    let xVal = x.next();
    while (!xVal.done) {
        xSet.add(xVal.value);
        xVal = x.next();
    }
    let yVal = y.next();
    while (!yVal.done) {
        if (xSet.has(yVal.value)) {
            yield yVal.value;
        }
        yVal = y.next();
    }
}
export function intersectMultiple(...arrays) {
    let combined;
    for (const array of arrays) {
        if (array) {
            combined = combined ? intersect(combined, array) : array;
        }
    }
    return combined ?? [];
}
export function intersectUnionMultiple(...arrays) {
    // We can to do this more optimally...
    let combined;
    for (const array of arrays) {
        if (array) {
            combined ??= createHitTable();
            combined.addMultiple(array);
        }
    }
    if (!combined || combined.size === 0) {
        return undefined;
    }
    const topKItems = combined.getTop();
    return topKItems.sort();
}
export function* unionMerge(xArray, yArray) {
    const x = Array.isArray(xArray) ? xArray.values() : xArray;
    const y = Array.isArray(yArray) ? yArray.values() : yArray;
    let xVal = x.next();
    let yVal = y.next();
    while (!xVal.done && !yVal.done) {
        if (xVal.value === yVal.value) {
            yield xVal.value;
            xVal = x.next();
            yVal = y.next();
        }
        else if (xVal.value < yVal.value) {
            yield xVal.value;
            xVal = x.next();
        }
        else {
            yield yVal.value;
            yVal = y.next();
        }
    }
    while (!xVal.done) {
        yield xVal.value;
        xVal = x.next();
    }
    while (!yVal.done) {
        yield yVal.value;
        yVal = y.next();
    }
}
export function* union(xArray, yArray) {
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
    /*
    const unionArray = [...unionSet.values()].sort();
    for (const item of unionArray) {
        yield item;
    }
        */
    for (const value of unionSet.values()) {
        yield value;
    }
}
export function unionMultiple(...arrays) {
    let combined;
    for (const array of arrays) {
        if (array) {
            combined = combined ? union(combined, array) : array;
        }
    }
    return combined ?? [];
}
export function* unionScored(xArray, yArray) {
    const x = Array.isArray(xArray)
        ? xArray.values()
        : xArray;
    const y = Array.isArray(yArray)
        ? yArray.values()
        : yArray;
    let xVal = x.next();
    let yVal = y.next();
    while (!xVal.done && !yVal.done) {
        if (xVal.value.item === yVal.value.item) {
            // If both are equal, yield the one with a higher score
            yield xVal.value.score >= yVal.value.score
                ? xVal.value
                : yVal.value;
            xVal = x.next();
            yVal = y.next();
        }
        else if (xVal.value < yVal.value) {
            yield xVal.value;
            xVal = x.next();
        }
        else {
            yield yVal.value;
            yVal = y.next();
        }
    }
    while (!xVal.done) {
        yield xVal.value;
        xVal = x.next();
    }
    while (!yVal.done) {
        yield yVal.value;
        yVal = y.next();
    }
}
export function* unionScoredHash(xArray, yArray) {
    const x = Array.isArray(xArray)
        ? xArray.values()
        : xArray;
    const y = Array.isArray(yArray)
        ? yArray.values()
        : yArray;
    const unionSet = new Map();
    let xVal = x.next();
    while (!xVal.done) {
        unionSet.set(xVal.value.item, xVal.value);
        xVal = x.next();
    }
    let yVal = y.next();
    while (!yVal.done) {
        const existing = unionSet.get(yVal.value.item);
        if (!existing || existing.score < yVal.value.score) {
            unionSet.set(yVal.value.item, yVal.value);
        }
        yVal = y.next();
    }
    return [...unionSet.values()].sort();
}
export function unionMultipleScored(...arrays) {
    let combined;
    for (const array of arrays) {
        if (array) {
            combined = combined ? unionScored(combined, array) : array;
        }
    }
    return combined ?? [];
}
export function* unique(x) {
    let last;
    let xVal = x.next();
    while (!xVal.done) {
        if (xVal.value !== last) {
            yield xVal.value;
            last = xVal.value;
        }
        xVal = x.next();
    }
}
export function* window(x, windowSize) {
    const window = [];
    let xVal = x.next();
    while (!xVal.done) {
        if (window.length === windowSize) {
            yield window;
            window.length = 0;
        }
        window.push(xVal.value);
        xVal = x.next();
    }
    if (window.length > 0) {
        yield window;
    }
}
export function unionArrays(x, y) {
    if (x) {
        if (y) {
            return [...union(x.values(), y.values())];
        }
        return x;
    }
    return y;
}
export function intersectArrays(x, y) {
    if (x && y) {
        return [...intersect(x.values(), y.values())];
    }
    return undefined;
}
export function setFrom(src, callback) {
    const set = new Set();
    for (const item of src) {
        const itemValue = callback ? callback(item) : item;
        if (itemValue) {
            if (Array.isArray(itemValue)) {
                for (const value of itemValue) {
                    set.add(value);
                }
            }
            else {
                set.add(itemValue);
            }
        }
    }
    return set;
}
export function uniqueFrom(src, callback, sort = true) {
    const set = setFrom(src, callback);
    if (set.size > 0) {
        const items = [...set.values()];
        return sort ? items.sort() : items;
    }
    return undefined;
}
export function addToSet(set, values) {
    if (values) {
        for (const value of values) {
            set.add(value);
        }
    }
}
export function intersectSets(x, y) {
    if (x && y) {
        // xValue is smaller than yValues in size
        let xValues = x.size < y.size ? x : y;
        let yValues = x.size < y.size ? y : x;
        let result;
        for (const val of xValues) {
            if (yValues.has(val)) {
                result ??= new Set();
                result.add(val);
            }
        }
        return result;
    }
    else if (x) {
        return x;
    }
    return y;
}
export function unionSets(x, y) {
    if (x && y) {
        // xValue is smaller than yValues in size
        let xValues = x.size < y.size ? x : y;
        let yValues = x.size < y.size ? y : x;
        let result = new Set(yValues);
        addToSet(result, xValues);
        return result;
    }
    else if (x) {
        return x;
    }
    return y;
}
export function intersectUnionSets(x, y) {
    // We can to do this more optimally...
    let combined = createHitTable();
    if (x) {
        combined.addMultiple(x.values());
    }
    if (y) {
        combined.addMultiple(y.values());
    }
    return new Set(combined.getTop());
}
export function flatten(src, callback, sort = true) {
    const flat = [];
    for (const item of src) {
        const itemValue = callback ? callback(item) : item;
        if (itemValue) {
            if (Array.isArray(itemValue)) {
                for (const value of itemValue) {
                    if (value) {
                        flat.push(value);
                    }
                }
            }
            else {
                flat.push(itemValue);
            }
        }
    }
    return sort ? flat.sort() : flat;
}
export function removeUndefined(src) {
    return src.filter((item) => item !== undefined);
}
export function removeDuplicates(src, comparer) {
    if (src === undefined || src.length <= 1) {
        return src;
    }
    src.sort(comparer);
    let prev = src[0];
    let i = 1;
    while (i < src.length) {
        if (comparer(prev, src[i]) === 0) {
            src.splice(i, 1);
        }
        else {
            prev = src[i];
            i++;
        }
    }
    return src;
}
/**
 * Tracks the # of hits on an object of arbitrary type T
 * Internally uses the Map object
 * @param keyAccessor (optional) By default, when T is a non-primitive type, the map object uses object identity as the 'key'.
 * This is not always what we want, as we may want to treat different object with different identities as the same..
 * @param fixedScore (optional) Overrides an supplied scores. E.g. set this to 1.0 to get a hit *counter*
 * @returns
 */
export function createHitTable(keyAccessor, fixedScore) {
    const map = new Map();
    return {
        get size() {
            return map.size;
        },
        keys: () => map.keys(),
        values: () => map.values(),
        get,
        set,
        getScore,
        add,
        addMultiple,
        addMultipleScored,
        byHighestScore,
        getTop,
        getTopK,
        getByKey,
        clear: () => map.clear(),
        roundScores,
    };
    function get(value) {
        const key = getKey(value);
        return map.get(key);
    }
    function set(key, value) {
        map.set(key, value);
    }
    function getScore(value) {
        const key = getKey(value);
        const scoredItem = map.get(key);
        return scoredItem ? scoredItem.score : 0;
    }
    function add(value, score) {
        score = fixedScore ? fixedScore : score ?? 1.0;
        const key = getKey(value);
        let scoredItem = map.get(key);
        if (scoredItem) {
            scoredItem.score += score;
        }
        else {
            scoredItem = { item: value, score };
            map.set(key, scoredItem);
        }
        return scoredItem.score;
    }
    function addMultiple(values, score) {
        const x = Array.isArray(values) ? values.values() : values;
        let xValue = x.next();
        while (!xValue.done) {
            add(xValue.value, score);
            xValue = x.next();
        }
    }
    function addMultipleScored(values) {
        const x = Array.isArray(values)
            ? values.values()
            : values;
        let xValue = x.next();
        while (!xValue.done) {
            add(xValue.value.item, xValue.value.score);
            xValue = x.next();
        }
    }
    function byHighestScore() {
        if (map.size === 0) {
            return [];
        }
        // Descending order
        let valuesByScore = [...map.values()].sort((x, y) => y.score - x.score);
        return valuesByScore;
    }
    // TODO: Optimize.
    /**
     * Get the top scoring items
     * @returns
     */
    function getTop() {
        if (map.size === 0) {
            return [];
        }
        let maxScore = mathLib.max(map.values(), (v) => v.score).score;
        let top = [];
        for (const value of map.values()) {
            if (value.score === maxScore) {
                top.push(value.item);
            }
        }
        return top;
    }
    // TODO: Optimize.
    /**
     * Return the items with the 'k' highest scores
     * @param k if <= 0, returns all
     * @returns array of items
     */
    function getTopK(k) {
        const topItems = byHighestScore();
        if (k === map.size || k <= 0) {
            return topItems.map((i) => i.item);
        }
        const topK = [];
        if (k < 1 || topItems.length === 0) {
            return topK;
        }
        // Stop when we have matched k highest scores
        let prevScore = topItems[0].score;
        let kCount = 1;
        for (let i = 0; i < topItems.length; ++i) {
            const score = topItems[i].score;
            if (score < prevScore) {
                kCount++;
                if (kCount > k) {
                    break;
                }
                prevScore = score;
            }
            topK.push(topItems[i].item);
        }
        return topK;
    }
    function getByKey(key) {
        return map.get(key);
    }
    function getKey(value) {
        return keyAccessor ? keyAccessor(value) : value;
    }
    function roundScores(decimalPlace) {
        let roundUnit = Math.pow(10, decimalPlace);
        if (roundUnit > 0) {
            for (const scoredItem of map.values()) {
                scoredItem.score =
                    Math.round(scoredItem.score * roundUnit) / roundUnit;
            }
        }
    }
}
//# sourceMappingURL=setOperations.js.map