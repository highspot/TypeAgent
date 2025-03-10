import { TextLocation } from "./interfaces.js";
import { IndexingEventHandlers } from "./interfaces.js";
import { TextEmbeddingIndexSettings } from "./fuzzyIndex.js";
export type ScoredTextLocation = {
    score: number;
    textLocation: TextLocation;
};
export interface ITextToTextLocationIndexFuzzy {
    lookupText(text: string, maxMatches?: number, thresholdScore?: number): Promise<ScoredTextLocation[]>;
    serialize(): ITextToTextLocationIndexData;
    deserialize(data: ITextToTextLocationIndexData): void;
}
export interface ITextToTextLocationIndexData {
    textLocations: TextLocation[];
    embeddings: Float32Array[];
}
export declare class TextToTextLocationIndexFuzzy implements ITextToTextLocationIndexFuzzy {
    private textLocations;
    private embeddingIndex;
    constructor(settings: TextEmbeddingIndexSettings);
    addTextLocation(text: string, textLocation: TextLocation): Promise<void>;
    addTextLocationsBatched(textAndLocations: [string, TextLocation][], eventHandler?: IndexingEventHandlers): Promise<void>;
    lookupText(text: string, maxMatches?: number, thresholdScore?: number): Promise<ScoredTextLocation[]>;
    serialize(): ITextToTextLocationIndexData;
    deserialize(data: ITextToTextLocationIndexData): void;
}
//# sourceMappingURL=textLocationIndex.d.ts.map