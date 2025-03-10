// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { unionArrays, uniqueFrom } from "./setOperations.js";
export function valueToString(value, stringify) {
    if (stringify) {
        return stringify(value);
    }
    if (typeof value === "string") {
        return value;
    }
    return JSON.stringify(value);
}
export var TextBlockType;
(function (TextBlockType) {
    TextBlockType[TextBlockType["Raw"] = 0] = "Raw";
    TextBlockType[TextBlockType["Paragraph"] = 1] = "Paragraph";
    TextBlockType[TextBlockType["Sentence"] = 2] = "Sentence";
    TextBlockType[TextBlockType["Word"] = 3] = "Word";
})(TextBlockType || (TextBlockType = {}));
export function collectBlockIds(blocks) {
    return uniqueFrom(blocks, (b) => b.blockId);
}
export function collectSourceIds(blocks) {
    return blocks ? uniqueFrom(blocks, (b) => b.sourceIds) : undefined;
}
export function collectBlockText(blocks, sep) {
    let allText = "";
    for (const block of blocks) {
        if (allText.length > 0) {
            allText += sep;
        }
        allText += block.value;
    }
    return allText;
}
export function appendTextBlock(dest, newBlock) {
    dest.value += newBlock.value;
    dest.sourceIds = unionArrays(dest.sourceIds, newBlock.sourceIds);
}
export async function getTextBlockSources(store, blocks) {
    const ids = collectSourceIds(blocks);
    if (ids && ids.length > 0) {
        return await store.getMultipleText(ids);
    }
    return undefined;
}
export function* flattenTimestampedBlocks(entries) {
    for (const entry of entries) {
        if (entry) {
            for (const topic of entry.value) {
                yield {
                    timestamp: entry.timestamp,
                    value: topic,
                };
            }
        }
    }
}
//# sourceMappingURL=text.js.map