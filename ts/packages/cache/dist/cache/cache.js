// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as Telemetry from "telemetry";
import { getFullActionName, getTranslationNamesForActions, } from "../explanation/requestAction.js";
import { doCacheAction, } from "../explanation/schemaInfoProvider.js";
import { ConstructionStoreImpl } from "./store.js";
import { ExplainWorkQueue, } from "./explainWorkQueue.js";
function getFailedResult(message) {
    return {
        explanationResult: {
            explanation: {
                success: false,
                message,
            },
            elapsedMs: 0,
        },
    };
}
// Construction namespace policy
export function getSchemaNamespaceKeys(schemaNames, schemaInfoProvider) {
    // Current namespace keys policy is just combining schema name its file hash
    return schemaInfoProvider
        ? schemaNames.map((name) => `${name},${schemaInfoProvider.getActionSchemaFileHash(name)}`)
        : schemaNames;
}
export class AgentCache {
    constructor(explainerName, getExplainerForTranslator, schemaInfoProvider, cacheOptions, logger) {
        this.explainerName = explainerName;
        this.schemaInfoProvider = schemaInfoProvider;
        this._constructionStore = new ConstructionStoreImpl(explainerName, cacheOptions);
        this.explainWorkQueue = new ExplainWorkQueue(getExplainerForTranslator);
        this.logger = logger
            ? new Telemetry.ChildLogger(logger, "cache", {
                explainerName,
            })
            : undefined;
        if (schemaInfoProvider) {
            this.namespaceKeyFilter = (namespaceKey) => {
                const [schemaName, hash] = namespaceKey.split(",");
                return (schemaInfoProvider.getActionSchemaFileHash(schemaName) ===
                    hash);
            };
        }
    }
    get constructionStore() {
        return this._constructionStore;
    }
    getNamespaceKeys(schemaNames) {
        return getSchemaNamespaceKeys(schemaNames, this.schemaInfoProvider);
    }
    getInfo() {
        return this._constructionStore.getInfo(this.namespaceKeyFilter);
    }
    async prune() {
        if (this.namespaceKeyFilter === undefined) {
            throw new Error("Cannon prune cache without schema info provider");
        }
        return this._constructionStore.prune(this.namespaceKeyFilter);
    }
    async processRequestAction(requestAction, cache = true, options) {
        try {
            const actions = requestAction.actions;
            if (cache) {
                for (const action of actions) {
                    const cacheAction = doCacheAction(action, this.schemaInfoProvider);
                    if (!cacheAction) {
                        return getFailedResult(`Caching disabled in schema config for action '${getFullActionName(action)}'`);
                    }
                }
            }
            const constructionCreationConfig = cache
                ? {
                    schemaInfoProvider: this.schemaInfoProvider,
                }
                : undefined;
            const explanationResult = await this.explainWorkQueue.queueTask(requestAction, cache, options, constructionCreationConfig, this.model);
            const { explanation, elapsedMs } = explanationResult;
            this.logger?.logEvent("explanation", {
                request: requestAction.request,
                actions,
                history: requestAction.history,
                explanation,
                elapsedMs,
            });
            const store = this._constructionStore;
            const generateConstruction = cache && store.isEnabled();
            if (generateConstruction && explanation.success) {
                const construction = explanation.construction;
                let added = false;
                let message;
                if (construction === undefined) {
                    message = `Explainer '${this.explainerName}' doesn't support constructions.`;
                }
                else {
                    const namespaceKeys = this.getNamespaceKeys(getTranslationNamesForActions(actions));
                    const result = await store.addConstruction(namespaceKeys, construction);
                    if (result.added) {
                        added = true;
                        message = `Construction added: ${result.construction}`;
                    }
                    else {
                        message = `Construction merged:\n  ${result.existing.join("  \n")}`;
                    }
                    const info = this.getInfo();
                    this.logger?.logEvent("construction", {
                        added,
                        message,
                        config: this._constructionStore.getConfig(),
                        count: info?.constructionCount,
                        filteredCount: info?.filteredConstructionCount,
                        builtInCount: info?.builtInConstructionCount,
                        filteredBuiltinCount: info?.filteredBuiltInConstructionCount,
                    });
                }
                return {
                    explanationResult,
                    constructionResult: {
                        added,
                        message,
                    },
                };
            }
            return {
                explanationResult,
            };
        }
        catch (e) {
            this.logger?.logEvent("error", {
                request: requestAction.request,
                actions: requestAction.actions,
                history: requestAction.history,
                cache,
                options,
                message: e.message,
                stack: e.stack,
            });
            throw e;
        }
    }
    async import(data, ignoreSourceHash = false) {
        return this._constructionStore.import(data, this.explainWorkQueue.getExplainerForTranslator, this.schemaInfoProvider, ignoreSourceHash);
    }
}
//# sourceMappingURL=cache.js.map