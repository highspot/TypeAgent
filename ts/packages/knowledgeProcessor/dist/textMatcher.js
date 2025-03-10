// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray } from "typeagent";
import { removeUndefined } from "./setOperations.js";
/**
 * Creates an alias matcher using the given storage provider and text table.
 * textTable contains the text entries for which you create aliases
 * You can add one or aliases for each entry in text table.
 * @param textTable
 * @param storageProvider
 * @param basePath
 * @param name
 * @param textIdType
 * @returns
 */
export async function createAliasMatcher(textTable, storageProvider, basePath, name, textIdType) {
    const aliases = await storageProvider.createTextIndex({ caseSensitive: false, concurrency: 1 }, basePath, name, textIdType);
    const thisMatcher = {
        entries,
        exists,
        addAlias,
        removeAlias,
        match,
        getByAlias,
    };
    return thisMatcher;
    async function* entries() {
        for await (const alias of aliases.text()) {
            const texts = await getByAlias(alias);
            if (texts && texts.length > 0) {
                yield { name: alias, value: texts };
            }
        }
    }
    async function addAlias(alias, targetText) {
        const textId = await textTable.getId(targetText);
        if (textId) {
            // This will ensure no duplicates
            return aliases.put(alias, [textId]);
        }
        return undefined;
    }
    async function removeAlias(alias, text) {
        const aliasId = await aliases.getId(alias);
        if (aliasId) {
            const textId = await textTable.getId(text);
            if (textId) {
                await aliases.remove(aliasId, textId);
            }
        }
    }
    async function match(text) {
        return aliases.get(text);
    }
    async function exists(alias, targetText) {
        const targetTextId = await textTable.getId(targetText);
        if (targetTextId) {
            const targetIds = await aliases.get(alias);
            if (targetIds) {
                return targetIds.indexOf(targetTextId) >= 0;
            }
        }
        return false;
    }
    async function getByAlias(alias) {
        const textIds = await match(alias);
        if (textIds && textIds.length > 0) {
            const texts = await asyncArray.mapAsync(textIds, 1, (id) => textTable.getText(id));
            return removeUndefined(texts);
        }
        return undefined;
    }
}
//# sourceMappingURL=textMatcher.js.map