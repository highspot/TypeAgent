// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "node:path";
import fs from "node:fs";
import { DataProtectionScope, PersistenceCreator, } from "@azure/msal-node-extensions";
import { isImageFileType } from "common-utils";
export function getStorage(name, baseDir) {
    const getFullPath = (storagePath) => {
        // REVIEW: validate that the file is still within base path
        return path.join(baseDir, name, storagePath);
    };
    return {
        list: async (storagePath, options) => {
            const fullPath = getFullPath(storagePath);
            const items = await fs.promises.readdir(fullPath, {
                withFileTypes: true,
            });
            return items
                .filter((item) => options?.dirs ? item.isDirectory() : item.isFile())
                .map((item) => options?.fullPath ? getFullPath(item.name) : item.name);
        },
        exists: async (storagePath) => {
            const fullPath = getFullPath(storagePath);
            return fs.existsSync(fullPath);
        },
        read: async (storagePath, options) => {
            const fullPath = getFullPath(storagePath);
            return fs.promises.readFile(fullPath, options);
        },
        write: async (storagePath, data) => {
            const fullPath = getFullPath(storagePath);
            const dirName = path.dirname(fullPath);
            if (!fs.existsSync(dirName)) {
                await fs.promises.mkdir(dirName, { recursive: true });
            }
            // images are passed in as base64 strings so we need to encode them properly on disk
            if (isImageFileType(path.extname(storagePath))) {
                return fs.promises.writeFile(fullPath, Buffer.from(data, "base64"));
            }
            else {
                return fs.promises.writeFile(fullPath, data);
            }
        },
        delete: async (storagePath) => {
            const fullPath = getFullPath(storagePath);
            return fs.promises.unlink(fullPath);
        },
        getTokenCachePersistence: async () => {
            try {
                return await PersistenceCreator.createPersistence({
                    cachePath: getFullPath("token"),
                    dataProtectionScope: DataProtectionScope.CurrentUser,
                    serviceName: `TypeAgent.${name}`,
                    accountName: `TokenCache`,
                    usePlaintextFileOnLinux: false,
                });
            }
            catch (e) {
                console.error(`Failed to create token cache persistence for ${name}: ${e.message}`);
                return {
                    load: async () => null,
                    save: async () => { },
                };
            }
        },
    };
}
//# sourceMappingURL=storageImpl.js.map