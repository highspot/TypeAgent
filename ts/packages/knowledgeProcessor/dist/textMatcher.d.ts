import { NameValue, ScoredItem } from "typeagent";
import { StorageProvider, ValueDataType, ValueType } from "./storageProvider.js";
export interface TextTable<TTextId = any> {
    getId(text: string): Promise<TTextId | undefined>;
    getText(id: TTextId): Promise<string | undefined>;
}
export interface TextMatcher<TTextId = any> {
    match(text: string): Promise<TTextId[] | undefined>;
}
export interface ApproxTextMatcher<TTextId = any> {
    match(value: string, maxMatches?: number, minScore?: number): Promise<ScoredItem<TTextId>[] | undefined>;
}
/**
 * You can assign multiple aliases (or synonyms) for given text
 */
export interface AliasMatcher<TTextId = any, TAliasId = any> extends TextMatcher<TTextId> {
    entries(): AsyncIterableIterator<NameValue<string[]>>;
    /**
     * Return the target texts for the provided alias
     * @param alias
     */
    getByAlias(alias: string): Promise<string[] | undefined>;
    exists(alias: string, targetText: string): Promise<boolean>;
    /**
     * Add an alias for the given text.
     * @param alias
     * @param targetText
     */
    addAlias(alias: string, targetText: string): Promise<TAliasId | undefined>;
    removeAlias(alias: string, text: string): Promise<void>;
}
/**
 * Creates an alias matcher using the given storage provider and text table.
 * textTable contains the text entries for which you create aliases
 * You can add one or aliases for each entry in text table.
 * @param textTable
 * @param storageProvider
 * @param basePath
 * @param name
 * @param textIdType
 * @returns
 */
export declare function createAliasMatcher<TTextId extends ValueType = string>(textTable: TextTable<TTextId>, storageProvider: StorageProvider, basePath: string, name: string, textIdType: ValueDataType<TTextId>): Promise<AliasMatcher<TTextId, string>>;
//# sourceMappingURL=textMatcher.d.ts.map