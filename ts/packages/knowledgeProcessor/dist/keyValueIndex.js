// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, createObjectFolder, } from "typeagent";
import { removeUndefined, union } from "./setOperations.js";
export async function createIndexFolder(folderPath, folderSettings, fSys) {
    const indexFolder = await createObjectFolder(folderPath, folderSettings, fSys);
    return {
        get,
        getMultiple,
        put,
        replace,
        remove,
    };
    async function get(id) {
        return indexFolder.get(id);
    }
    async function getMultiple(ids, concurrency) {
        const values = await asyncArray.mapAsync(ids, concurrency ?? 1, (id) => indexFolder.get(id));
        return removeUndefined(values);
    }
    async function put(postings, id) {
        postings = preparePostings(postings);
        const existingPostings = id ? await indexFolder.get(id) : undefined;
        const updatedPostings = existingPostings && existingPostings.length > 0
            ? [...union(existingPostings, postings)]
            : postings;
        return await indexFolder.put(updatedPostings, id);
    }
    function replace(postings, id) {
        return indexFolder.put(postings, id);
    }
    function remove(id) {
        return indexFolder.remove(id);
    }
    function preparePostings(postings) {
        return postings ? postings.sort() : [];
    }
}
//# sourceMappingURL=keyValueIndex.js.map