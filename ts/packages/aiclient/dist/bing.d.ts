import { Result } from "typechat";
export type ApiSettings = {
    apiKey: string;
    maxRetryAttempts?: number;
    retryPauseMs?: number;
};
export declare enum EnvVars {
    BING_API_KEY = "BING_API_KEY"
}
export declare function apiSettingsFromEnv(env?: Record<string, string | undefined>): ApiSettings;
export interface SearchOptions {
    count?: number;
    offset?: number;
    cc?: string;
    mkt?: string;
    size?: "Small" | "Medium" | "Large" | "Wallpaper" | "All";
}
export type Entity = {
    name: string;
    description?: string;
};
export type EntityAnswer = {
    value: Entity[];
};
export type NewsArticle = {
    clusteredArticles?: NewsArticle[];
    datePublished: string;
    description: string;
    headline: string;
    url: string;
};
export type NewsAnswer = {
    value: NewsArticle[];
};
export type WebPage = {
    name: string;
    url: string;
    snippet: string;
};
export type Image = {
    contentUrl: string;
    thumbnailUrl: string;
};
export type WebAnswer = {
    value: WebPage[];
};
export type SearchResponse = {
    entities?: EntityAnswer;
    news?: NewsAnswer;
    webPages?: WebAnswer;
};
export interface SearchAPI {
    webSearch(query: string | string[], options?: SearchOptions): Promise<Result<WebPage[]>>;
    imageSearch(query: string, options?: SearchOptions): Promise<Result<Image[]>>;
    search(query: string, options?: SearchOptions, responseFilter?: string): Promise<Result<SearchResponse>>;
}
/**
 * Create a Bing Search client. Requires a Bing API key.
 * If no API key provided in settings, tries to load BING_API_KEY from environment.
 * If no API key available, returns an error.
 * @param settings Api Settings. If not supplied, initialized from Environment
 * @returns Bing client if success, else error.
 */
export declare function createBingSearch(settings?: ApiSettings): Promise<Result<SearchAPI>>;
/**
 * Bing Web Search.
 * REQUIRED: Environment variable: BING_API_KEY
 * @param query query to run
 * @param count number of matches
 * @returns
 */
export declare function searchWeb(query: string, count?: number): Promise<WebPage[]>;
/**
 * Bing Image Search.
 * REQUIRED: Environment variable: BING_API_KEY
 * @param query query to run
 * @param count number of matches
 * @returns
 */
export declare function searchImages(query: string, count?: number): Promise<Image[]>;
export declare function buildQuery(queries: string[], operator: "AND" | "OR"): string;
//# sourceMappingURL=bing.d.ts.map