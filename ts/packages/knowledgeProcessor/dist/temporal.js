// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, collections, createObjectFolder, dateTime, ensureUniqueObjectName,
//generateMonotonicName,
 } from "typeagent";
import { intersectMultiple, setFrom } from "./setOperations.js";
import { pathToFileURL } from "url";
import path from "path";
import { valueToString } from "./text.js";
/**
 * Create a temporal log using files
 * @param settings
 * @param folderPath
 * @param folderSettings
 * @param fSys
 * @returns
 */
export async function createTemporalLog(settings, folderPath, folderSettings, fSys) {
    // Timestamped sequence of topics, as they were seen
    const sequence = await createObjectFolder(folderPath, folderSettings, fSys);
    return {
        size: sequence.size,
        all,
        allObjects,
        get,
        getMultiple,
        getIdsInRange,
        getEntriesInRange,
        put,
        newestObjects,
        getNewest,
        getOldest,
        getTimeRange,
        getUrl,
        remove,
        removeInRange,
        clear: sequence.clear,
    };
    async function* all() {
        for await (const nv of sequence.all()) {
            yield {
                name: nv.name,
                value: dateTime.parseTimestamped(nv.value),
            };
        }
    }
    async function* allObjects() {
        for await (const nv of sequence.all()) {
            yield dateTime.parseTimestamped(nv.value);
        }
    }
    async function* newestObjects() {
        for await (const nv of sequence.newest()) {
            yield dateTime.parseTimestamped(nv.value);
        }
    }
    async function get(id) {
        return getTimestampedObject(sequence, id);
    }
    async function getMultiple(ids) {
        return asyncArray.mapAsync(ids, settings.concurrency, async (id) => get(id));
    }
    async function getIdsInRange(startAt, stopAt) {
        const allIds = await sequence.allNames();
        const range = collections.getInRange(allIds, dateTime.timestampString(startAt), stopAt ? dateTime.timestampString(stopAt) : undefined, strCmp);
        return range;
    }
    async function getEntriesInRange(startAt, stopAt) {
        const ids = await getIdsInRange(startAt, stopAt);
        if (ids.length === 0) {
            return [];
        }
        return (await getMultiple(ids));
    }
    async function getNewest(count) {
        const allIds = await sequence.allNames();
        count = Math.min(allIds.length, count);
        const ids = allIds.slice(allIds.length - count);
        return (await getMultiple(ids));
    }
    async function getOldest(count) {
        const allIds = await sequence.allNames();
        count = Math.min(allIds.length, count);
        const ids = allIds.slice(0, count);
        return (await getMultiple(ids));
    }
    async function getTimeRange() {
        // TODO: cache the time range.
        const allIds = await sequence.allNames();
        if (allIds.length === 0) {
            return undefined;
        }
        const first = await get(allIds[0]);
        if (!first) {
            return undefined;
        }
        const last = await get(allIds[allIds.length - 1]);
        return {
            startDate: first?.timestamp,
            stopDate: last?.timestamp,
        };
    }
    async function put(value, timestamp, id) {
        return putTimestampedObject(sequence, value, timestamp);
    }
    async function remove(id) {
        sequence.remove(id);
    }
    async function removeInRange(startAt, stopAt) {
        const idsToRemove = await getIdsInRange(startAt, stopAt);
        for (const id of idsToRemove) {
            await sequence.remove(id);
        }
    }
    function getUrl(id) {
        return pathToFileURL(path.join(sequence.path, id));
    }
    function strCmp(x, y) {
        return x.localeCompare(y);
    }
}
/**
 * Put an object with an associated timestamp into the given object store
 * @param store
 * @param value
 * @param timestamp
 * @returns
 */
export async function putTimestampedObject(store, value, timestamp) {
    timestamp ??= new Date();
    const tValue = dateTime.stringifyTimestamped(value, timestamp);
    let id = dateTime.timestampString(timestamp);
    id = ensureUniqueObjectName(store, id);
    if (!id) {
        throw new Error(`${store.path}\nCould not create unique id for ${id}`);
    }
    return store.put(tValue, id);
}
/**
 * Get the timestamped object with the given Id from the object folder
 * @param store
 * @param id
 * @returns
 */
export async function getTimestampedObject(store, id) {
    const json = await store.get(id);
    if (json) {
        return dateTime.parseTimestamped(json);
    }
    return undefined;
}
export function itemsFromTemporalSequence(sequence) {
    if (sequence) {
        return [...setFrom(sequence, (value) => value.value).values()].sort();
    }
    return undefined;
}
export function filterTemporalSequence(sequence, requiredValues) {
    const filtered = [];
    for (const value of sequence) {
        const combined = [...intersectMultiple(value.value, requiredValues)];
        if (combined.length > 0) {
            filtered.push({
                timestamp: value.timestamp,
                value: combined,
            });
        }
    }
    return filtered;
}
export function getRangeOfTemporalSequence(sequence) {
    if (!sequence || sequence.length === 0) {
        return undefined;
    }
    return {
        startDate: sequence[0].timestamp,
        stopDate: sequence[sequence.length - 1].timestamp,
    };
}
/**
 * Create a 'window' to track the most recent items in a "stream"
 * Uses a circular array
 * @param windowSize
 * @param stringify
 * @returns
 */
export function createRecentItemsWindow(windowSize, stringify) {
    const entries = new collections.CircularArray(windowSize);
    return {
        getEntries: () => entries.getEntries(),
        push,
        getContext,
        getUnique,
        reset() {
            entries.reset();
        },
    };
    function push(items) {
        if (Array.isArray(items)) {
            for (const item of items) {
                entries.push(item);
            }
        }
        else {
            entries.push(items);
        }
    }
    function getContext(maxContextLength) {
        let sections = [];
        let totalLength = 0;
        // Get the range of sections that could be pushed on, NEWEST first
        for (const item of entries.itemsReverse()) {
            const content = valueToString(item, stringify);
            const nextLength = content.length;
            if (nextLength + totalLength > maxContextLength) {
                break;
            }
            sections.push(content);
            totalLength += nextLength;
        }
        sections.reverse();
        return sections;
    }
    function getUnique() {
        const unique = new Set(entries);
        return unique.size > 0 ? [...unique.values()] : [];
    }
}
//# sourceMappingURL=temporal.js.map