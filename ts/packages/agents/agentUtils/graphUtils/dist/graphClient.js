// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { DeviceCodeCredential, UsernamePasswordCredential, } from "@azure/identity";
import { deserializeAuthenticationRecord, serializeAuthenticationRecord, } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import { useIdentityPlugin } from "@azure/identity";
import { cachePersistencePlugin } from "@azure/identity-cache-persistence";
import { readFileSync, existsSync, writeFileSync } from "fs";
import path from "path";
import lockfile from "proper-lockfile";
import registerDebug from "debug";
import chalk from "chalk";
import os from "os";
import { EventEmitter } from "node:events";
try {
    useIdentityPlugin(cachePersistencePlugin);
}
catch (e) {
    console.warn(chalk.yellowBright(`Failed to load Azure Identity cache persistence plugin:${e.message}`));
}
const debugGraph = registerDebug("typeagent:graphUtils:graphClient");
const debugGraphError = registerDebug("typeagent:graphUtils:graphClient:error");
function readFileSafely(filePath) {
    try {
        if (existsSync(filePath)) {
            const fileContent = readFileSync(filePath, {
                encoding: "utf-8",
            });
            return fileContent;
        }
    }
    catch (error) {
        debugGraphError("Error reading file:", error);
        return undefined;
    }
}
function writeFileSafety(filePath, content) {
    try {
        writeFileSync(filePath, content);
    }
    catch (error) {
        debugGraphError("Error writing file:", error);
    }
}
async function withLockFile(file, fn) {
    let release = await lockfile.lock(file);
    try {
        return await fn();
    }
    finally {
        release();
    }
}
const invalidSettings = {
    clientId: "",
    clientSecret: "",
    tenantId: "",
    graphUserScopes: [],
};
function loadMSGraphSettings() {
    const settings = {
        clientId: process.env["MSGRAPH_APP_CLIENTID"] ?? "",
        clientSecret: process.env["MSGRAPH_APP_CLIENTSECRET"] ?? "",
        tenantId: process.env["MSGRAPH_APP_TENANTID"] ?? "",
        username: process.env["MSGRAPH_APP_USERNAME"],
        password: process.env["MSGRAPH_APP_PASSWD"],
        graphUserScopes: [
            "user.read",
            "mail.read",
            "mail.send",
            "user.read.all",
            "calendars.readwrite",
        ],
    };
    if (settings.clientId === "" ||
        settings.clientSecret === "" ||
        settings.tenantId === "") {
        debugGraphError(chalk.red("Please provide valid clientId, clientSecret and tenantId"));
        return invalidSettings;
    }
    return settings;
}
export class GraphClient extends EventEmitter {
    constructor(authCommand) {
        super();
        this.authCommand = authCommand;
        this._userClient = undefined;
        this.AUTH_RECORD_PATH = path.join(path.join(os.homedir(), ".typeagent"), "tokencache.bin");
        this._userEmailAddresses = new Map();
        this.MSGRAPH_AUTH_URL = "https://graph.microsoft.com/.default";
        this._settings = loadMSGraphSettings();
    }
    async initializeGraphFromDeviceCode(cb) {
        return withLockFile(existsSync(this.AUTH_RECORD_PATH)
            ? this.AUTH_RECORD_PATH
            : path.dirname(this.AUTH_RECORD_PATH), async () => {
            const options = {
                clientId: this._settings.clientId,
                tenantId: this._settings.tenantId,
                disableAutomaticAuthentication: true,
                tokenCachePersistenceOptions: {
                    enabled: true,
                    name: "typeagent-tokencache",
                },
            };
            if (cb) {
                options.userPromptCallback = (deviceCodeInfo) => cb(deviceCodeInfo.message);
            }
            if (existsSync(this.AUTH_RECORD_PATH)) {
                const fileContent = readFileSafely(this.AUTH_RECORD_PATH);
                if (fileContent !== undefined && fileContent != "") {
                    const authRecord = deserializeAuthenticationRecord(fileContent);
                    if (authRecord.authority !== undefined) {
                        options.authenticationRecord = authRecord;
                    }
                }
            }
            const credential = new DeviceCodeCredential(options);
            if (cb === undefined) {
                // getToken to make sure we can authenticate silently
                await credential.getToken(this.MSGRAPH_AUTH_URL);
                if (options.authenticationRecord !== undefined) {
                    return this.createClient(credential);
                }
            }
            // This will ask for user interaction
            const authRecord = await credential.authenticate(this.MSGRAPH_AUTH_URL);
            if (authRecord) {
                const serializedAuthRecord = serializeAuthenticationRecord(authRecord);
                writeFileSafety(this.AUTH_RECORD_PATH, serializedAuthRecord);
                debugGraph("Authenticated");
            }
            return this.createClient(credential);
        });
    }
    async initializeGraphFromUserCred() {
        const settings = this._settings;
        if (!settings.username || !settings.password) {
            throw new Error("Need valid username and password in setting");
        }
        const options = {
            tokenCachePersistenceOptions: {
                enabled: true,
            },
        };
        const credential = new UsernamePasswordCredential(settings.tenantId, settings.clientId, settings.username, settings.password, options);
        const token = await credential.getToken(this.MSGRAPH_AUTH_URL);
        if (token === undefined) {
            throw new Error("Failed to get token");
        }
        return this.createClient(credential);
    }
    async createClient(credential) {
        const authProvider = new TokenCredentialAuthenticationProvider(credential, {
            scopes: this._settings.graphUserScopes,
        });
        const client = Client.initWithMiddleware({
            authProvider,
        });
        // Make sure the credential is valid
        const response = await client
            .api("/me")
            .select(["displayName", "mail", "userPrincipalName"])
            .get();
        if (response === undefined ||
            response.userPrincipalName === undefined) {
            throw new Error("Unable to query graph with client");
        }
        this._userClient = client;
        this.emit("connected", client);
        return client;
    }
    async initialize(cb) {
        if (this._userClient !== undefined) {
            return this._userClient;
        }
        const settings = this._settings;
        if (settings === invalidSettings) {
            throw new Error("Missing graph settings in environment variables");
        }
        if (!settings.username || !settings.password) {
            return await this.initializeGraphFromDeviceCode(cb);
        }
        return await this.initializeGraphFromUserCred();
    }
    async login(cb) {
        try {
            await this.initialize(cb);
            return true;
        }
        catch (e) {
            if (cb === undefined) {
                return false;
            }
            throw e;
        }
    }
    logout() {
        if (this._userClient !== undefined) {
            this._userClient = undefined;
            this.emit("disconnected");
            return true;
        }
        return false;
    }
    isAuthenticated() {
        return this._userClient !== undefined;
    }
    async ensureClient(cb) {
        try {
            return await this.initialize(cb);
        }
        catch (error) {
            if (cb === undefined) {
                debugGraphError(`Error initializing graph: ${error.message}`);
                throw new Error(`Not authenticated. Use ${this.authCommand} to log into MS Graph and try your request again.`);
            }
            throw error;
        }
    }
    async getClient() {
        try {
            return await this.initialize();
        }
        catch (error) {
            debugGraphError(`Error initializing graph: ${error.message}`);
            return undefined;
        }
    }
    async getUserAsync() {
        const client = await this.ensureClient();
        return client
            .api("/me")
            .select(["displayName", "mail", "userPrincipalName"])
            .get();
    }
    async getUserInfo(nameHint) {
        const client = await this.ensureClient();
        try {
            const response = await client
                .api("/users")
                .filter(`startsWith(displayName, '${nameHint}')`)
                .select("displayName,mail")
                .get();
            return response.value;
        }
        catch (error) {
            debugGraphError(chalk.red(`Error finding events${error}`));
        }
        return [];
    }
    async loadUserEmailAddresses() {
        const client = await this.ensureClient();
        try {
            const response = await client
                .api("/users")
                .select("displayName,userPrincipalName")
                .get();
            if (response.value) {
                for (const user of response.value) {
                    if (user.displayName && user.userPrincipalName) {
                        this._userEmailAddresses.set(user.displayName, user.userPrincipalName);
                    }
                }
            }
        }
        catch (error) {
            debugGraphError(chalk.red(`Error loading user email addresses:${error}`));
        }
    }
    async getEmailAddressesOfUsernamesLocal(usernames) {
        let emailAddresses = [];
        try {
            if (this._userEmailAddresses.size === 0) {
                await this.loadUserEmailAddresses();
            }
            for (const username of usernames) {
                for (const [name, addr] of this._userEmailAddresses.entries()) {
                    if (name.toLowerCase().includes(username.toLowerCase())) {
                        emailAddresses.push(addr);
                        break;
                    }
                }
            }
        }
        catch (error) {
            debugGraphError(chalk.red(`Error fetching email addresses:${error}`));
        }
        return emailAddresses;
    }
    async getEmailAddressesOfUsernames(usernames) {
        const client = await this.ensureClient();
        let emailAddresses = [];
        try {
            for (const username of usernames) {
                const response = await client
                    .api("/users")
                    .filter(`startsWith(displayName, '${username}')`)
                    .select("displayName,userPrincipalName ")
                    .get();
                const user = response.value[0];
                if (user && user.userPrincipalName) {
                    emailAddresses.push(user.userPrincipalName);
                }
            }
        }
        catch (error) {
            debugGraphError(`Error fetching email addresses:${error}`);
        }
        return emailAddresses;
    }
}
//# sourceMappingURL=graphClient.js.map