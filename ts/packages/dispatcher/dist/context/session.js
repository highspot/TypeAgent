// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getDefaultExplainerName } from "agent-cache";
import registerDebug from "debug";
import fs from "node:fs";
import path from "node:path";
import { getUniqueFileName, getYMDPrefix } from "../utils/fsUtils.js";
import ExifReader from "exifreader";
import { appAgentStateKeys } from "./appAgentManager.js";
import { cloneConfig, isEmptySettings, mergeConfig, sanitizeConfig, } from "./options.js";
import { TokenCounter } from "aiclient";
import { DispatcherName } from "./dispatcher/dispatcherUtils.js";
const debugSession = registerDebug("typeagent:session");
function getSessionsFilePath(instanceDir) {
    return path.join(instanceDir, "sessions.json");
}
export function getSessionsDirPath(instanceDir) {
    return path.join(instanceDir, "sessions");
}
export function getSessionDirPath(instanceDir, dir) {
    return path.join(getSessionsDirPath(instanceDir), dir);
}
function getSessionDataFilePath(sessionDirPath) {
    return path.join(sessionDirPath, "data.json");
}
export function getSessionConstructionDirPath(sessionDirPath) {
    return path.join(sessionDirPath, "constructions");
}
async function loadSessions(instanceDir) {
    const sessionFilePath = getSessionsFilePath(instanceDir);
    if (fs.existsSync(sessionFilePath)) {
        const content = await fs.promises.readFile(sessionFilePath, "utf-8");
        return JSON.parse(content);
    }
    return {};
}
async function newSessionDir(instanceDir) {
    const sessions = await loadSessions(instanceDir);
    const dir = getUniqueFileName(getSessionsDirPath(instanceDir), getYMDPrefix());
    const fullDir = getSessionDirPath(instanceDir, dir);
    await fs.promises.mkdir(fullDir, { recursive: true });
    sessions.lastSession = dir;
    await fs.promises.writeFile(getSessionsFilePath(instanceDir), JSON.stringify(sessions, undefined, 2));
    debugSession(`New session: ${dir}`);
    return fullDir;
}
const defaultSessionConfig = {
    schemas: {},
    actions: {},
    commands: {},
    // default to dispatcher
    request: DispatcherName,
    translation: {
        enabled: true,
        model: "",
        stream: true,
        promptConfig: {
            additionalInstructions: true,
        },
        switch: {
            embedding: true,
            inline: true,
            search: true,
        },
        multiple: {
            enabled: true,
            result: true,
            pending: true,
        },
        history: {
            enabled: true,
            limit: 20,
        },
        schema: {
            generation: {
                enabled: true,
                jsonSchema: false,
                jsonSchemaFunction: false,
                jsonSchemaWithTs: false,
                jsonSchemaValidate: true,
            },
            optimize: {
                enabled: false,
                numInitialActions: 5,
            },
        },
    },
    execution: {
        history: true,
    },
    explainer: {
        enabled: true,
        model: "",
        name: getDefaultExplainerName(),
        filter: {
            multiple: true,
            reference: {
                value: true,
                list: true,
                translate: true,
            },
        },
    },
    cache: {
        enabled: true,
        autoSave: true,
        mergeMatchSets: true, // the session default is different then the default in the cache
        cacheConflicts: true, // the session default is different then the default in the cache
        matchWildcard: true,
        builtInCache: true,
    },
};
// Fill in missing fields when loading sessions from disk
function ensureSessionData(data) {
    if (data.config !== undefined) {
        // back compat
        data.settings = data.config;
    }
    if (data.settings !== undefined) {
        sanitizeConfig(defaultSessionConfig, data.settings, appAgentStateKeys);
    }
    if (data.cacheData === undefined) {
        data.cacheData = {};
    }
    return data;
}
export function getSessionName(dirPath) {
    return path.basename(dirPath);
}
const sessionVersion = 2;
async function readSessionData(dirPath) {
    const sessionDataFilePath = getSessionDataFilePath(dirPath);
    if (!fs.existsSync(sessionDataFilePath)) {
        const sessionName = getSessionName(dirPath);
        throw new Error(`Session '${sessionName}' does not exist.`);
    }
    const content = await fs.promises.readFile(sessionDataFilePath, "utf-8");
    const data = JSON.parse(content);
    if (data.version !== sessionVersion) {
        const sessionName = getSessionName(dirPath);
        throw new Error(`Unsupported session version (${data.version}) in '${sessionName}'`);
    }
    return ensureSessionData(data);
}
export class Session {
    static async create(settings, instanceDir) {
        const session = new Session({ settings, cacheData: {} }, instanceDir ? await newSessionDir(instanceDir) : undefined);
        await session.save();
        return session;
    }
    static async load(instanceDir, dir) {
        const dirPath = getSessionDirPath(instanceDir, dir);
        const sessionData = await readSessionData(dirPath);
        debugSession(`Loading session: ${dir}`);
        debugSession(`Settings: ${JSON.stringify(sessionData.settings, undefined, 2)}`);
        return new Session(sessionData, dirPath);
    }
    static async restoreLastSession(instanceDir) {
        const sessionDir = (await loadSessions(instanceDir))?.lastSession;
        if (sessionDir !== undefined) {
            try {
                return this.load(instanceDir, sessionDir);
            }
            catch (e) {
                throw new Error(`Unable to restore last session '${sessionDir}': ${e.message}`);
            }
        }
        return undefined;
    }
    constructor(sessionData, sessionDirPath) {
        this.sessionDirPath = sessionDirPath;
        this.defaultConfig = cloneConfig(defaultSessionConfig);
        this.settings = sessionData.settings ?? {};
        this.config = cloneConfig(defaultSessionConfig);
        mergeConfig(this.config, this.settings, appAgentStateKeys);
        this.cacheData = sessionData.cacheData;
        // rehydrate token stats
        if (sessionData.tokens) {
            TokenCounter.load(sessionData.tokens);
        }
    }
    get explainerName() {
        return this.config.explainer.name;
    }
    get explanation() {
        return this.config.explainer.enabled;
    }
    get cacheConfig() {
        return {
            mergeMatchSets: this.config.cache.mergeMatchSets,
            cacheConflicts: this.config.cache.cacheConflicts,
        };
    }
    getSettings() {
        return this.settings;
    }
    updateSettings(options) {
        const changed = mergeConfig(this.settings, options, true);
        if (changed) {
            this.save();
        }
        return mergeConfig(this.config, options, appAgentStateKeys, this.defaultConfig);
    }
    getConfig() {
        return this.config;
    }
    updateConfig(settings) {
        return mergeConfig(this.config, settings, appAgentStateKeys);
    }
    updateDefaultConfig(settings) {
        mergeConfig(this.defaultConfig, settings, appAgentStateKeys);
        // Get the latest configuration
        const newConfig = cloneConfig(this.defaultConfig);
        mergeConfig(newConfig, this.settings, appAgentStateKeys);
        return mergeConfig(this.config, newConfig, appAgentStateKeys);
    }
    getSessionDirPath() {
        return this.sessionDirPath;
    }
    getConstructionDataFilePath() {
        const filePath = this.cacheData[this.explainerName];
        return filePath && this.sessionDirPath && !path.isAbsolute(filePath)
            ? path.join(getSessionConstructionDirPath(this.sessionDirPath), filePath)
            : filePath;
    }
    setConstructionDataFilePath(filePath, explainerName) {
        const filePathRel = filePath &&
            this.sessionDirPath &&
            path.isAbsolute(filePath) &&
            filePath.startsWith(getSessionConstructionDirPath(this.sessionDirPath))
            ? path.relative(getSessionConstructionDirPath(this.sessionDirPath), filePath)
            : filePath;
        this.cacheData[explainerName ?? this.explainerName] = filePathRel;
        this.save();
    }
    async ensureCacheDataFilePath() {
        const filePath = this.getConstructionDataFilePath();
        return filePath ?? this.newCacheDataFilePath();
    }
    async clear() {
        if (this.sessionDirPath) {
            await fs.promises.rm(this.sessionDirPath, {
                recursive: true,
                force: true,
            });
            await fs.promises.mkdir(this.sessionDirPath, { recursive: true });
            this.cacheData = {};
            await this.save();
        }
    }
    async newCacheDataFilePath() {
        if (this.sessionDirPath) {
            const cacheDir = getSessionConstructionDirPath(this.sessionDirPath);
            await fs.promises.mkdir(cacheDir, { recursive: true });
            const filePath = getUniqueFileName(cacheDir, `${this.explainerName}_${getYMDPrefix()}`, ".json");
            this.setConstructionDataFilePath(filePath);
            return path.join(cacheDir, filePath);
        }
        return undefined;
    }
    save() {
        if (this.sessionDirPath) {
            const sessionDataFilePath = getSessionDataFilePath(this.sessionDirPath);
            const data = {
                version: sessionVersion,
                settings: isEmptySettings(this.settings)
                    ? undefined
                    : this.settings,
                cacheData: this.cacheData,
                tokens: TokenCounter.getInstance(),
            };
            debugSession(`Saving session: ${getSessionName(this.sessionDirPath)}`);
            debugSession(`Settings: ${JSON.stringify(data.settings, undefined, 2)}`);
            fs.writeFileSync(sessionDataFilePath, JSON.stringify(data, undefined, 2));
        }
    }
    async storeUserSuppliedFile(file) {
        if (this.sessionDirPath === undefined) {
            throw new Error("Unable to store file without persisting session");
        }
        const filesDir = path.join(this.sessionDirPath, "user_files");
        await fs.promises.mkdir(filesDir, { recursive: true });
        // get the extension for the  mime type for the supplied file
        const fileExtension = this.getFileExtensionForMimeType(file.substring(5, file.indexOf(";")));
        const uniqueFileName = getUniqueFileName(filesDir, "attachment_", fileExtension);
        const fileName = path.join(filesDir, uniqueFileName);
        const buffer = Buffer.from(file.substring(file.indexOf(";base64,") + ";base64,".length), "base64");
        const tags = ExifReader.load(buffer);
        fs.writeFile(fileName, buffer, () => { });
        return [uniqueFileName, tags];
    }
    getFileExtensionForMimeType(mime) {
        switch (mime) {
            case "image/png":
                return ".png";
            case "image/jpeg":
                return ".jpeg";
        }
        throw "Unsupported MIME type";
    }
}
/**
 * Clear existing cache state and setup the cache again.
 */
