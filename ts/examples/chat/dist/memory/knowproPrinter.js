// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as kp from "knowpro";
import * as knowLib from "knowledge-processor";
import { ChatPrinter } from "../chatPrinter.js";
import chalk from "chalk";
import { textLocationToString } from "./knowproCommon.js";
export class KnowProPrinter extends ChatPrinter {
    constructor(conversation = undefined) {
        super();
        this.conversation = conversation;
        this.sortAsc = true;
    }
    writeDateRange(dateTime) {
        this.writeLine(`Started: ${dateTime.start}`);
        if (dateTime.end) {
            this.writeLine(`Ended: ${dateTime.end}`);
        }
    }
    writeMetadata(metadata) {
        this.write("Metadata: ").writeJson(metadata);
    }
    writeMessage(message) {
        const prevColor = this.setForeColor(chalk.cyan);
        try {
            this.writeNameValue("Timestamp", message.timestamp);
            this.writeList(message.tags, { type: "csv", title: "Tags" });
            this.writeMetadata(message.metadata);
        }
        finally {
            this.setForeColor(prevColor);
        }
        for (const chunk of message.textChunks) {
            this.write(chunk);
        }
        this.writeLine();
        return this;
    }
    writeEntity(entity) {
        if (entity !== undefined) {
            this.writeLine(entity.name.toUpperCase());
            this.writeList(entity.type, { type: "csv" });
            if (entity.facets) {
                const facetList = entity.facets.map((f) => knowLib.conversation.facetToString(f));
                this.writeList(facetList, { type: "ul" });
            }
        }
        return this;
    }
    writeAction(action) {
        if (action !== undefined) {
            this.writeLine(knowLib.conversation.actionToString(action));
        }
        return this;
    }
    writeTopic(topic) {
        if (topic !== undefined) {
            this.writeLine(topic.text);
        }
        return this;
    }
    writeTag(tag) {
        if (tag !== undefined) {
            this.writeLine(tag.text);
        }
        return this;
    }
    writeSemanticRef(semanticRef) {
        switch (semanticRef.knowledgeType) {
            default:
                this.writeLine(semanticRef.knowledgeType);
                break;
            case "entity":
                this.writeEntity(semanticRef.knowledge);
                break;
            case "action":
                this.writeAction(semanticRef.knowledge);
                break;
            case "topic":
                this.writeTopic(semanticRef.knowledge);
                break;
        }
        return this;
    }
    writeSemanticRefs(refs) {
        if (refs && refs.length > 0) {
            for (const ref of refs) {
                this.writeSemanticRef(ref);
                this.writeLine();
            }
        }
        return this;
    }
    writeScoredSemanticRefs(semanticRefMatches, semanticRefs, maxToDisplay) {
        this.writeLine(`Displaying ${maxToDisplay} matches of total ${semanticRefMatches.length}`);
        if (this.sortAsc) {
            this.writeLine(`Sorted in ascending order (lowest first)`);
        }
        const matchesToDisplay = semanticRefMatches.slice(0, maxToDisplay);
        for (let i = 0; i < matchesToDisplay.length; ++i) {
            let pos = this.sortAsc ? matchesToDisplay.length - (i + 1) : i;
            this.writeScoredRef(pos, matchesToDisplay.length, matchesToDisplay[pos], semanticRefs);
        }
        return this;
    }
    writeScoredKnowledge(scoredKnowledge) {
        switch (scoredKnowledge.knowledgeType) {
            default:
                this.writeLine(scoredKnowledge.knowledgeType);
                break;
            case "entity":
                this.writeEntity(scoredKnowledge.knowledge);
                break;
            case "action":
                this.writeAction(scoredKnowledge.knowledge);
                break;
            case "topic":
                this.writeTopic(scoredKnowledge.knowledge);
                break;
        }
        return this;
    }
    writeScoredRef(matchNumber, totalMatches, scoredRef, semanticRefs) {
        const semanticRef = semanticRefs[scoredRef.semanticRefIndex];
        this.writeInColor(chalk.green, `#${matchNumber + 1} / ${totalMatches}: <${scoredRef.semanticRefIndex}> ${semanticRef.knowledgeType} [${scoredRef.score}]`);
        this.writeSemanticRef(semanticRef);
        this.writeLine();
    }
    writeSearchResult(conversation, result, maxToDisplay) {
        if (result) {
            this.writeListInColor(chalk.cyanBright, result.termMatches, {
                title: "Matched terms",
                type: "ol",
            });
            maxToDisplay = Math.min(result.semanticRefMatches.length, maxToDisplay);
            this.writeScoredSemanticRefs(result.semanticRefMatches, conversation.semanticRefs, maxToDisplay);
        }
        return this;
    }
    writeSearchResults(conversation, results, maxToDisplay, distinct = false) {
        if (distinct) {
            this.writeResultDistinct(conversation, "topic", results, maxToDisplay);
            this.writeResultDistinct(conversation, "entity", results, maxToDisplay);
        }
        else {
            this.writeResult(conversation, "tag", results, maxToDisplay);
            this.writeResult(conversation, "topic", results, maxToDisplay);
            this.writeResult(conversation, "action", results, maxToDisplay);
            this.writeResult(conversation, "entity", results, maxToDisplay);
        }
        return this;
    }
    writeResult(conversation, type, results, maxToDisplay) {
        const result = results.get(type);
        if (result !== undefined) {
            this.writeTitle(type.toUpperCase());
            this.writeSearchResult(conversation, result, maxToDisplay);
        }
        return this;
    }
    writeResultDistinct(conversation, type, results, maxToDisplay) {
        if (type !== "topic" && type !== "entity") {
            return;
        }
        let distinctKnowledge;
        switch (type) {
            default:
                return;
            case "topic":
                const topics = results.get("topic");
                if (topics) {
                    this.writeTitle(type.toUpperCase());
                    distinctKnowledge = kp.getDistinctTopicMatches(conversation.semanticRefs, topics.semanticRefMatches, maxToDisplay);
                }
                break;
            case "entity":
                const entities = results.get("entity");
                if (entities) {
                    this.writeTitle(type.toUpperCase());
                    distinctKnowledge = kp.getDistinctEntityMatches(conversation.semanticRefs, entities.semanticRefMatches, maxToDisplay);
                }
                break;
        }
        if (distinctKnowledge) {
            for (let i = 0; i < distinctKnowledge.length; ++i) {
                let pos = this.sortAsc ? distinctKnowledge.length - (i + 1) : i;
                const knowledge = distinctKnowledge[pos];
                this.writeInColor(chalk.green, `#${pos + 1} / ${distinctKnowledge.length}: [${knowledge.score}]`);
                this.writeScoredKnowledge(knowledge);
                this.writeLine();
            }
        }
        return this;
    }
    writeConversationInfo(conversation) {
        this.writeTitle(conversation.nameTag);
        const timeRange = kp.getTimeRangeForConversation(conversation);
        if (timeRange) {
            this.write("Time range: ");
            this.writeDateRange(timeRange);
        }
        this.writeLine(`${conversation.messages.length} messages`);
        return this;
    }
    writePodcastInfo(podcast) {
        this.writeConversationInfo(podcast);
        this.writeList(getPodcastParticipants(podcast), {
            type: "csv",
            title: "Participants",
        });
        return this;
    }
    writeImageCollectionInfo(imageCollection) {
        this.writeLine(`${imageCollection.nameTag}: ${imageCollection.messages.length} images.`);
        return this;
    }
    writeIndexingResults(results) {
        if (results.chunksIndexedUpto) {
            this.writeLine(`Indexed upto: ${textLocationToString(results.chunksIndexedUpto)}`);
        }
        if (results.error) {
            this.writeError(results.error);
        }
        return this;
    }
    writeSearchFilter(action) {
        this.writeInColor(chalk.cyanBright, `Question: ${action.parameters.question}`);
        this.writeLine();
        this.writeJson(action.parameters.filters);
    }
}
function getPodcastParticipants(podcast) {
    const participants = new Set();
    for (let message of podcast.messages) {
        const meta = message.metadata;
        if (meta.speaker) {
            participants.add(meta.speaker);
        }
        meta.listeners.forEach((l) => participants.add(l));
    }
    return [...participants.values()];
}
//# sourceMappingURL=knowproPrinter.js.map