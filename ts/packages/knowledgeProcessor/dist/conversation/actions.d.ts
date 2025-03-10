import { FileSystem, ObjectFolderSettings, ScoredItem, SearchOptions, dateTime } from "typeagent";
import { TermMap, TextIndexSettings } from "../textIndex.js";
import { KnowledgeStore } from "../knowledgeStore.js";
import { Action, ActionParam, VerbTense } from "./knowledgeSchema.js";
import { ActionFilter } from "./knowledgeSearchSchema.js";
import { TemporalLog } from "../temporal.js";
import { ExtractedAction } from "./knowledge.js";
import { TermFilter } from "./knowledgeTermSearchSchema.js";
import { TermFilterV2 } from "./knowledgeTermSearchSchema2.js";
import { EntityNameIndex } from "./entities.js";
import { StorageProvider } from "../storageProvider.js";
export interface ActionSearchResult<TActionId = any> {
    actionIds?: TActionId[] | undefined;
    actions?: Action[];
    temporalSequence?: dateTime.Timestamped<TActionId[]>[] | undefined;
    getTemporalRange(): dateTime.DateRange | undefined;
}
export interface ActionSearchOptions extends SearchOptions {
    verbSearchOptions?: SearchOptions | undefined;
    loadActions?: boolean | undefined;
}
export declare function createActionSearchOptions(loadActions?: boolean): ActionSearchOptions;
export interface ActionIndex<TActionId = any, TSourceId = any> extends KnowledgeStore<ExtractedAction<TSourceId>, TActionId> {
    readonly verbTermMap: TermMap;
    addMultiple(items: ExtractedAction<TSourceId>[], ids?: TActionId[]): Promise<TActionId[]>;
    getSourceIds(ids: TActionId[]): Promise<TSourceId[]>;
    getActions(ids: TActionId[]): Promise<Action[]>;
    search(filter: ActionFilter, options: ActionSearchOptions): Promise<ActionSearchResult<TActionId>>;
    searchTerms(filter: TermFilter, options: ActionSearchOptions): Promise<ActionSearchResult<TActionId>>;
    searchTermsV2(filter: TermFilterV2, options: ActionSearchOptions): Promise<ActionSearchResult<TActionId>>;
    loadSourceIds(sourceIdLog: TemporalLog<TSourceId>, results: ActionSearchResult<TActionId>[], unique?: Set<TSourceId>): Promise<Set<TSourceId> | undefined>;
    getAllVerbs(): Promise<string[]>;
}
export declare function createActionIndex<TSourceId = any>(settings: TextIndexSettings, getNameIndex: () => Promise<EntityNameIndex<string>>, rootPath: string, folderSettings?: ObjectFolderSettings, fSys?: FileSystem): Promise<ActionIndex<string, TSourceId>>;
export declare function createActionIndexOnStorage<TSourceId = any>(settings: TextIndexSettings, getEntityNameIndex: () => Promise<EntityNameIndex<string>>, rootPath: string, storageProvider: StorageProvider): Promise<ActionIndex<string, TSourceId>>;
export declare function actionToString(action: Action): string;
export declare function actionVerbsToString(verbs: string[], verbTense?: VerbTense): string;
export declare function actionParamToString(param: string | ActionParam): string;
export type CompositeAction = {
    subject?: string | undefined;
    verbs?: string | undefined;
    object?: string | undefined;
    indirectObject?: string | undefined;
    params?: string[] | undefined;
};
export type ActionGroupKey = Pick<CompositeAction, "subject" | "verbs" | "object">;
export type ActionGroupValue = Pick<CompositeAction, "object" | "indirectObject" | "params">;
export interface ActionGroup extends ActionGroupKey {
    values?: ActionGroupValue[] | undefined;
}
export declare function toCompositeAction(action: Action): CompositeAction;
/**
 * Action groups are sorted by relevance
 * @param actions
 * @param fullActionsOnly
 * @returns
 */
export declare function mergeActions(actions: Iterable<Action>, fullActionsOnly?: boolean): ActionGroup[];
export declare function mergeCompositeActions(actions: Iterable<CompositeAction>): ScoredItem<ActionGroup>[];
//# sourceMappingURL=actions.d.ts.map