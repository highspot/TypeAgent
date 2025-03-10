import { KnowledgeStore, TextIndexSettings } from "knowledge-processor";
import { StoredCodeBlock } from "./code.js";
import { FileSystem, ObjectFolderSettings, ScoredItem } from "typeagent";
import { TextEmbeddingModel } from "aiclient";
import { CodeReviewer } from "./codeReviewer.js";
import { CodeReview, LineReview, Severity } from "./codeReviewSchema.js";
export type CodeBlockName = {
    name: string;
    namespace?: string | undefined;
};
export declare function codeBlockNameFromFilePath(
    filePath: string,
    name?: string,
): CodeBlockName;
export declare function codeBlockNameToString(cbName: CodeBlockName): string;
export type DeveloperMemorySettings = {
    codeReviewer: CodeReviewer;
    embeddingModel?: TextEmbeddingModel;
};
export interface DeveloperMemory<TCodeId = any, TReviewId = any> {
    readonly settings: DeveloperMemorySettings;
    readonly codeStore: KnowledgeStore<StoredCodeBlock>;
    readonly bugs: CodeReviewIndex<TReviewId, TCodeId>;
    readonly comments: CodeReviewIndex<TReviewId, TCodeId>;
    add(
        codeBlock: StoredCodeBlock,
        name: CodeBlockName,
        timestamp?: Date,
    ): Promise<TCodeId>;
    addReview(name: CodeBlockName | TCodeId, review: CodeReview): Promise<void>;
    get(name: CodeBlockName): Promise<StoredCodeBlock | undefined>;
    getId(name: CodeBlockName): TCodeId;
    getById(id: TCodeId): Promise<StoredCodeBlock | undefined>;
    searchCode(
        query: string,
        maxMatches: number,
        minScore?: number,
    ): Promise<ScoredItem<TCodeId>[]>;
}
export declare function createDeveloperMemory(
    settings: DeveloperMemorySettings,
    rootPath: string,
    folderSettings?: ObjectFolderSettings,
    fSys?: FileSystem,
): Promise<DeveloperMemory<string, string>>;
export type ExtractedCodeReview<TSourceId = any> = {
    value: LineReview;
    sourceId: TSourceId;
};
export type CodeReviewFilter = {
    severity?: Severity | undefined;
};
export interface CodeReviewIndex<TReviewId = any, TSourceId = any> {
    readonly store: KnowledgeStore<ExtractedCodeReview, TReviewId>;
    add(sourceId: TSourceId, review: LineReview[]): Promise<TReviewId[]>;
    search(
        query: string,
        maxMatches: number,
        minScore?: number,
    ): Promise<TReviewId[]>;
}
export declare function createCodeReviewIndex<TSourceId = any>(
    settings: TextIndexSettings,
    rootPath: string,
    folderSettings?: ObjectFolderSettings,
    fSys?: FileSystem,
): Promise<CodeReviewIndex<string, TSourceId>>;
//# sourceMappingURL=developerMemory.d.ts.map
