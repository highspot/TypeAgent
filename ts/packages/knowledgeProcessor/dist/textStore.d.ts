import { FileSystem, ObjectFolderSettings } from "typeagent";
import { SourceTextBlock, TextBlock } from "./text.js";
import { TemporalLog, TemporalLogSettings } from "./temporal.js";
export interface TextStore<TextId = string, TSourceId = TextId> extends TemporalLog<TextId, TextBlock<TSourceId>> {
    entries(): AsyncIterableIterator<SourceTextBlock<TSourceId, TextId>>;
    getText(id: TextId): Promise<TextBlock<TSourceId> | undefined>;
    getMultipleText(ids: TextId[]): Promise<TextBlock<TSourceId>[]>;
}
export declare function createTextStore<TSourceId = string>(settings: TemporalLogSettings, rootPath: string, folderSettings?: ObjectFolderSettings, fSys?: FileSystem): Promise<TextStore<string, TSourceId>>;
//# sourceMappingURL=textStore.d.ts.map