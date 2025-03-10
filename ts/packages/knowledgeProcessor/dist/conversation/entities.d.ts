import { FileSystem, ObjectFolderSettings, SearchOptions, dateTime } from "typeagent";
import { TermSet, TextIndex, TextIndexSettings } from "../textIndex.js";
import { KnowledgeStore } from "../knowledgeStore.js";
import { ExtractedEntity } from "./knowledge.js";
import { EntityFilter } from "./knowledgeSearchSchema.js";
import { SetOp, WithFrequency } from "../setOperations.js";
import { TemporalLog } from "../temporal.js";
import { FilterWithTagScope } from "./knowledgeActions.js";
import { ConcreteEntity, Facet } from "./knowledgeSchema.js";
import { TermFilter } from "./knowledgeTermSearchSchema.js";
import { TermFilterV2 } from "./knowledgeTermSearchSchema2.js";
import { StorageProvider } from "../storageProvider.js";
import { AliasMatcher } from "../textMatcher.js";
export interface EntitySearchOptions extends SearchOptions {
    loadEntities?: boolean | undefined;
    nameSearchOptions?: SearchOptions | undefined;
    facetSearchOptions?: SearchOptions | undefined;
    combinationSetOp?: SetOp | undefined;
    /**
     * Select items with the 'topK' scores.
     * E.g. 3 means that the 3 highest scores are picked and any items with those scores selected
     */
    topK?: number;
    alwaysUseTags?: boolean | undefined;
}
export declare function createEntitySearchOptions(loadEntities?: boolean): EntitySearchOptions;
export interface EntityIndex<TEntityId = any, TSourceId = any, TTextId = any> extends KnowledgeStore<ExtractedEntity<TSourceId>, TEntityId> {
    readonly nameIndex: TextIndex<TTextId, TEntityId>;
    readonly typeIndex: TextIndex<TTextId, TEntityId>;
    readonly facetIndex: TextIndex<TTextId, TEntityId>;
    readonly nameAliases: AliasMatcher<TTextId>;
    readonly noiseTerms: TermSet;
    entities(): AsyncIterableIterator<ExtractedEntity<TSourceId>>;
    get(id: TEntityId): Promise<ExtractedEntity<TSourceId> | undefined>;
    getMultiple(ids: TEntityId[]): Promise<ExtractedEntity<TSourceId>[]>;
    getSourceIds(ids: TEntityId[]): Promise<TSourceId[]>;
    getEntities(ids: TEntityId[]): Promise<ConcreteEntity[]>;
    getEntityIdsInTimeRange(startAt: Date, stopAt?: Date): Promise<TEntityId[] | undefined>;
    add(entity: ExtractedEntity<TSourceId>, id?: TEntityId): Promise<TEntityId>;
    addMultiple(entities: ExtractedEntity<TSourceId>[], ids?: TEntityId[]): Promise<TEntityId[]>;
    search(filter: EntityFilter, options: EntitySearchOptions): Promise<EntitySearchResult<TEntityId>>;
    searchTerms(filter: TermFilter, options: EntitySearchOptions): Promise<EntitySearchResult<TEntityId>>;
    searchTermsV2(filter: TermFilterV2 | FilterWithTagScope<TermFilterV2>, options: EntitySearchOptions): Promise<EntitySearchResult<TEntityId>>;
    loadSourceIds(sourceIdLog: TemporalLog<TSourceId>, results: EntitySearchResult<TEntityId>[], unique?: Set<TSourceId>): Promise<Set<TSourceId> | undefined>;
}
export declare function createEntityIndex<TSourceId = string>(settings: TextIndexSettings, rootPath: string, folderSettings?: ObjectFolderSettings, fSys?: FileSystem): Promise<EntityIndex<string, TSourceId, string>>;
export declare function createEntityIndexOnStorage<TSourceId = string>(settings: TextIndexSettings, rootPath: string, storageProvider: StorageProvider): Promise<EntityIndex<string, TSourceId, string>>;
export interface EntitySearchResult<TEntityId = any> {
    entityIds?: TEntityId[] | undefined;
    entities?: ConcreteEntity[];
    temporalSequence?: dateTime.Timestamped<TEntityId[]>[] | undefined;
    getTemporalRange(): dateTime.DateRange | undefined;
}
export declare function entityToString(entity: CompositeEntity): string;
export declare function mergeEntities(entities: Iterable<ConcreteEntity>): Map<string, WithFrequency<CompositeEntity>>;
export declare function getTopMergedEntities(rawEntities: Iterable<ConcreteEntity>, topK?: number): CompositeEntity[] | undefined;
export type CompositeEntity = {
    name: string;
    type: string[];
    facets?: string[] | undefined;
};
export declare function mergeCompositeEntities(entities: Iterable<CompositeEntity>): Map<string, WithFrequency<CompositeEntity>>;
export declare function appendCompositeEntity(x: CompositeEntity, y: CompositeEntity): boolean;
export declare function toCompositeEntity(entity: ConcreteEntity): CompositeEntity;
export declare function toCompositeEntities(entities: Iterable<ExtractedEntity>): IterableIterator<CompositeEntity>;
export declare function facetToString(facet: Facet): string;
export declare function facetMatch(x: Facet, y: Facet): boolean;
export declare function mergeEntityFacet(entity: ConcreteEntity, facet: Facet): void;
export declare function pushFacet(entity: ConcreteEntity, name: string, value: string): void;
export declare function entityFromRecord(ns: string, name: string, type: string, record: Record<string, any>): ConcreteEntity;
export declare function facetsFromRecord(record: Record<string, any>): Facet[] | undefined;
export type EntityNameIndex<TTextId = any> = {
    nameIndex: TextIndex<TTextId>;
    nameAliases?: AliasMatcher<TTextId> | undefined;
};
//# sourceMappingURL=entities.d.ts.map