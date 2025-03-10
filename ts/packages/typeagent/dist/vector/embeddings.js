"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopNCollection = exports.getTopK = exports.createTopNList = exports.indexesOfAllNearest = exports.indexesOfNearest = exports.indexOfNearest = exports.similarity = exports.createNormalized = exports.SimilarityType = void 0;
const vector = __importStar(require("./vector"));
var SimilarityType;
(function (SimilarityType) {
    SimilarityType[SimilarityType["Cosine"] = 0] = "Cosine";
    SimilarityType[SimilarityType["Dot"] = 1] = "Dot";
})(SimilarityType || (exports.SimilarityType = SimilarityType = {}));
/**
 * Converts the given vector into a NormalizedEmbedding
 * @param src source vector
 * @returns a normalized embedding
 */
function createNormalized(src) {
    const embedding = new Float32Array(src);
    vector.normalizeInPlace(embedding);
    return embedding;
}
exports.createNormalized = createNormalized;
/**
 * Returns the similarity between x and y
 * @param x
 * @param y
 * @param type
 * @returns
 */
function similarity(x, y, type) {
    if (type === SimilarityType.Cosine) {
        return vector.cosineSimilarityLoop(x, y, vector.euclideanLength(y));
    }
    return vector.dotProduct(x, y);
}
exports.similarity = similarity;
/**
 * Returns the nearest neighbor to target from the given list of embeddings
 * @param list
 * @param other
 * @param type
 * @returns
 */
function indexOfNearest(list, other, type) {
    let best = { score: Number.MIN_VALUE, item: -1 };
    if (type === SimilarityType.Dot) {
        for (let i = 0; i < list.length; ++i) {
            const score = vector.dotProduct(list[i], other);
            if (score > best.score) {
                best.score = score;
                best.item = i;
            }
        }
    }
    else {
        const otherLen = vector.euclideanLength(other);
        for (let i = 0; i < list.length; ++i) {
            const score = vector.cosineSimilarityLoop(list[i], other, otherLen);
            if (score > best.score) {
                best.score = score;
                best.item = i;
            }
        }
    }
    return best;
}
exports.indexOfNearest = indexOfNearest;
/**
 * Given a list of embeddings and a test embedding, return at most maxMatches ordinals
 * of the nearest items that meet the provided minScore threshold
 * @param list
 * @param other
 * @param maxMatches
 * @param type Note: Most of our embeddings are *normalized* which will run significantly faster with Dot
 * @returns
 */
function indexesOfNearest(list, other, maxMatches, type, minScore = 0) {
    const matches = new TopNCollection(maxMatches, -1);
    if (type === SimilarityType.Dot) {
        for (let i = 0; i < list.length; ++i) {
            const score = vector.dotProduct(list[i], other);
            if (score >= minScore) {
                matches.push(i, score);
            }
        }
    }
    else {
        const otherLen = vector.euclideanLength(other);
        for (let i = 0; i < list.length; ++i) {
            const score = vector.cosineSimilarityLoop(list[i], other, otherLen);
            if (score >= minScore) {
                matches.push(i, score);
            }
        }
    }
    return matches.byRank();
}
exports.indexesOfNearest = indexesOfNearest;
/**
 * Given a list of embeddings and a test embedding, return ordinals
 * of the nearest items that meet the provided minScore threshold
 * @param list
 * @param other
 * @param similarityType
 * @param minScore
 * @returns
 */
function indexesOfAllNearest(list, other, similarityType, minScore) {
    minScore ??= 0;
    const matches = [];
    for (let i = 0; i < list.length; ++i) {
        const score = similarity(list[i], other, similarityType);
        if (score >= minScore) {
            matches.push({ item: i, score });
        }
    }
    matches.sort((x, y) => y.score - x.score);
    return matches;
}
exports.indexesOfAllNearest = indexesOfAllNearest;
function createTopNList(maxMatches) {
    const topN = new TopNCollection(maxMatches, undefined);
    return {
        push: (item, score) => topN.push(item, score),
        byRank: () => topN.byRank(),
        reset: () => topN.reset(),
        valuesByRank: () => topN.valuesByRank(),
    };
}
exports.createTopNList = createTopNList;
function getTopK(items, topK) {
    const topNList = new TopNCollection(topK, undefined);
    for (const scoredItem of items) {
        topNList.push(scoredItem.item, scoredItem.score);
    }
    return topNList.byRank();
}
exports.getTopK = getTopK;
/**
 * Uses a minHeap to maintain only the TopN matches - by rank - in memory at any time.
 * Automatically purges matches that no longer meet the bar
 * This allows us to iterate over very large collections without having to retain every score for a final rank sort
 */
class TopNCollection {
    constructor(maxCount, nullValue) {
        this._items = [];
        this._count = 0;
        this._maxCount = maxCount;
        // The first item is a sentinel, always
        this._items.push({
            score: Number.MIN_VALUE,
            item: nullValue,
        });
    }
    get length() {
        return this._count;
    }
    reset() {
        this._count = 0;
    }
    // Returns the lowest scoring item in the collection
    get pop() {
        return this.removeTop();
    }
    get top() {
        return this._items[1];
    }
    push(item, score) {
        if (this._count === this._maxCount) {
            if (score < this.top.score) {
                return;
            }
            const scoredValue = this.removeTop();
            scoredValue.item = item;
            scoredValue.score = score;
            this._count++;
            this._items[this._count] = scoredValue;
        }
        else {
            this._count++;
            this._items.push({
                item: item,
                score: score,
            });
        }
        this.upHeap(this._count);
    }
    byRank() {
        this.sortDescending();
        this._items.shift();
        return this._items;
    }
    valuesByRank() {
        this.sortDescending();
        this._items.shift();
        return this._items.map((v) => v.item);
    }
    // Heap sort in place
    sortDescending() {
        const count = this._count;
        let i = count;
        while (this._count > 0) {
            // this de-queues the item with the current LOWEST relevancy
            // We take that and place it at the 'back' of the array - thus inverting it
            const item = this.removeTop();
            this._items[i--] = item;
        }
        this._count = count;
    }
    removeTop() {
        if (this._count === 0) {
            throw new Error("Empty queue");
        }
        // At the top
        const item = this._items[1];
        this._items[1] = this._items[this._count];
        this._count--;
        this.downHeap(1);
        return item;
    }
    upHeap(startAt) {
        let i = startAt;
        const item = this._items[i];
        let parent = i >> 1;
        // As long as child has a lower score than the parent, keep moving the child up
        while (parent > 0 && this._items[parent].score > item.score) {
            this._items[i] = this._items[parent];
            i = parent;
            parent = i >> 1;
        }
        // Found our slot
        this._items[i] = item;
    }
    downHeap(startAt) {
        let i = startAt;
        const maxParent = this._count >> 1;
        const item = this._items[i];
        while (i <= maxParent) {
            let iChild = i + i;
            let childScore = this._items[iChild].score;
            // Exchange the item with the smaller of its two children - if one is smaller, i.e.
            // First, find the smaller child
            if (iChild < this._count &&
                childScore > this._items[iChild + 1].score) {
                iChild++;
                childScore = this._items[iChild].score;
            }
            if (item.score <= childScore) {
                // Heap condition is satisfied. Parent <= both its children
                break;
            }
            // Else, swap parent with the smallest child
            this._items[i] = this._items[iChild];
            i = iChild;
        }
        this._items[i] = item;
    }
}
exports.TopNCollection = TopNCollection;
//# sourceMappingURL=embeddings.js.map