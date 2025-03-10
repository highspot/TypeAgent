// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ConversationIndex, createConversationSettings, addMetadataToIndex, buildSecondaryIndexes, ConversationSecondaryIndexes, ConversationThreads, buildConversationIndex, writeConversationDataToFile, readConversationDataFromFile, } from "knowpro";
import { conversation as kpLib, split } from "knowledge-processor";
import { collections, dateTime, getFileName, readAllText } from "typeagent";
// metadata for podcast messages
export class PodcastMessageMeta {
    constructor(speaker) {
        this.speaker = speaker;
        this.listeners = [];
    }
    getKnowledge() {
        if (this.speaker === undefined) {
            return {
                entities: [],
                actions: [],
                inverseActions: [],
                topics: [],
            };
        }
        else {
            const entities = [];
            entities.push({
                name: this.speaker,
                type: ["person"],
            });
            const listenerEntities = this.listeners.map((listener) => {
                return {
                    name: listener,
                    type: ["person"],
                };
            });
            entities.push(...listenerEntities);
            const actions = [];
            for (const listener of this.listeners) {
                actions.push({
                    verbs: ["say"],
                    verbTense: "past",
                    subjectEntityName: this.speaker,
                    objectEntityName: listener,
                });
            }
            return {
                entities,
                actions,
                inverseActions: [],
                topics: [],
            };
        }
    }
}
function assignMessageListeners(msgs, participants) {
    for (const msg of msgs) {
        if (msg.metadata.speaker) {
            let listeners = [];
            for (const p of participants) {
                if (p !== msg.metadata.speaker) {
                    listeners.push(p);
                }
            }
            msg.metadata.listeners = listeners;
        }
    }
}
export class PodcastMessage {
    constructor(textChunks, metadata, tags = []) {
        this.textChunks = textChunks;
        this.metadata = metadata;
        this.tags = tags;
    }
    addTimestamp(timestamp) {
        this.timestamp = timestamp;
    }
    addContent(content) {
        this.textChunks[0] += content;
    }
}
export class Podcast {
    constructor(nameTag = "", messages = [], tags = [], semanticRefs = []) {
        this.nameTag = nameTag;
        this.messages = messages;
        this.tags = tags;
        this.semanticRefs = semanticRefs;
        this.settings = createConversationSettings();
        this.semanticRefIndex = new ConversationIndex();
        this.secondaryIndexes = new PodcastSecondaryIndexes(this.settings);
    }
    addMetadataToIndex() {
        if (this.semanticRefIndex) {
            addMetadataToIndex(this.messages, this.semanticRefs, this.semanticRefIndex);
        }
    }
    generateTimestamps(startDate, lengthMinutes = 60) {
        timestampMessages(this.messages, startDate, dateTime.addMinutesToDate(startDate, lengthMinutes));
    }
    async buildIndex(eventHandler) {
        this.addMetadataToIndex();
        const result = await buildConversationIndex(this, eventHandler);
        if (!result.error) {
            // buildConversationIndex already built all aliases
            await this.buildSecondaryIndexes(false);
            await this.secondaryIndexes.threads.buildIndex();
        }
        return result;
    }
    async serialize() {
        const data = {
            nameTag: this.nameTag,
            messages: this.messages,
            tags: this.tags,
            semanticRefs: this.semanticRefs,
            semanticIndexData: this.semanticRefIndex?.serialize(),
            relatedTermsIndexData: this.secondaryIndexes.termToRelatedTermsIndex.serialize(),
            threadData: this.secondaryIndexes.threads.serialize(),
        };
        return data;
    }
    async deserialize(podcastData) {
        this.nameTag = podcastData.nameTag;
        this.messages = podcastData.messages;
        this.semanticRefs = podcastData.semanticRefs;
        this.tags = podcastData.tags;
        if (podcastData.semanticIndexData) {
            this.semanticRefIndex = new ConversationIndex(podcastData.semanticIndexData);
        }
        if (podcastData.relatedTermsIndexData) {
            this.secondaryIndexes.termToRelatedTermsIndex.deserialize(podcastData.relatedTermsIndexData);
        }
        if (podcastData.threadData) {
            this.secondaryIndexes.threads = new ConversationThreads(this.settings.threadSettings);
            this.secondaryIndexes.threads.deserialize(podcastData.threadData);
        }
        await this.buildSecondaryIndexes(true);
    }
    async writeToFile(dirPath, baseFileName) {
        const data = await this.serialize();
        await writeConversationDataToFile(data, dirPath, baseFileName);
    }
    static async readFromFile(dirPath, baseFileName) {
        const podcast = new Podcast();
        const data = await readConversationDataFromFile(dirPath, baseFileName, podcast.settings.relatedTermIndexSettings.embeddingIndexSettings
            ?.embeddingSize);
        if (data) {
            podcast.deserialize(data);
        }
        return podcast;
    }
    async buildSecondaryIndexes(all) {
        if (all) {
            await buildSecondaryIndexes(this, false);
        }
        this.buildParticipantAliases();
    }
    buildParticipantAliases() {
        const aliases = this.secondaryIndexes.termToRelatedTermsIndex.aliases;
        aliases.clear();
        const nameToAliasMap = this.collectParticipantAliases();
        for (const name of nameToAliasMap.keys()) {
            const relatedTerms = nameToAliasMap
                .get(name)
                .map((alias) => {
                return { text: alias };
            });
            aliases.addRelatedTerm(name, relatedTerms);
        }
    }
    collectParticipantAliases() {
        const aliases = new collections.MultiMap();
        for (const message of this.messages) {
            const metadata = message.metadata;
            collectName(metadata.speaker);
            for (const listener of metadata.listeners) {
                collectName(listener);
            }
        }
        function collectName(participantName) {
            if (participantName) {
                participantName = participantName.toLocaleLowerCase();
                const parsedName = kpLib.splitParticipantName(participantName);
                if (parsedName && parsedName.firstName && parsedName.lastName) {
                    // If participantName is a full name, then associate firstName with the full name
                    aliases.addUnique(parsedName.firstName, participantName);
                    aliases.addUnique(participantName, parsedName.firstName);
                }
            }
        }
        return aliases;
    }
}
export class PodcastSecondaryIndexes extends ConversationSecondaryIndexes {
    constructor(settings) {
        super(settings.relatedTermIndexSettings);
        this.threads = new ConversationThreads(settings.threadSettings);
    }
}
export async function importPodcast(transcriptFilePath, podcastName, startDate, lengthMinutes = 60) {
    const transcriptText = await readAllText(transcriptFilePath);
    podcastName ??= getFileName(transcriptFilePath);
    const transcriptLines = split(transcriptText, /\r?\n/, {
        removeEmpty: true,
        trim: true,
    });
    const turnParseRegex = /^(?<speaker>[A-Z0-9 ]+:)?(?<speech>.*)$/;
    const participants = new Set();
    const msgs = [];
    let curMsg = undefined;
    for (const line of transcriptLines) {
        const match = turnParseRegex.exec(line);
        if (match && match.groups) {
            let speaker = match.groups["speaker"];
            let speech = match.groups["speech"];
            if (curMsg) {
                if (speaker) {
                    msgs.push(curMsg);
                    curMsg = undefined;
                }
                else {
                    curMsg.addContent("\n" + speech);
                }
            }
            if (!curMsg) {
                if (speaker) {
                    speaker = speaker.trim();
                    if (speaker.endsWith(":")) {
                        speaker = speaker.slice(0, speaker.length - 1);
                    }
                    speaker = speaker.toLocaleLowerCase();
                    participants.add(speaker);
                }
                curMsg = new PodcastMessage([speech], new PodcastMessageMeta(speaker));
            }
        }
    }
    if (curMsg) {
        msgs.push(curMsg);
    }
    assignMessageListeners(msgs, participants);
    const pod = new Podcast(podcastName, msgs, [podcastName]);
    if (startDate) {
        pod.generateTimestamps(startDate, lengthMinutes);
    }
    // TODO: add more tags
    return pod;
}
/**
 * Text (such as a transcript) can be collected over a time range.
 * This text can be partitioned into blocks. However, timestamps for individual blocks are not available.
 * Assigns individual timestamps to blocks proportional to their lengths.
 * @param turns Transcript turns to assign timestamps to
 * @param startDate starting
 * @param endDate
 */
export function timestampMessages(messages, startDate, endDate) {
    let startTicks = startDate.getTime();
    const ticksLength = endDate.getTime() - startTicks;
    if (ticksLength <= 0) {
        throw new Error(`${startDate} is not < ${endDate}`);
    }
    let messageLengths = messages.map((m) => messageLength(m));
    const textLength = messageLengths.reduce((total, l) => total + l, 0);
    const ticksPerChar = ticksLength / textLength;
    for (let i = 0; i < messages.length; ++i) {
        messages[i].timestamp = new Date(startTicks).toISOString();
        // Now, we will 'elapse' time .. proportional to length of the text
        // This assumes that each speaker speaks equally fast...
        startTicks += ticksPerChar * messageLengths[i];
    }
    function messageLength(message) {
        return message.textChunks.reduce((total, chunk) => total + chunk.length, 0);
    }
}
//# sourceMappingURL=importPodcast.js.map