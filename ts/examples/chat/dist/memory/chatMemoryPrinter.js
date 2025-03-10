// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as knowLib from "knowledge-processor";
import { conversation } from "knowledge-processor";
import { millisecondsToString, } from "interactive-app";
import { ChatPrinter } from "../chatPrinter.js";
import chalk from "chalk";
import { pathToFileURL } from "url";
import { getSearchQuestion } from "./common.js";
export class ChatMemoryPrinter extends ChatPrinter {
    constructor(io) {
        super(io);
    }
    writeLink(filePath) {
        this.writeInColor(chalk.cyan, pathToFileURL(filePath).toString());
        return this;
    }
    writeBlocks(color, blocks, ids) {
        if (blocks && blocks.length > 0) {
            blocks.forEach((b, i) => {
                if (ids) {
                    this.writeInColor(color, `[${ids[i]}]`);
                }
                const value = b.value.trim();
                if (value.length > 0) {
                    this.writeInColor(color, b.value);
                }
            });
        }
    }
    writeSourceBlock(block) {
        this.writeTimestamp(block.timestamp);
        this.writeInColor(chalk.cyan, block.blockId);
        this.writeLine(block.value);
        if (block.sourceIds) {
            this.writeList(block.sourceIds, { type: "ul" });
        }
    }
    writeTimestamp(timestamp) {
        if (timestamp) {
            this.writeInColor(chalk.gray, timestamp.toString());
        }
    }
    writeBatchProgress(batch, label, total) {
        label = label ? label + " " : "";
        let text = total !== undefined && total > 0
            ? `[${label}(${batch.startAt + 1} to ${batch.startAt + batch.value.length}) / ${total}]`
            : `[${label}${batch.startAt + 1} to ${batch.startAt + batch.value.length}]`;
        this.writeInColor(chalk.gray, text);
    }
    writeTemporalBlock(color, block) {
        this.writeTimestamp(block.timestamp);
        this.writeInColor(color, block.value.value);
    }
    writeTemporalBlocks(color, blocks) {
        if (blocks && blocks.length > 0) {
            blocks.forEach((b) => {
                if (b) {
                    this.writeTemporalBlock(color, b);
                    this.writeLine();
                }
            });
        }
    }
    writeKnowledge(knowledge) {
        this.writeTopics(knowledge.topics);
        this.writeEntities(knowledge.entities);
        this.writeActions(knowledge.actions);
    }
    writeTopics(topics) {
        if (topics && topics.length > 0) {
            this.writeTitle("Topics");
            this.writeList(topics, { type: "ul" });
            this.writeLine();
        }
    }
    writeEntities(entities) {
        if (entities && entities.length > 0) {
            this.writeTitle("Entities");
            for (const entity of entities) {
                this.writeCompositeEntity(conversation.toCompositeEntity(entity));
                this.writeLine();
            }
        }
    }
    writeCompositeEntity(entity) {
        if (entity) {
            this.writeLine(entity.name.toUpperCase());
            this.writeList(entity.type, { type: "csv" });
            this.writeList(entity.facets, { type: "ul" });
        }
    }
    writeExtractedEntities(entities) {
        if (entities) {
            if (Array.isArray(entities)) {
                if (entities.length > 0) {
                    this.writeTitle("Entities");
                    for (const entity of entities) {
                        if (entity) {
                            this.writeCompositeEntity(conversation.toCompositeEntity(entity.value));
                            this.writeLine();
                        }
                    }
                }
            }
            else {
                this.writeCompositeEntity(conversation.toCompositeEntity(entities.value));
            }
        }
    }
    writeCompositeEntities(entities) {
        if (entities && entities.length > 0) {
            entities = knowLib.sets.removeUndefined(entities);
            entities.sort((x, y) => x.name.localeCompare(y.name));
            this.writeTitle("Entities");
            for (const entity of entities) {
                this.writeCompositeEntity(entity);
                this.writeLine();
            }
            this.writeLine();
        }
    }
    writeCompositeAction(action) {
        if (action) {
            this.writeRecord(action);
        }
    }
    writeActionGroups(actions) {
        if (actions.length > 0) {
            this.writeTitle("Actions");
            for (const action of actions) {
                const group = {};
                if (action.subject) {
                    group.subject = action.subject;
                }
                if (action.verbs) {
                    group.verbs = action.verbs;
                }
                if (action.object) {
                    group.object = action.object;
                }
                this.writeRecord(group);
                if (action.values) {
                    for (let i = 0; i < action.values.length; ++i) {
                        this.writeRecord(action.values[i], false, undefined, "  ");
                        this.writeLine();
                    }
                }
                else {
                    this.writeLine();
                }
            }
        }
    }
    writeAction(action, writeParams = true) {
        if (action) {
            this.writeLine(conversation.actionToString(action));
            if (writeParams && action.params) {
                for (const param of action.params) {
                    this.writeBullet(conversation.actionParamToString(param));
                }
            }
        }
    }
    writeActions(actions) {
        if (actions && actions.length > 0) {
            this.writeTitle("Actions");
            this.writeList(actions.map((a) => conversation.actionToString(a)));
            this.writeLine();
        }
    }
    writeExtractedActions(actions) {
        if (actions && actions.length > 0) {
            this.writeTitle("Actions");
            for (const a of actions) {
                if (a) {
                    this.writeCompositeAction(conversation.toCompositeAction(a.value));
                }
                this.writeLine();
            }
            this.writeLine();
        }
    }
    writeSearchResponse(response) {
        this.writeTopics(response.getTopics());
        this.writeCompositeEntities(response.getEntities());
        this.writeActionGroups(response.getActions());
        if (response.messages) {
            this.writeTemporalBlocks(chalk.cyan, response.messages);
        }
    }
    writeResultStats(response) {
        if (response !== undefined) {
            const allTopics = response.getTopics();
            if (allTopics && allTopics.length > 0) {
                this.writeLine(`Topic Hit Count: ${allTopics.length}`);
            }
            else {
                const topicIds = new Set(response.allTopicIds());
                this.writeLine(`Topic Hit Count: ${topicIds.size}`);
            }
            const allEntities = response.getEntities();
            if (allEntities && allEntities.length > 0) {
                this.writeLine(`Entity Hit Count: ${allEntities.length}`);
            }
            else {
                const entityIds = new Set(response.allEntityIds());
                this.writeLine(`Entity to Message Hit Count: ${entityIds.size}`);
            }
            const allActions = response.getActions();
            //const allActions = [...response.allActionIds()];
            if (allActions && allActions.length > 0) {
                this.writeLine(`Action Hit Count: ${allActions.length}`);
            }
            else {
                const actionIds = new Set(response.allActionIds());
                this.writeLine(`Action to Message Hit Count: ${actionIds.size}`);
            }
            const messageHitCount = response.messages
                ? response.messages.length
                : 0;
            this.writeLine(`Message Hit Count: ${messageHitCount}`);
        }
    }
    writeSearchQuestion(result, debug = false) {
        if (result) {
            const question = getSearchQuestion(result);
            if (question) {
                this.writeInColor(chalk.cyanBright, `Question: ${question}`);
                this.writeLine();
            }
        }
    }
    writeSearchTermsResult(result, debug = false) {
        this.writeSearchQuestion(result);
        if (result.response && result.response.answer) {
            this.writeResultStats(result.response);
            this.writeAnswer(result.response.answer, result.response.fallbackUsed);
            this.writeLine();
            if (debug) {
                this.writeSearchResponse(result.response);
            }
        }
    }
    writeAnswer(response, fallback = false) {
        if (response.answer) {
            let answer = response.answer;
            this.writeInColor(chalk.green, answer);
        }
        else if (response.whyNoAnswer) {
            const answer = response.whyNoAnswer;
            this.writeInColor(chalk.red, answer);
        }
    }
    writeIndexingMetrics(stats, totalItems, timing) {
        const status = `[${timing.elapsedString()}, ${millisecondsToString(stats.totalStats.timeMs, "m")} for ${totalItems} items]`;
        this.writeInColor(chalk.green, status);
    }
}
//# sourceMappingURL=chatMemoryPrinter.js.map