// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getExplainerFactories } from "../explanation/explainerFactories.js";
import { AgentCache } from "./cache.js";
const defaultExplainerName = "v5";
export function getDefaultExplainerName() {
    return defaultExplainerName;
}
export class AgentCacheFactory {
    constructor(getCustomExplainerFactory) {
        this.getCustomExplainerFactory = getCustomExplainerFactory;
        this.explainerFactories = new Map();
    }
    getExplainerNames() {
        return Object.keys(getExplainerFactories());
    }
    getExplainer(schemaNames, explainerName, model) {
        return this.getExplainerFactory(explainerName)(schemaNames, model);
    }
    create(explainerName = getDefaultExplainerName(), schemaInfoProvider, cacheOptions, logger) {
        return new AgentCache(explainerName, this.getExplainerFactory(explainerName), schemaInfoProvider, cacheOptions, logger);
    }
    getExplainerFactory(explainerName) {
        const existing = this.explainerFactories.get(explainerName);
        if (existing) {
            return existing;
        }
        const defaultFactory = getExplainerFactories()[explainerName];
        if (defaultFactory === undefined) {
            throw new Error(`Invalid explainer name '${explainerName}'`);
        }
        const customFactory = this.getCustomExplainerFactory?.(explainerName);
        const cache = new Map();
        const defaultCache = new Map();
        const getDefaultExplainer = (model) => {
            const key = model ?? "";
            let explainer = defaultCache.get(key);
            if (explainer !== undefined) {
                return explainer;
            }
            explainer = defaultFactory(model);
            defaultCache.set(key, explainer);
            return explainer;
        };
        const factory = (schemaNames, model) => {
            const key = `${schemaNames ? schemaNames.join("|") : ""}|${model ?? ""}`;
            const existing = cache.get(key);
            if (existing) {
                return existing;
            }
            // Undefined translator is not overridable.
            const customExplainer = schemaNames
                ? customFactory?.(schemaNames)
                : undefined;
            if (customExplainer !== undefined && model !== undefined) {
                throw new Error("Custom model not supported");
            }
            const explainer = customExplainer ?? getDefaultExplainer(model);
            cache.set(key, explainer);
            return explainer;
        };
        this.explainerFactories.set(explainerName, factory);
        return factory;
    }
}
//# sourceMappingURL=factory.js.map