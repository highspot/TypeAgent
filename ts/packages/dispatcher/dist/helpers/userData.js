// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { randomUUID } from "crypto";
import lockfile from "proper-lockfile";
import { getPackageFilePath } from "../utils/getPackageFilePath.js";
import { ensureDirectory, getUniqueFileName } from "../utils/fsUtils.js";
export function getUserDataDir() {
    return path.join(os.homedir(), ".typeagent");
}
function ensureUserDataDir() {
    const dir = getUserDataDir();
    ensureDirectory(dir);
    return dir;
}
function getGlobalUserConfigFilePath() {
    return path.join(getUserDataDir(), "global.json");
}
function readGlobalUserConfig(locked = false) {
    try {
        const content = fs.readFileSync(getGlobalUserConfigFilePath(), "utf-8");
        const data = JSON.parse(content);
        if (data === undefined) {
            return undefined;
        }
        if (data.clientId !== undefined) {
            return data;
        }
        if (locked && data.userid !== undefined) {
            data.clientId = data.userid;
            delete data.userid;
            saveGlobalUserConfig(data);
            return data;
        }
    }
    catch (error) { }
    return undefined;
}
function saveGlobalUserConfig(userConfig) {
    const content = JSON.stringify(userConfig, null, 2);
    ensureUserDataDir();
    fs.writeFileSync(getGlobalUserConfigFilePath(), content);
}
function ensureGlobalUserConfig() {
    const existingUserConfig = readGlobalUserConfig(true);
    if (existingUserConfig === undefined) {
        const userConfig = { clientId: randomUUID() };
        saveGlobalUserConfig(userConfig);
        return userConfig;
    }
    return existingUserConfig;
}
function lockUserData(fn) {
    let release;
    try {
        release = lockfile.lockSync(ensureUserDataDir());
    }
    catch (error) {
        console.error(`ERROR: Unable to lock user data directory: ${error.message}. Exiting.`);
        process.exit(-1);
    }
    try {
        return fn();
    }
    finally {
        release();
    }
}
function getInstancesDir() {
    return path.join(ensureUserDataDir(), "profiles");
}
function ensureInstanceDirName(instanceName) {
    const userConfig = ensureGlobalUserConfig();
    const profileName = userConfig.instances?.[instanceName];
    if (profileName) {
        return profileName;
    }
    const newProfileName = getUniqueFileName(getInstancesDir(), process.env["INSTANCE_NAME"] ?? "dev");
    if (userConfig.instances === undefined) {
        userConfig.instances = {};
    }
    userConfig.instances[instanceName] = newProfileName;
    saveGlobalUserConfig(userConfig);
    return newProfileName;
}
function getInstanceDirName(instanceName) {
    const currentGlobalUserConfig = readGlobalUserConfig();
    if (currentGlobalUserConfig !== undefined) {
        const instanceDirName = currentGlobalUserConfig.instances?.[instanceName];
        if (instanceDirName !== undefined) {
            return instanceDirName;
        }
    }
    return lockUserData(() => {
        return ensureInstanceDirName(instanceName);
    });
}
function getInstanceName() {
    return process.env["INSTANCE_NAME"] ?? `dev:${getPackageFilePath(".")}`;
}
let instanceDir;
export function getInstanceDir() {
    if (instanceDir === undefined) {
        instanceDir = path.join(getInstancesDir(), getInstanceDirName(getInstanceName()));
    }
    return instanceDir;
}
let clientId;
export function getClientId() {
    if (clientId !== undefined) {
        return clientId;
    }
    const currentGlobalUserConfig = readGlobalUserConfig();
    if (currentGlobalUserConfig !== undefined) {
        clientId = currentGlobalUserConfig.clientId;
        return clientId;
    }
    return lockUserData(() => {
        clientId = ensureGlobalUserConfig().clientId;
        return clientId;
    });
}
//# sourceMappingURL=userData.js.map