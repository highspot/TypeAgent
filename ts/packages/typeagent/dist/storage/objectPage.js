"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHashObjectFolder = exports.createObjectPage = void 0;
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const objectFolder_1 = require("./objectFolder");
async function createObjectPage(filePath, compareFn, settings, fSys) {
    const pageSettings = settings ?? {};
    const fileSystem = fSys ?? (0, objectFolder_1.fsDefault)();
    let data = (await (0, objectFolder_1.readObjectFromFile)(filePath, pageSettings.deserializer, fileSystem)) ?? [];
    let isDirty = false;
    return {
        get size() {
            return data.length;
        },
        get isDirty() {
            return isDirty;
        },
        getAt,
        indexOf,
        put,
        removeAt,
        save,
    };
    function getAt(pos) {
        return data[pos];
    }
    function indexOf(value) {
        return __1.collections.binarySearch(data, value, compareFn);
    }
    function put(values) {
        if (Array.isArray(values)) {
            for (const value of values) {
                __1.collections.addOrUpdateIntoSorted(data, value, compareFn);
            }
        }
        else {
            __1.collections.addOrUpdateIntoSorted(data, values, compareFn);
        }
        isDirty = true;
    }
    function removeAt(pos) {
        data.splice(pos, 1);
        isDirty = true;
    }
    async function save() {
        if (isDirty) {
            try {
                isDirty = false;
                await (0, objectFolder_1.writeObjectToFile)(filePath, data, pageSettings.serializer, pageSettings.safeWrites);
            }
            catch {
                isDirty = true;
            }
        }
    }
}
exports.createObjectPage = createObjectPage;
async function createHashObjectFolder(folderPath, clean = false, numBuckets = 17, pageSettings, fSys) {
    const fileSystem = fSys ?? (0, objectFolder_1.fsDefault)();
    if (clean) {
        await fileSystem.rmdir(folderPath);
    }
    await fileSystem.ensureDir(folderPath);
    const pageCache = createCache();
    const autoSave = pageCache === undefined;
    return {
        get,
        put,
        remove,
        save,
    };
    async function get(key) {
        const pageName = keyToPageName(key);
        const page = getCachedPage(pageName) ?? (await getPage(pageName));
        const pos = page.indexOf({ key });
        return pos >= 0 ? page.getAt(pos).value : undefined;
    }
    async function put(key, value) {
        const pageName = keyToPageName(key);
        const page = getCachedPage(pageName) ?? (await getPage(pageName));
        page.put({ key, value });
        if (autoSave && page.isDirty) {
            await page.save();
        }
    }
    async function remove(key) {
        const pageName = keyToPageName(key);
        const page = getCachedPage(pageName) ?? (await getPage(pageName));
        const pos = page.indexOf({ key });
        if (pos >= 0) {
            page.removeAt(pos);
            if (autoSave) {
                await page.save();
            }
        }
    }
    async function save() {
        if (!pageCache) {
            return;
        }
        for (const kv of pageCache.all()) {
            await kv.value.save();
        }
    }
    function getCachedPage(pageName) {
        return pageCache ? pageCache.get(pageName) : undefined;
    }
    async function getPage(pageName) {
        const pagePath = path_1.default.join(folderPath, pageName);
        const page = await createObjectPage(pagePath, (x, y) => __1.collections.stringCompare(x.key, y.key, true), pageSettings, fSys);
        if (pageCache) {
            const lruPage = pageCache.removeLRU();
            pageCache.put(pageName, page);
            if (lruPage && lruPage.isDirty) {
                await lruPage.save();
            }
        }
        return page;
    }
    function keyToPageName(key) {
        const bucketId = __1.collections.stringHashCode(key) % numBuckets;
        return bucketId.toFixed(0);
    }
    function createCache() {
        return pageSettings?.cacheSize && pageSettings.cacheSize > 0
            ? __1.collections.createLRUCache(pageSettings.cacheSize)
            : undefined;
    }
}
exports.createHashObjectFolder = createHashObjectFolder;
//# sourceMappingURL=objectPage.js.map