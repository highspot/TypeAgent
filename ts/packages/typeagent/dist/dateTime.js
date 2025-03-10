"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMinutesToDate = exports.stringToDate = exports.generateRandomDates = exports.timestampRange = exports.timestampStringUtc = exports.timestampString = exports.parseTimestamped = exports.stringifyTimestamped = void 0;
const mathLib_1 = require("./lib/mathLib");
function stringifyTimestamped(value, timestamp) {
    timestamp ??= new Date();
    const timestamped = {
        timestamp: timestamp.toISOString(),
        value,
    };
    return JSON.stringify(timestamped);
}
exports.stringifyTimestamped = stringifyTimestamped;
function parseTimestamped(json) {
    const obj = JSON.parse(json);
    return {
        value: obj.value,
        timestamp: new Date(obj.timestamp),
    };
}
exports.parseTimestamped = parseTimestamped;
function timestampString(date, sep = true) {
    const year = date.getFullYear().toString();
    const month = numberToString(date.getMonth() + 1, 2);
    const day = numberToString(date.getDate(), 2);
    const hour = numberToString(date.getHours(), 2);
    const minute = numberToString(date.getMinutes(), 2);
    const seconds = numberToString(date.getSeconds(), 2);
    const ms = numberToString(date.getMilliseconds(), 3);
    return sep
        ? `${year}_${month}_${day}_${hour}_${minute}_${seconds}_${ms}`
        : `${year}${month}${day}${hour}${minute}${seconds}${ms}`;
}
exports.timestampString = timestampString;
function timestampStringUtc(date, sep = true) {
    const year = date.getUTCFullYear().toString();
    const month = numberToString(date.getUTCMonth() + 1, 2);
    const day = numberToString(date.getUTCDate(), 2);
    const hour = numberToString(date.getUTCHours(), 2);
    const minute = numberToString(date.getUTCMinutes(), 2);
    const seconds = numberToString(date.getUTCSeconds(), 2);
    const ms = numberToString(date.getUTCMilliseconds(), 3);
    return sep
        ? `${year}_${month}_${day}_${hour}_${minute}_${seconds}_${ms}`
        : `${year}${month}${day}${hour}${minute}${seconds}${ms}`;
}
exports.timestampStringUtc = timestampStringUtc;
function timestampRange(startAt, stopAt) {
    return {
        startTimestamp: timestampString(startAt),
        endTimestamp: stopAt ? timestampString(stopAt) : undefined,
    };
}
exports.timestampRange = timestampRange;
function numberToString(value, length) {
    return value.toString().padStart(length, "0");
}
function* generateRandomDates(startDate, minMsOffset, maxMsOffset) {
    let ticks = startDate.getTime();
    while (true) {
        const offset = (0, mathLib_1.randomIntInRange)(minMsOffset, maxMsOffset);
        ticks += offset;
        yield new Date(ticks);
    }
}
exports.generateRandomDates = generateRandomDates;
function stringToDate(value) {
    if (value) {
        try {
            return new Date(value);
        }
        catch { }
    }
    return undefined;
}
exports.stringToDate = stringToDate;
function addMinutesToDate(date, minutes) {
    const time = date.getTime();
    const offsetMs = minutes * 60 * 1000;
    return new Date(time + offsetMs);
}
exports.addMinutesToDate = addMinutesToDate;
//# sourceMappingURL=dateTime.js.map