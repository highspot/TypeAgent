import { FileSystem, ObjectFolderSettings, ScoredItem, SemanticIndex } from "typeagent";
import { TextIndexSettings } from "../textIndex.js";
export interface MessageIndex<TMessageId> extends SemanticIndex<TMessageId> {
    nearestNeighborsInSubset(value: string, subsetIds: TMessageId[], maxMatches: number, minScore?: number): Promise<ScoredItem<TMessageId>[]>;
    putMultiple(items: [string, TMessageId][], onlyIfNew?: boolean): Promise<[string, TMessageId][]>;
}
export declare function createMessageIndex(settings: TextIndexSettings, folderPath: string, folderSettings?: ObjectFolderSettings, fSys?: FileSystem): Promise<MessageIndex<string>>;
//# sourceMappingURL=messages.d.ts.map