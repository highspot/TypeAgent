import { IConversation, IMessage, SemanticRef, ConversationIndex, IndexingResults, ConversationSettings, IKnowledgeSource, ConversationSecondaryIndexes, ConversationThreads, IndexingEventHandlers, IConversationDataWithIndexes } from "knowpro";
import { conversation as kpLib } from "knowledge-processor";
export declare class PodcastMessageMeta implements IKnowledgeSource {
    speaker?: string | undefined;
    listeners: string[];
    constructor(speaker?: string | undefined);
    getKnowledge(): {
        entities: kpLib.ConcreteEntity[];
        actions: kpLib.Action[];
        inverseActions: never[];
        topics: never[];
    };
}
export declare class PodcastMessage implements IMessage<PodcastMessageMeta> {
    textChunks: string[];
    metadata: PodcastMessageMeta;
    tags: string[];
    timestamp: string | undefined;
    constructor(textChunks: string[], metadata: PodcastMessageMeta, tags?: string[]);
    addTimestamp(timestamp: string): void;
    addContent(content: string): void;
}
export declare class Podcast implements IConversation<PodcastMessageMeta> {
    nameTag: string;
    messages: PodcastMessage[];
    tags: string[];
    semanticRefs: SemanticRef[];
    settings: ConversationSettings;
    semanticRefIndex: ConversationIndex;
    secondaryIndexes: PodcastSecondaryIndexes;
    constructor(nameTag?: string, messages?: PodcastMessage[], tags?: string[], semanticRefs?: SemanticRef[]);
    addMetadataToIndex(): void;
    generateTimestamps(startDate: Date, lengthMinutes?: number): void;
    buildIndex(eventHandler?: IndexingEventHandlers): Promise<IndexingResults>;
    serialize(): Promise<PodcastData>;
    deserialize(podcastData: PodcastData): Promise<void>;
    writeToFile(dirPath: string, baseFileName: string): Promise<void>;
    static readFromFile(dirPath: string, baseFileName: string): Promise<Podcast | undefined>;
    private buildSecondaryIndexes;
    private buildParticipantAliases;
    private collectParticipantAliases;
}
export declare class PodcastSecondaryIndexes extends ConversationSecondaryIndexes {
    threads: ConversationThreads;
    constructor(settings: ConversationSettings);
}
export interface PodcastData extends IConversationDataWithIndexes<PodcastMessage> {
}
export declare function importPodcast(transcriptFilePath: string, podcastName?: string, startDate?: Date, lengthMinutes?: number): Promise<Podcast>;
/**
 * Text (such as a transcript) can be collected over a time range.
 * This text can be partitioned into blocks. However, timestamps for individual blocks are not available.
 * Assigns individual timestamps to blocks proportional to their lengths.
 * @param turns Transcript turns to assign timestamps to
 * @param startDate starting
 * @param endDate
 */
export declare function timestampMessages(messages: IMessage[], startDate: Date, endDate: Date): void;
//# sourceMappingURL=importPodcast.d.ts.map