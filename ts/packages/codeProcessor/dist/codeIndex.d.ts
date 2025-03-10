import { ObjectSerializer, ScoredItem } from "typeagent";
import { CodeBlock, StoredCodeBlock } from "./code.js";
import { TextEmbeddingModel } from "aiclient";
import { CodeDocumentation } from "./codeDocSchema.js";
export interface SemanticCodeIndex {
    find(
        question: string,
        maxMatches: number,
        minScore?: number,
    ): Promise<ScoredItem<string>[]>;
    get(name: string): Promise<StoredCodeBlock | undefined>;
    put(
        code: CodeBlock,
        name: string,
        sourcePath?: string | undefined,
    ): Promise<CodeDocumentation>;
    remove(name: string): Promise<void>;
}
export interface CodeDocumenter {
    document(code: CodeBlock): Promise<CodeDocumentation>;
}
export declare function createSemanticCodeIndex(
    folderPath: string,
    codeReviewer: CodeDocumenter,
    embeddingModel?: TextEmbeddingModel,
    objectSerializer?: ObjectSerializer,
): Promise<SemanticCodeIndex>;
//# sourceMappingURL=codeIndex.d.ts.map
