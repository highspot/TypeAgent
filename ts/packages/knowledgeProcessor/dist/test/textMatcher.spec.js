// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createSemanticList, cleanDir } from "typeagent";
import { getRootDataPath, hasTestKeys, testIf } from "./testCore.js";
import { openai } from "aiclient";
import { createEntitySearchOptions } from "../src/conversation/entities.js";
import { createAliasMatcher } from "../src/textMatcher.js";
import { createFileSystemStorageProvider } from "../src/storageProvider.js";
import path from "path";
//import { TextBlock, TextBlockType } from "./text.js";
describe("TextMatchers", () => {
    const testTimeoutMs = 1000 * 60 * 5;
    let embeddingModel;
    let names = [
        "Kevin",
        "Kevin Andersen",
        "Kevin Durant",
        "Jane Austen",
        "Jane Porter",
        "Jane",
        "Agatha Christie",
        "Agatha",
        "Oscar",
        "Oscar Wilde",
        "Patrick",
        "Patrick Stewart",
    ];
    beforeAll(() => {
        if (hasTestKeys()) {
            embeddingModel = openai.createEmbeddingModel();
        }
    });
    testIf("entityNames", () => hasTestKeys(), async () => {
        const semanticList = createSemanticList(embeddingModel);
        await semanticList.pushMultiple(names);
        const searchOptions = createEntitySearchOptions();
        searchOptions.nameSearchOptions?.maxMatches;
        const query = "Kevin";
        const matches = await semanticList.nearestNeighbors(query, searchOptions.nameSearchOptions?.maxMatches ??
            searchOptions.maxMatches, searchOptions.nameSearchOptions?.minScore ??
            searchOptions.minScore);
        expect(matches.length).toBeGreaterThan(0);
        const expectedK = names.reduce((total, m) => (m.startsWith(query) ? total + 1 : total), 0);
        const matchCount = matches.reduce((total, m) => m.item.startsWith(query) ? total + 1 : total, 0);
        expect(matchCount).toBe(expectedK);
    }, testTimeoutMs);
    test("aliasMatcher", async () => {
        const rootPath = path.join(getRootDataPath(), "aliasMatcher");
        await cleanDir(rootPath);
        const provider = createFileSystemStorageProvider(rootPath);
        const nameMap = new NameMap();
        const index = await createAliasMatcher(nameMap, provider, rootPath, "aliasMatcher", "TEXT");
        await testAdd("Jane Austen", "Austen", 1);
        await testAdd("Jane Austen", "Jane", 1);
        await testAdd("Jane Porter", "Porter", 1);
        await testAdd("Jane Porter", "Jane", 2);
        await testRemove("Jane Austen", "Austen", 0);
        await testRemove("Jane Austen", "Jane", 1);
        async function testAdd(name, alias, expectedMatchCount) {
            await index.addAlias(alias, name);
            let matches = await index.match(alias);
            expect(matches).toBeDefined();
            if (matches) {
                const nameId = await nameMap.getId(name);
                expect(matches).toHaveLength(expectedMatchCount);
                expect(matches).toContain(nameId);
            }
        }
        async function testRemove(name, alias, expectedPostingsLength) {
            await index.removeAlias(alias, name);
            let aliasPostings = await index.match(alias);
            if (expectedPostingsLength > 0) {
                expect(aliasPostings).toBeDefined();
                expect(aliasPostings).toHaveLength(expectedPostingsLength);
            }
            else {
                expect(aliasPostings).toBeUndefined();
            }
        }
    }, testTimeoutMs);
    /*
    function nameBlocks(): TextBlock[] {
        return names.map<TextBlock>((value, i) => {
            return {
                value,
                type: TextBlockType.Sentence,
                sourceIds: [i.toString()],
            };
        });
    }
        */
    function nameMap() {
        const map = new Map();
        for (let i = 0; i < names.length; ++i) {
            map.set(names[i], i.toString());
        }
        return map;
    }
    class NameMap {
        constructor() {
            this.map = nameMap();
        }
        getId(text) {
            return Promise.resolve(this.map.get(text));
        }
        getText(id) {
            for (const entry of this.map.entries()) {
                if (entry[1] === id) {
                    return Promise.resolve(entry[0]);
                }
            }
            return Promise.resolve(undefined);
        }
    }
});
//# sourceMappingURL=textMatcher.spec.js.map