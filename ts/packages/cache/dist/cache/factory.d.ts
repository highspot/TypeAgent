import { GenericExplainer } from "../explanation/genericExplainer.js";
import { SchemaInfoProvider } from "../explanation/schemaInfoProvider.js";
import { CacheOptions, AgentCache } from "./cache.js";
import { Logger } from "telemetry";
export declare function getDefaultExplainerName(): string;
export type ExplainerFactory = (schemaNames: string[] | undefined, model?: string) => GenericExplainer;
export type CustomExplainerFactory = (schemaNames: string[]) => GenericExplainer | undefined;
export declare class AgentCacheFactory {
    private readonly getCustomExplainerFactory?;
    private explainerFactories;
    constructor(getCustomExplainerFactory?: ((explainerName: string) => CustomExplainerFactory) | undefined);
    getExplainerNames(): string[];
    getExplainer(schemaNames: string[], explainerName: string, model?: string): GenericExplainer<object>;
    create(explainerName?: string, schemaInfoProvider?: SchemaInfoProvider, cacheOptions?: CacheOptions, logger?: Logger): AgentCache;
    private getExplainerFactory;
}
//# sourceMappingURL=factory.d.ts.map