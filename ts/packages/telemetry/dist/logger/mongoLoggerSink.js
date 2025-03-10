"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMongoDBLoggerSink = void 0;
const mongodb_1 = require("mongodb");
const debug_1 = __importDefault(require("debug"));
const debugMongo = (0, debug_1.default)("typeagent:logger:mongodb");
const UPLOAD_DELAY = 1000;
class MongoDBLoggerSink {
    constructor(dbUrl, dbName, collectionName, isEnabled, onErrorDisable) {
        this.dbUrl = dbUrl;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.isEnabled = isEnabled;
        this.onErrorDisable = onErrorDisable;
        this.pendingEvents = [];
        this.disabled = false;
    }
    logEvent(event) {
        if (!this.disabled &&
            (this.isEnabled === undefined || this.isEnabled())) {
            this.pendingEvents.push(event);
            if (this.timeout === undefined) {
                this.timeout = setTimeout(() => this.upload(), UPLOAD_DELAY);
            }
        }
    }
    async upload() {
        try {
            this.timeout = undefined;
            if (this.dbUrl) {
                const client = await mongodb_1.MongoClient.connect(this.dbUrl);
                try {
                    const db = client.db(this.dbName);
                    const collection = db.collection(this.collectionName);
                    await collection.insertMany(this.pendingEvents);
                    debugMongo(`${this.pendingEvents.length} events uploaded`);
                    this.pendingEvents = [];
                }
                finally {
                    await client.close();
                }
            }
        }
        catch (e) {
            if (typeof e.message === "string" &&
                e.message.includes("Invalid key")) {
                // Disable
                if (this.onErrorDisable) {
                    this.onErrorDisable(`DB Logging disabled: ${e.toString()}`);
                }
                else {
                    console.error(`DB Logging disabled: ${e.toString()}`);
                }
                this.disabled = true;
            }
            else {
                // TODO: ignore?
                debugMongo(`ERROR: ${e}`);
            }
        }
    }
}
function createMongoDBLoggerSink(dbName, collectionName, isEnabled, onErrorDisable) {
    const dbUrl = process.env["MONGODB_CONNECTION_STRING"] ?? null;
    if (dbUrl === null || dbUrl === "") {
        throw new Error("MONGODB_CONNECTION_STRING environment variable not set");
    }
    return new MongoDBLoggerSink(dbUrl, dbName, collectionName, isEnabled, onErrorDisable);
}
exports.createMongoDBLoggerSink = createMongoDBLoggerSink;
//# sourceMappingURL=mongoLoggerSink.js.map