export async function setupAgentCache(session, agentCache, provider) {
    const config = session.getConfig();
    agentCache.model = config.explainer.model;
    agentCache.constructionStore.clear();
    if (config.cache.enabled) {
        const cacheData = session.getConstructionDataFilePath();
        if (cacheData !== undefined) {
            // Load if there is an existing path.
            if (fs.existsSync(cacheData)) {
                debugSession(`Loading session cache from ${cacheData}`);
                await agentCache.constructionStore.load(cacheData);
            }
            else {
                debugSession(`Cache file missing ${cacheData}`);
                // Disable the cache if we can't load the file.
                session.updateSettings({ cache: { enabled: false } });
                throw new Error(`Cache file ${cacheData} missing. Use '@const new' to create a new one'`);
            }
        }
        else {
            // Create if there isn't an existing path.
            const newCacheData = config.cache.autoSave
                ? await session.ensureCacheDataFilePath()
                : undefined;
            await agentCache.constructionStore.newCache(newCacheData);
            debugSession(`Creating session cache ${newCacheData ?? ""}`);
        }
        await setupBuiltInCache(session, agentCache, config.cache.builtInCache, provider);
    }
    await agentCache.constructionStore.setAutoSave(config.cache.autoSave);
}
export async function setupBuiltInCache(session, agentCache, enable, provider) {
    const builtInConstructions = enable
        ? provider?.getBuiltinConstructionConfig(session.explainerName)?.file
        : undefined;
    try {
        await agentCache.constructionStore.setBuiltInCache(builtInConstructions);
    }
    catch (e) {
        console.warn(`WARNING: Unable to load built-in cache: ${e.message}`);
    }
}
export async function deleteSession(instanceDir, dir) {
    if (dir === "") {
        return;
    }
    const sessionDir = getSessionDirPath(instanceDir, dir);
    return fs.promises.rm(sessionDir, { recursive: true, force: true });
}
export async function deleteAllSessions(instanceDir) {
    const sessionsDir = getSessionsDirPath(instanceDir);
    return fs.promises.rm(sessionsDir, { recursive: true, force: true });
}
export async function getSessionNames(instanceDir) {
    const sessionsDir = getSessionsDirPath(instanceDir);
    const dirent = await fs.promises.readdir(sessionsDir, {
        withFileTypes: true,
    });
    return dirent.filter((d) => d.isDirectory()).map((d) => d.name);
}
export async function getSessionConstructionDirPaths(dirPath) {
    const cacheDir = getSessionConstructionDirPath(dirPath);
    const dirent = await fs.promises.readdir(cacheDir, { withFileTypes: true });
    const sessionCacheData = (await readSessionData(dirPath))?.cacheData;
    const ret = [];
    for (const d of dirent) {
        if (!d.isFile()) {
            continue;
        }
        try {
            const cacheContent = await fs.promises.readFile(path.join(cacheDir, d.name), "utf-8");
            const cacheData = JSON.parse(cacheContent);
            ret.push({
                explainer: cacheData.explainerName,
                name: d.name,
                current: sessionCacheData?.[cacheData.explainerName] === d.name,
            });
        }
        catch {
            // ignore errors
        }
    }
    return ret;
}
//# sourceMappingURL=session.js.map