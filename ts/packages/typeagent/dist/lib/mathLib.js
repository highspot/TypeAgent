"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.angleDegreesFromCosine = exports.max = exports.randomIntInRange = exports.randomInt = void 0;
function randomInt() {
    return randomIntInRange(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}
exports.randomInt = randomInt;
function randomIntInRange(min, max) {
    // range is inclusive
    // Given range of numbers, the random # takes a fraction of that range and then offsets it by min
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.randomIntInRange = randomIntInRange;
function max(items, getter) {
    let maxValue = Number.MIN_VALUE;
    let maxItem;
    for (const item of items) {
        const cmpValue = getter(item);
        if (cmpValue > maxValue) {
            maxValue = cmpValue;
            maxItem = item;
        }
    }
    return maxItem;
}
exports.max = max;
function angleDegreesFromCosine(cos) {
    const radians = Math.acos(cos);
    return radians * (180 / Math.PI);
}
exports.angleDegreesFromCosine = angleDegreesFromCosine;
//# sourceMappingURL=mathLib.js.map