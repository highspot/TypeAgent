// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getTypeSerializer, sql_makeInClause, tablePath, } from "./common.js";
import { createKeyValueTable } from "./keyValueTable.js";
import { TextBlockType, } from "knowledge-processor";
import { asyncArray, collections, createSemanticIndex, } from "typeagent";
import { createVectorTable } from "./vectorTable.js";
import * as knowLib from "knowledge-processor";
export function createStringTable(db, tableName, caseSensitive = false, ensureExists = true) {
    const schemaSql = `  
    CREATE TABLE IF NOT EXISTS ${tableName} (  
      stringId INTEGER PRIMARY KEY AUTOINCREMENT,
      value TEXT ${caseSensitive ? "" : "COLLATE NOCASE"} NOT NULL,
      UNIQUE(value)  
    );`;
    if (ensureExists) {
        db.exec(schemaSql);
    }
    const sql_entries = db.prepare(`SELECT * from ${tableName}`);
    const sql_ids = db.prepare(`SELECT stringId from ${tableName} ORDER BY stringId ASC`);
    const sql_values = db.prepare(`SELECT value from ${tableName}`);
    const sql_exists = db.prepare(`SELECT 1 from ${tableName} WHERE value = ?`);
    const sql_getId = db.prepare(`SELECT stringId from ${tableName} WHERE value = ?`);
    const sql_getText = db.prepare(`SELECT value from ${tableName} WHERE stringId = ?`);
    const sql_add = db.prepare(`INSERT OR IGNORE INTO ${tableName} (value) VALUES (?)`);
    const sql_remove = db.prepare(`DELETE FROM ${tableName} WHERE value = ?`);
    return {
        tableName,
        schemaSql,
        ids,
        values,
        entries,
        exists,
        getId,
        getIds,
        getText,
        getTexts,
        add,
        remove,
    };
    function* entries() {
        for (const row of sql_entries.iterate()) {
            yield row;
        }
    }
    function* ids() {
        for (const row of sql_ids.iterate()) {
            yield row.stringId;
        }
    }
    function* values() {
        for (const row of sql_values.iterate()) {
            yield row.value;
        }
    }
    function exists(value) {
        const row = sql_exists.get(value);
        return row !== undefined;
    }
    function getId(value) {
        const row = sql_getId.get(value);
        return row ? row.stringId : undefined;
    }
    function* getIds(values) {
        if (values.length > 0) {
            const inClause = sql_makeInClause(values);
            const sql = `SELECT stringId from ${tableName} WHERE value IN (${inClause})`;
            const stmt = db.prepare(sql);
            let rows = stmt.all();
            for (const row of rows) {
                yield row.stringId;
            }
        }
    }
    function getText(id) {
        const row = sql_getText.get(id);
        return row ? row.value : undefined;
    }
    function* getTexts(ids) {
        if (ids.length > 0) {
            const stmt = db.prepare(`SELECT value from ${tableName} WHERE stringId IN (${ids})`);
            let rows = stmt.iterate();
            for (const row of rows) {
                yield row.value;
            }
        }
    }
    function add(values) {
        if (typeof values === "string") {
            return addOne(values);
        }
        else {
            const ids = [];
            for (const value of values) {
                ids.push(addOne(value));
            }
            return ids;
        }
    }
    function addOne(value) {
        if (!value) {
            throw Error("value is empty");
        }
        const result = sql_add.run(value);
        if (result.changes > 0) {
            return { id: result.lastInsertRowid, isNew: true };
        }
        const row = sql_getId.get(value);
        return { id: row.stringId, isNew: false };
    }
    function remove(value) {
        sql_remove.run(value);
    }
}
export async function createTextIndex(settings, db, baseName, textIdType, valueType, ensureExists = true) {
    const [isIdInt, serializer] = getTypeSerializer(textIdType);
    const textTable = createStringTable(db, tablePath(baseName, "entries"), false, ensureExists);
    const postingsTable = createKeyValueTable(db, tablePath(baseName, "postings"), "INTEGER", valueType, ensureExists);
    const sql_getPostings = db.prepare(`SELECT valueId 
         FROM ${textTable.tableName} 
         INNER JOIN ${postingsTable.tableName} 
         ON keyId = stringId          
         WHERE value = ? 
         ORDER BY valueId ASC`);
    const sql_getFreq = db.prepare(`SELECT count(valueId) as count 
         FROM ${textTable.tableName} 
         INNER JOIN ${postingsTable.tableName} 
         ON keyId = stringId          
         WHERE value = ?`);
    let [vectorStore, semanticIndex] = settings.semanticIndex !== undefined && settings.semanticIndex
        ? createVectorIndex()
        : [undefined, undefined];
    return {
        text: () => textTable.values(),
        ids,
        entries,
        get,
        getFrequency,
        getById,
        getByIds,
        getId,
        getIds,
        getText,
        getExactHits,
        getNearest,
        getNearestMultiple,
        getNearestText,
        getNearestTextMultiple,
        getNearestHits,
        getNearestHitsMultiple,
        put,
        putMultiple,
        addSources,
        nearestNeighbors,
        nearestNeighborsText,
        nearestNeighborsPairs,
        remove,
    };
    function createVectorIndex() {
        const store = createVectorTable(db, tablePath(baseName, "embeddings"), "INTEGER");
        const index = createSemanticIndex(store, settings.embeddingModel);
        return [store, index];
    }
    async function* ids() {
        for (const value of textTable.ids()) {
            yield serializer.serialize(value);
        }
    }
    async function* entries() {
        for (const entry of textTable.entries()) {
            yield {
                type: TextBlockType.Sentence,
                value: entry.value,
                sourceIds: postingsTable.getSync(entry.stringId),
            };
        }
    }
    function get(text) {
        return Promise.resolve(getSync(text));
    }
    function getFrequency(text) {
        const row = sql_getFreq.get(text);
        const count = row ? row.count : 0;
        return Promise.resolve(count);
    }
    function getSync(text) {
        const rows = sql_getPostings.all(text);
        return rows.length > 0
            ? rows.map((r) => r.valueId)
            : undefined;
    }
    function getById(id) {
        return postingsTable.get(serializer.deserialize(id));
    }
    function getByIds(ids) {
        const postings = ids.map((id) => postingsTable.getSync(serializer.deserialize(id)));
        return Promise.resolve(postings);
    }
    function getId(text) {
        return Promise.resolve(serializer.serialize(textTable.getId(text)));
    }
    function getIds(texts) {
        // TODO: use IN clause
        return Promise.resolve(texts.map((t) => serializer.serialize(textTable.getId(t))));
    }
    function getText(id) {
        return Promise.resolve(textTable.getText(serializer.deserialize(id)));
    }
    async function put(text, postings) {
        let assignedId = textTable.add(text);
        if (postings && postings.length > 0) {
            postingsTable.putSync(postings, assignedId.id);
        }
        if (semanticIndex &&
            (assignedId.isNew || !vectorStore?.exists(assignedId.id))) {
            await semanticIndex.put(text, assignedId.id);
        }
        return serializer.serialize(assignedId.id);
    }
    async function putMultiple(blocks) {
        const ids = [];
        for (const b of blocks) {
            const id = await put(b.value, b.sourceIds);
            ids.push(serializer.serialize(id));
        }
        return ids;
    }
    async function addSources(textId, postings) {
        if (postings && postings.length > 0) {
            postingsTable.putSync(postings, serializer.deserialize(textId));
        }
    }
    function* getExactHits(values, join) {
        // TODO: use a JOIN
        const textIds = [...textTable.getIds(values)];
        const hits = postingsTable.getHits(textIds, join);
        if (hits) {
            for (const hit of hits) {
                yield hit;
            }
        }
    }
    async function getNearest(value, maxMatches, minScore) {
        maxMatches ??= 1;
        let matchedTextIds = await getExactAndNearestTextIds(value, maxMatches, minScore);
        if (matchedTextIds && matchedTextIds.length > 0) {
            // Iterate over matched postings
            const postings = postingsTable.iterateMultiple(matchedTextIds);
            if (postings) {
                return [...postings];
            }
        }
        return [];
    }
    // This can be optimized
    async function getNearestMultiple(values, maxMatches, minScore) {
        const matches = await asyncArray.mapAsync(values, settings.concurrency, (t) => getNearest(t, maxMatches, minScore));
        const combined = knowLib.sets.intersectMultiple(...matches);
        return Array.isArray(combined) ? combined : [...combined];
    }
    async function getNearestHits(value, hitTable, maxMatches, minScore, scoreBoost, aliases) {
        let scoredIds = await getExactAndNearestTextIdsScored(value, maxMatches, minScore, aliases);
        if (scoredIds) {
            scoredIds = boostScore(knowLib.sets.removeUndefined(scoredIds), scoreBoost);
            const scoredPostings = postingsTable.iterateMultipleScored(scoredIds);
            if (scoredPostings) {
                hitTable.addMultipleScored(scoredPostings);
            }
        }
    }
    async function getNearestHitsMultiple(values, hitTable, maxMatches, minScore, scoreBoost, aliases) {
        let matchedTextIds = await asyncArray.mapAsync(values, settings.concurrency, (value) => getExactAndNearestTextIdsScored(value, maxMatches, minScore, aliases));
        if (matchedTextIds && matchedTextIds.length > 0) {
            let scoredIds = knowLib.sets.removeUndefined(matchedTextIds).flat();
            scoredIds = boostScore(scoredIds, scoreBoost);
            const scoredPostings = postingsTable.iterateMultipleScored(scoredIds);
            if (scoredPostings) {
                hitTable.addMultipleScored(scoredPostings);
            }
        }
    }
    async function getNearestText(value, maxMatches, minScore, aliases) {
        maxMatches ??= 1;
        const matches = await getExactAndNearestTextIds(value, maxMatches, minScore, aliases);
        if (matches) {
            return isIdInt
                ? matches
                : matches.map((m) => serializer.serialize(m));
        }
        return [];
    }
    async function getNearestTextMultiple(values, maxMatches, minScore) {
        // TODO: optimize by lowering into DB if possible
        const matches = await asyncArray.mapAsync(values, settings.concurrency, (t) => getNearestText(t, maxMatches, minScore));
        return knowLib.sets.intersectUnionMultiple(...matches) ?? [];
    }
    async function nearestNeighbors(value, maxMatches, minScore) {
        const matches = await nearestNeighborsTextIds(value, maxMatches, minScore);
        const scoredPostings = matches.map((m) => {
            const item = postingsTable.getSync(m.item) ?? [];
            return {
                score: m.score,
                item,
            };
        });
        return scoredPostings;
    }
    async function nearestNeighborsText(value, maxMatches, minScore) {
        if (!semanticIndex) {
            return [];
        }
        let matches = await nearestNeighborsTextIds(value, maxMatches, minScore);
        return isIdInt
            ? matches
            : matches.map((m) => {
                return {
                    score: m.score,
                    item: serializer.serialize(m.item),
                };
            });
    }
    async function nearestNeighborsTextIds(value, maxMatches, minScore) {
        if (!semanticIndex) {
            return [];
        }
        let matches = await semanticIndex.nearestNeighbors(value, maxMatches, minScore);
        // Also do an exact match
        let textId = textTable.getId(value);
        if (textId) {
            // Remove prior match
            const pos = matches.findIndex((m) => m.item === textId);
            if (pos >= 0) {
                matches.splice(pos, 1);
            }
            matches.splice(0, 0, { score: 1.0, item: textId });
        }
        return matches;
    }
    async function nearestNeighborsPairs(value, maxMatches, minScore) {
        const matches = await nearestNeighborsTextIds(value, maxMatches, minScore);
        const results = matches.map((m) => {
            return {
                score: m.score,
                item: {
                    type: TextBlockType.Sentence,
                    value: isIdInt ? m.item : serializer.serialize(m.item),
                    sourceIds: postingsTable.getSync(m.item) ?? [],
                },
            };
        });
        return results;
    }
    // TODO: Optimize
    async function remove(textId, postings) {
        const id = serializer.deserialize(textId);
        const existingPostings = await postingsTable.get(id);
        if (!existingPostings || existingPostings.length === 0) {
            return;
        }
        let updatedPostings = collections.removeItemFromArray(existingPostings, postings);
        if (updatedPostings.length === 0) {
            await postingsTable.remove(id);
        }
        else {
            await postingsTable.replace(updatedPostings, id);
        }
    }
    async function getNearestTextId(value, minScore) {
        const match = await getNearestTextIdWithScore(value, minScore);
        return match ? match.item : undefined;
    }
    async function getExactAndNearestTextIds(value, maxMatches, minScore, aliases) {
        maxMatches ??= 1;
        // Check exact match first
        let matchedIds;
        let exactId = textTable.getId(value);
        if (exactId) {
            matchedIds = [exactId];
        }
        let matchedAliasIds;
        if (aliases) {
            matchedAliasIds = await getTextIdsByAlias(value, aliases);
        }
        let nearestIds;
        if (maxMatches > 1) {
            nearestIds = await getNearestTextIds(value, maxMatches, minScore);
        }
        else if (!exactId) {
            const nearestId = await getNearestTextId(value, minScore);
            if (nearestId) {
                nearestIds = [nearestId];
            }
        }
        matchedIds = [
            ...knowLib.sets.unionMultiple(matchedIds, matchedAliasIds, nearestIds),
        ];
        return matchedIds;
    }
    async function getExactAndNearestTextIdsScored(value, maxMatches, minScore, aliases) {
        maxMatches ??= 1;
        // Check exact match first
        let matchedIds;
        let exactId = textTable.getId(value);
        if (exactId) {
            matchedIds = [
                {
                    item: exactId,
                    score: 1.0,
                },
            ];
        }
        let matchedAliasIds;
        if (aliases) {
            matchedAliasIds = await getTextIdsByAliasWithScore(value, aliases);
        }
        let nearestIds;
        if (maxMatches > 1) {
            nearestIds = await getNearestTextIdsWithScore(value, maxMatches, minScore);
        }
        else if (!exactId) {
            const nearestId = await getNearestTextIdWithScore(value, minScore);
            if (nearestId) {
                nearestIds = [nearestId];
            }
        }
        matchedIds = [
            ...knowLib.sets.unionMultipleScored(matchedIds, matchedAliasIds, nearestIds),
        ];
        return matchedIds.length > 0 ? matchedIds : undefined;
    }
    async function getTextIdsByAlias(value, aliases) {
        const matchedTextIds = await aliases.match(value);
        if (matchedTextIds && matchedTextIds.length > 0) {
            return matchedTextIds.map((id) => serializer.deserialize(id));
        }
        return undefined;
    }
    /**
     * Returns textIds of matching aliases, SORTED BY textId
     * @param value
     * @param aliases
     * @returns
     */
    async function getTextIdsByAliasWithScore(value, aliases) {
        const matchedTextIds = await aliases.match(value);
        if (matchedTextIds && matchedTextIds.length > 0) {
            return matchedTextIds.map((id) => {
                return {
                    item: serializer.deserialize(id),
                    score: 1.0,
                };
            });
        }
        return undefined;
    }
    async function getNearestTextIds(value, maxMatches, minScore) {
        const scoredTextIds = await getNearestTextIdsWithScore(value, maxMatches, minScore);
        return scoredTextIds && scoredTextIds.length > 0
            ? scoredTextIds.map((s) => s.item)
            : undefined;
    }
    async function getNearestTextIdWithScore(value, minScore) {
        return semanticIndex
            ? semanticIndex.nearestNeighbor(value, minScore)
            : undefined;
    }
    /**
     * Returns Ids with scores for each Id
     * SORTED BY Ids, not by scores
     * @param value
     * @param maxMatches
     * @param minScore
     * @returns
     */
    async function getNearestTextIdsWithScore(value, maxMatches, minScore) {
        return semanticIndex
            ? sortScoredItems(await semanticIndex.nearestNeighbors(value, maxMatches, minScore))
            : undefined;
    }
    function boostScore(items, boost) {
        if (boost) {
            return items.map((scoredItem) => {
                return {
                    item: scoredItem.item,
                    score: scoredItem.score * boost,
                };
            });
        }
        return items;
    }
    function sortScoredItems(matches) {
        matches.sort((x, y) => x.item - y.item);
        return matches;
    }
}
//# sourceMappingURL=textTable.js.map