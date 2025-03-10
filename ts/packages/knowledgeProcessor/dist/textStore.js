// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray } from "typeagent";
import { TextBlockType } from "./text.js";
import { createTemporalLog, } from "./temporal.js";
export async function createTextStore(settings, rootPath, folderSettings, fSys) {
    const corpus = await createTemporalLog(settings, rootPath, folderSettings, fSys);
    return {
        ...corpus,
        entries,
        getText,
        getMultipleText,
    };
    async function* entries() {
        for await (const nv of corpus.all()) {
            const tValue = nv.value;
            yield {
                blockId: nv.name,
                timestamp: tValue.timestamp,
                ...tValue.value,
            };
        }
    }
    async function getText(id) {
        const tValue = await corpus.get(id);
        return tValue ? tValue.value : undefined;
    }
    async function getMultipleText(ids) {
        return await asyncArray.mapAsync(ids, settings.concurrency, async (id) => {
            const block = await getText(id);
            return block ?? emptyBlock();
        });
    }
    function emptyBlock() {
        return {
            type: TextBlockType.Raw,
            value: "",
        };
    }
}
//# sourceMappingURL=textStore.js.map