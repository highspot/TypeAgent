// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import registerDebug from "debug";
import { importConstructions } from "../constructions/importConstructions.js";
import { ConstructionCache } from "../indexBrowser.js";
import { printConstructionCache, } from "../constructions/constructionPrint.js";
const debugConstMatch = registerDebug("typeagent:const:match");
const defaultConfig = {
    mergeMatchSets: false,
    cacheConflicts: false,
};
async function loadConstructionCache(constructionFilePath, explainerName) {
    if (!fs.existsSync(constructionFilePath)) {
        throw new Error(`File '${constructionFilePath}' does not exist.`);
    }
    const data = await fs.promises.readFile(constructionFilePath, "utf8");
    if (data === "") {
        // empty file to indicate an new/empty cache.
        return new ConstructionCache(explainerName);
    }
    const cache = ConstructionCache.fromJSON(JSON.parse(data));
    if (cache.explainerName !== explainerName) {
        throw new Error(`Construction cache '${constructionFilePath}' is for explainer '${cache.explainerName}', not '${explainerName}'`);
    }
    return cache;
}
export class ConstructionStoreImpl {
    constructor(explainerName, cacheOptions) {
        this.explainerName = explainerName;
        this.cache = undefined;
        this.builtInCache = undefined;
        this.builtInCacheFilePath = undefined;
        this.modified = false;
        this.filePath = undefined;
        // Configs
        this.autoSave = false;
        this.config = { ...defaultConfig };
        if (cacheOptions) {
            this.setConfig(cacheOptions);
        }
    }
    ensureCache() {
        if (this.cache === undefined) {
            return this.createCache();
        }
        return this.cache;
    }
    createCache() {
        this.cache = new ConstructionCache(this.explainerName);
        return this.cache;
    }
    isEnabled() {
        return this.cache !== undefined;
    }
    isModified() {
        return this.modified;
    }
    getFilePath() {
        return this.filePath;
    }
    isAutoSave() {
        return this.autoSave && this.filePath !== undefined;
    }
    doAutoSave() {
        if (this.isAutoSave()) {
            return this.save();
        }
    }
    getConfig() {
        return { ...this.config };
    }
    setConfig(options) {
        const changed = {};
        const keys = Object.keys(defaultConfig);
        for (const key of keys) {
            const value = options[key];
            if (value !== undefined && this.config[key] !== value) {
                this.config[key] = value;
                changed[key] = value;
            }
        }
        return changed;
    }
    async setBuiltInCache(builtInCacheFilePath) {
        this.builtInCache =
            builtInCacheFilePath !== undefined
                ? await loadConstructionCache(builtInCacheFilePath, this.explainerName)
                : undefined;
        this.builtInCacheFilePath = builtInCacheFilePath;
    }
    async newCache(filePath) {
        this.createCache();
        this.modified = !!filePath;
        this.filePath = filePath;
        await this.doAutoSave();
    }
    async import(data, getExplainer, schemaInfoProvider, ignoreSourceHash = false) {
        const cache = this.ensureCache();
        const result = importConstructions(data, cache, getExplainer, this.config.mergeMatchSets, this.config.cacheConflicts, schemaInfoProvider, ignoreSourceHash);
        this.modified = true;
        const p = this.doAutoSave();
        // Not strictly necessary, but good for have consistent timing when construction match a construction
        cache.forceRegexp();
        await p;
        return result;
    }
    async load(filePath) {
        const constructionFilePath = path.resolve(filePath);
        this.cache = await loadConstructionCache(constructionFilePath, this.explainerName);
        this.modified = false;
        this.filePath = constructionFilePath;
    }
    async save(filePath) {
        const outFile = filePath ? path.resolve(filePath) : this.filePath;
        if (outFile === undefined) {
            throw new Error("No output file specified");
        }
        if (this.cache === undefined) {
            throw new Error("Construction cache not initialized");
        }
        if (outFile === this.filePath && this.modified === false) {
            return false;
        }
        const dir = path.dirname(outFile);
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
        await fs.promises.writeFile(outFile, JSON.stringify(this.cache, undefined, 2));
        this.filePath = outFile;
        this.modified = false;
        return true;
    }
    async setAutoSave(autoSave) {
        this.autoSave = autoSave;
        if (this.filePath !== undefined && autoSave) {
            await this.save();
        }
    }
    clear() {
        this.cache = undefined;
        this.builtInCache = undefined;
        this.builtInCacheFilePath = undefined;
        this.modified = false;
        this.filePath = undefined;
    }
    async delete(namespace, id) {
        if (this.cache === undefined) {
            throw new Error("Construction cache not initialized");
        }
        const count = this.cache.delete(namespace, id);
        if (count === -1) {
            throw new Error(`Invalid cache namespace '${namespace}'.`);
        }
        if (count === 0) {
            throw new Error(`Construction ${id} not found in cache namespace '${namespace}'.`);
        }
        this.modified = true;
        await this.doAutoSave();
    }
    getInfo(filter) {
        if (this.cache === undefined) {
            return undefined;
        }
        const constructionCount = this.cache.count;
        const builtInConstructionCount = this.builtInCache?.count;
        return {
            filePath: this.filePath,
            modified: this.modified,
            constructionCount: this.cache.count,
            filteredConstructionCount: filter
                ? this.cache.getFilteredCount(filter)
                : constructionCount,
            builtInCacheFilePath: this.builtInCacheFilePath,
            builtInConstructionCount,
            filteredBuiltInConstructionCount: filter
                ? this.builtInCache?.getFilteredCount(filter)
                : builtInConstructionCount,
            config: this.getConfig(),
        };
    }
    print(options) {
        const cache = options.builtin ? this.builtInCache : this.cache;
        if (cache === undefined) {
            throw new Error(`${options.builtin ? "Built-in construction" : "Construction"} cache not initialized`);
        }
        printConstructionCache(cache, options);
    }
    /**
     * Add a construction to the cache
     * @param namespaceKeys separate the construction based on the schema name and hash in the action.  Used to quickly enable/disable construction based on translator is enabled
     * @param construction the construction to add
     * @returns the result of the construction addition
     */
    async addConstruction(namespaceKeys, construction) {
        if (this.cache === undefined) {
            throw new Error("Construction cache not initialized");
        }
        const result = this.cache.addConstruction(namespaceKeys, construction, this.config.mergeMatchSets, this.config.cacheConflicts);
        this.modified = true;
        const p = this.doAutoSave();
        if (result.added) {
            // Not strictly necessary, but good for have consistent timing when construction match a construction
            this.cache.forceRegexp();
        }
        await p;
        return result;
    }
    /**
     * Try to match the request and transform it into action using constructions
     *
     * @param request The request to match
     * @param translatorName optional scoping to only match against single translator
     * @returns All possible matches sorted by some heuristics of the likeliest match
     */
    match(request, options) {
        if (this.cache === undefined) {
            throw new Error("Construction cache not initialized");
        }
        let matches = this.cache.match(request, options);
        if (matches.length === 0 && this.builtInCache !== undefined) {
            matches = this.builtInCache.match(request, options);
        }
        if (debugConstMatch.enabled) {
            debugConstMatch(`Found ${matches.length} construction(s) for '${request}':`);
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const actionStr = chalk.green(match.match.actions);
                const constructionStr = chalk.grey(`(${match.construction})`);
                const message = [
                    `[${i.toString().padStart(3)}]       Action: ${actionStr}`,
                    `             Const: [${match.construction.id}]${constructionStr}`,
                    `    Implicit Count: ${match.construction.implicitParameterCount}`,
                    `Non Optional Count: ${match.nonOptionalCount}`,
                    `     Matched Count: ${match.matchedCount}`,
                    `   Wild Char Count: ${match.wildcardCharCount}`,
                ];
                debugConstMatch(message.join("\n"));
            }
        }
        return matches;
    }
    async prune(filter) {
        if (this.cache === undefined) {
            throw new Error("Construction cache not initialized");
        }
        const count = this.cache.prune(filter);
        this.modified = true;
        await this.doAutoSave();
        return count;
    }
}
//# sourceMappingURL=store.js.map