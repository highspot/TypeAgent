import { IConversation, IKnowledgeSource, IMessage, SemanticRef, ConversationIndex, IndexingResults, ConversationSettings, ConversationSecondaryIndexes, IndexingEventHandlers, IConversationDataWithIndexes } from "knowpro";
import { conversation as kpLib, image } from "knowledge-processor";
export interface ImageCollectionData extends IConversationDataWithIndexes<Image> {
}
export declare class Image implements IMessage<ImageMeta> {
    textChunks: string[];
    metadata: ImageMeta;
    tags: string[];
    timestamp: string | undefined;
    constructor(textChunks: string[], metadata: ImageMeta, tags?: string[]);
}
export declare class ImageMeta implements IKnowledgeSource {
    fileName: string;
    img: image.Image;
    constructor(fileName: string, img: image.Image);
    getKnowledge(): {
        entities: kpLib.ConcreteEntity[];
        actions: kpLib.Action[];
        inverseActions: kpLib.Action[];
        topics: string[];
    };
}
export declare class ImageCollection implements IConversation<ImageMeta> {
    nameTag: string;
    messages: Image[];
    tags: string[];
    semanticRefs: SemanticRef[];
    settings: ConversationSettings;
    semanticRefIndex: ConversationIndex;
    secondaryIndexes: ConversationSecondaryIndexes;
    constructor(nameTag?: string, messages?: Image[], tags?: string[], semanticRefs?: SemanticRef[]);
    addMetadataToIndex(): void;
    buildIndex(eventHandler?: IndexingEventHandlers): Promise<IndexingResults>;
    serialize(): Promise<ImageCollectionData>;
    deserialize(data: ImageCollectionData): Promise<void>;
    writeToFile(dirPath: string, baseFileName: string): Promise<void>;
    static readFromFile(dirPath: string, baseFileName: string): Promise<ImageCollection | undefined>;
}
/**
 * Indexes the supplied image or images in the supplied folder.
 *
 * @param imagePath - The path to the image file or a folder containing images
 * @param recursive - A flag indicating if the search should include subfolders
 * @returns - The imported images as an image collection.
 */
export declare function importImages(imagePath: string, cachePath: string | undefined, recursive?: boolean, callback?: (text: string, count: number, max: number) => void): Promise<ImageCollection>;
//# sourceMappingURL=importImages.d.ts.map