// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { extractRelevantExifTags } from "common-utils";
import { normalizeParamString } from "agent-cache";
export function createChatHistory(init) {
    let enabled = init;
    return {
        enable(value) {
            enabled = value;
        },
        entries: [],
        getPromptSections(maxChars = 2000) {
            const sections = [];
            // Find the last N that can fit the character quota
            let totalLength = 0;
            let i = this.entries.length - 1;
            // Get the range of sections that could be pushed on, NEWEST first
            while (i >= 0) {
                const nextLength = this.entries[i].text.length;
                if (nextLength + totalLength > maxChars) {
                    ++i;
                    break;
                }
                totalLength += nextLength;
                --i;
            }
            if (i < 0) {
                i = 0;
            }
            for (; i < this.entries.length; ++i) {
                const entry = this.entries[i];
                if (entry.text.length > 0) {
                    sections.push({ role: entry.role, content: entry.text });
                }
                if (entry.role === "user" &&
                    entry.attachments &&
                    entry.attachments.length > 0) {
                    for (const attachment of entry.attachments) {
                        sections.push({
                            role: entry.role,
                            content: [
                                {
                                    type: "text",
                                    text: attachment.storageLocation,
                                },
                            ],
                        });
                        sections.push({
                            role: entry.role,
                            content: [
                                {
                                    type: "text",
                                    text: `EXIF Tags: ${extractRelevantExifTags(attachment.exifTags)}`,
                                },
                            ],
                        });
                        sections.push({
                            role: entry.role,
                            content: [
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: attachment.image,
                                        detail: "high",
                                    },
                                },
                            ],
                        });
                    }
                }
            }
            return sections;
        },
        getCurrentInstructions() {
            const instructions = [];
            if (this.entries.length === 0) {
                return undefined;
            }
            let i = this.entries.length - 1;
            if (this.entries[i].role === "user") {
                i--;
            }
            while (i >= 0) {
                const entry = this.entries[i];
                if (entry.role === "user") {
                    break;
                }
                if (entry.additionalInstructions) {
                    instructions.push(...entry.additionalInstructions);
                }
                i--;
            }
            return instructions.length > 0 ? instructions : undefined;
        },
        addUserEntry(text, id, attachments) {
            if (enabled) {
                this.entries.push({
                    role: "user",
                    text,
                    id,
                    attachments,
                });
            }
        },
        addAssistantEntry(text, id, sourceAppAgentName, entities, additionalInstructions) {
            if (enabled) {
                this.entries.push({
                    role: "assistant",
                    text,
                    id,
                    sourceAppAgentName,
                    entities: structuredClone(entities), // make a copy so that it doesn't get modified by others later.
                    additionalInstructions,
                });
            }
        },
        getTopKEntities(k) {
            const uniqueEntities = new Map();
            let found = 0;
            const result = [];
            // loop over entries from last to first
            for (let i = this.entries.length - 1; i >= 0; i--) {
                const entry = this.entries[i];
                if (entry.role === "user" || entry.entities === undefined) {
                    continue;
                }
                const promptEntities = [];
                for (const entity of entry.entities) {
                    // Multiple entities may have the same name ('Design meeting') but different
                    // entity instances. E.g. {Design meeting, on 9/12} vs {Design meeting, on 9/19}
                    // LLM like to correct/change casing.  Normalize for look up.
                    const normalizedName = normalizeParamString(entity.name);
                    const uniqueIndex = `${normalizedName}.${entity.type}`;
                    let existing = uniqueEntities.get(uniqueIndex);
                    const promptEntity = {
                        ...entity,
                        sourceAppAgentName: entry.sourceAppAgentName,
                    };
                    if (existing) {
                        if (existing.some((e) => e.sourceAppAgentName ===
                            entry.sourceAppAgentName &&
                            e.uniqueId === entity.uniqueId)) {
                            // Duplicate
                            continue;
                        }
                        existing.push(promptEntity);
                    }
                    else {
                        uniqueEntities.set(uniqueIndex, [promptEntity]);
                    }
                    promptEntities.push(promptEntity);
                    found++;
                    // Continue to finish all the entity for this entry even when we have enough
                }
                result.unshift(promptEntities);
                // Stop if we have more then enough
                if (found >= k) {
                    break;
                }
            }
            return result.flat();
        },
    };
}
//# sourceMappingURL=chatHistory.js.map