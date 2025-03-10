// Copyright (c) Microsoft Corporation and Henry Lucco.
// Licensed under the MIT License.
import { createObjectFolder, } from "typeagent";
import { createTemporalLog, } from "knowledge-processor";
import { createElasicClient, deleteIndeces } from "./common.js";
import { createKeyValueIndex } from "./keyValueIndex.js";
import { createTextIndex } from "./simplifiedTextIndex.js";
export async function createStorageIndex(createNew) {
    let uri = process.env.ELASTIC_URI;
    if (!uri) {
        throw new Error("ELASTIC_URI environment variable not set");
    }
    let elasticClient = await createElasicClient(uri, createNew);
    return {
        createObjectFolder: _createObjectFolder,
        createTemporalLog: _createTemporalLog,
        createTextIndex: _createTextIndex,
        createIndex: _createIndex,
        clear,
    };
    async function ensureOpen() {
        if (elasticClient !== undefined) {
            return;
        }
        throw new Error("Unable to establish connection to Elastic instance");
    }
    async function _createObjectFolder(basePath, name, settings) {
        ensureOpen();
        return createObjectFolder(basePath, settings);
    }
    async function _createTemporalLog(settings, basePath, name) {
        return createTemporalLog(settings, basePath);
    }
    async function _createTextIndex(settings, basePath, name, sourceIdType) {
        ensureOpen();
        return createTextIndex(settings, basePath + name, elasticClient, sourceIdType);
    }
    async function _createIndex(basePath, name, valueType) {
        ensureOpen();
        return createKeyValueIndex(elasticClient, basePath + name);
    }
    async function clear() {
        await deleteIndeces(elasticClient);
    }
}
//# sourceMappingURL=storageClient.js.map