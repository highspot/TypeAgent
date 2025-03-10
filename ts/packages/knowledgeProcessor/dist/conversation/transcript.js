// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { asyncArray, cleanDir, dateTime, ensureDir, getFileName, readAllText, readJsonFile, writeJsonFile, writeJsonFiles, } from "typeagent";
import { TextBlockType } from "../text.js";
import { split, splitIntoLines } from "../textChunker.js";
import { dateToDateTime } from "./knowledgeActions.js";
import path from "path";
export async function createTranscript(transcriptFilePath, name, description, startAt, lengthMinutes) {
    const turns = await loadTurnsFromTranscriptFile(transcriptFilePath);
    const transcript = {
        turns,
        metadata: {
            sourcePath: transcriptFilePath,
            name,
            description,
            startAt,
            lengthMinutes,
        },
    };
    dateTime.stringToDate;
    const startTimestamp = new Date(startAt);
    if (!startTimestamp) {
        throw new Error("Invalid startAt");
    }
    const endTimestamp = dateTime.addMinutesToDate(startTimestamp, lengthMinutes);
    timestampTranscriptTurns(transcript.turns, startTimestamp, endTimestamp);
    return transcript;
}
export async function importTranscript(transcriptFilePath, name, description, startAt, lengthMinutes, clean = true) {
    const transcript = await createTranscript(transcriptFilePath, name, description, startAt, lengthMinutes);
    const transcriptFileName = getFileName(transcriptFilePath);
    const destFolderPath = path.join(path.dirname(transcriptFilePath), transcriptFileName);
    await saveTranscriptToFolder(transcript, destFolderPath, transcriptFileName);
    return transcript;
}
export async function saveTranscriptToFolder(transcript, destPath, baseTurnFileName, clean = true) {
    const metadataPath = path.join(destPath, "metadata.json");
    const turnsPath = path.join(destPath, "turns");
    if (clean) {
        await cleanDir(destPath);
    }
    await ensureDir(turnsPath);
    await writeJsonFile(metadataPath, transcript.metadata);
    await saveTranscriptTurnsToFolder(turnsPath, baseTurnFileName, transcript.turns);
}
/**
 * Converts a turn from a transcript into a conversation message
 * @param turn
 * @returns
 */
export function transcriptTurnToMessage(turn) {
    return {
        sender: getSpeaker(turn),
        recipients: turn.listeners,
        text: getMessageText(turn, true),
        timestamp: dateTime.stringToDate(turn.timestamp),
        knowledge: transcriptTurnToKnowledge(turn),
    };
}
var TurnVerbs;
(function (TurnVerbs) {
    TurnVerbs["say"] = "say";
})(TurnVerbs || (TurnVerbs = {}));
function transcriptTurnToKnowledge(turn) {
    return {
        entities: [],
        actions: transcriptTurnToActions(turn),
        inverseActions: [],
        topics: [],
    };
}
function transcriptTurnToActions(turn) {
    const actions = [];
    if (turn.speaker && turn.listeners) {
        for (const listener of turn.listeners) {
            actions.push(createAction(TurnVerbs.say, turn.speaker, listener));
        }
    }
    return actions;
}
function createAction(verb, from, to) {
    return {
        verbs: [verb],
        verbTense: "past",
        subjectEntityName: from,
        objectEntityName: "none",
        indirectObjectEntityName: to,
    };
}
/**
 * A transcript of a conversation contains turns. Splits a transcript file into individual turns
 * Each turn is a paragraph prefixed by the name of the speaker and is followed by speaker text.
 * Example of a turn:
 *   Macbeth:
 *   Tomorrow and tomorrow and tomorrow...
 *
 */
export function splitTranscriptIntoTurns(transcript) {
    transcript = transcript.trim();
    if (!transcript) {
        return [];
    }
    const lines = splitIntoLines(transcript, { trim: true, removeEmpty: true });
    const regex = /^(?<speaker>[A-Z0-9 ]+:)?(?<speech>.*)$/;
    const turns = [];
    const participants = new Set();
    let turn;
    for (const line of lines) {
        const match = regex.exec(line);
        if (match && match.groups) {
            let speaker = match.groups["speaker"];
            let speech = match.groups["speech"];
            if (turn) {
                if (speaker) {
                    turns.push(turn);
                    turn = undefined;
                }
                else {
                    // Existing turn
                    turn.speech.value += "\n" + speech;
                }
            }
            if (!turn) {
                if (speaker) {
                    speaker = speaker.trim();
                    if (speaker.endsWith(":")) {
                        speaker = speaker.slice(0, speaker.length - 1);
                    }
                    speaker = speaker.toUpperCase();
                    participants.add(speaker);
                }
                turn = {
                    speaker: speaker ?? "None",
                    speech: {
                        value: speech,
                        type: TextBlockType.Paragraph,
                    },
                };
            }
        }
    }
    if (turn) {
        turns.push(turn);
    }
    assignTurnListeners(turns, participants);
    return turns;
}
/**
 * Load turns from a transcript file
 * @param filePath
 * @returns
 */
export async function loadTurnsFromTranscriptFile(filePath) {
    const turns = splitTranscriptIntoTurns(await readAllText(filePath));
    const sourceId = [filePath];
    turns.forEach((t) => (t.speech.sourceIds = sourceId));
    return turns;
}
/**
 * Load a transcript turn
 * @param filePath
 * @returns
 */
export async function loadTranscriptTurn(filePath) {
    return readJsonFile(filePath);
}
export async function saveTranscriptTurnsToFolder(destFolderPath, baseFileName, turns) {
    await writeJsonFiles(destFolderPath, baseFileName, turns);
}
/**
 * Text (such as a transcript) can be collected over a time range.
 * This text can be partitioned into blocks. However, timestamps for individual blocks are not available.
 * Assigns individual timestamps to blocks proportional to their lengths.
 * @param turns Transcript turns to assign timestamps to
 * @param startTimestamp starting
 * @param endTimestamp
 */
export function timestampTranscriptTurns(turns, startTimestamp, endTimestamp) {
    let startTicks = startTimestamp.getTime();
    const ticksLength = endTimestamp.getTime() - startTicks;
    if (ticksLength <= 0) {
        throw new Error(`${startTimestamp} is not < ${endTimestamp}`);
    }
    const textLength = turns.reduce((total, t) => total + t.speech.value.length, 0);
    const ticksPerChar = ticksLength / textLength;
    for (let turn of turns) {
        turn.timestamp = new Date(startTicks).toISOString();
        // Now, we will 'elapse' time .. proportional to length of the text
        // This assumes that each speaker speaks equally fast...
        startTicks += ticksPerChar * turn.speech.value.length;
    }
}
/**
 * Splits a transcript into text blocks.
 * Each block:
 * - The speaker (if any)
 * - What the speaker said
 * @param transcript
 * @returns array of text blocks
 */
export function splitTranscriptIntoBlocks(transcript) {
    const turns = splitTranscriptIntoTurns(transcript);
    return turns.map((t) => getMessageText(t, false));
}
export async function addTranscriptTurnsToConversation(cm, turns) {
    const messages = [];
    if (Array.isArray(turns)) {
        for (const turn of turns) {
            messages.push(transcriptTurnToMessage(turn));
        }
    }
    else {
        messages.push(transcriptTurnToMessage(turns));
    }
    await cm.addMessageBatch(messages);
    await addTranscriptTurnAliases(cm, turns);
}
function assignTurnListeners(turns, participants) {
    for (const turn of turns) {
        const speaker = getSpeaker(turn);
        if (speaker) {
            let listeners = [];
            for (const p of participants) {
                if (p !== speaker) {
                    listeners.push(p);
                }
            }
            turn.listeners = listeners;
        }
    }
}
function getSpeaker(t) {
    return t.speaker === "None" ? undefined : t.speaker;
}
function getMessageText(t, includeHeader) {
    t.speech.value = t.speech.value.trim();
    if (t.speaker === "None") {
        return t.speech;
    }
    else if (!includeHeader) {
        return {
            type: t.speech.type,
            value: t.speaker + ":\n" + t.speech.value,
        };
    }
    else {
        const header = turnToHeaderString(t);
        return {
            type: t.speech.type,
            value: header + t.speech.value,
        };
    }
}
function turnToHeaderString(turn) {
    let text = "";
    if (turn.speaker) {
        text += `From: ${turn.speaker}\n`;
    }
    if (turn.listeners && turn.listeners.length > 0) {
        text += `To: ${turn.listeners.join(", ")}\n`;
    }
    return text;
}
export function createTranscriptOverview(metadata, turns) {
    let participantSet = getTranscriptParticipants(turns);
    let overview = metadata.name;
    if (metadata.description) {
        overview += "\n";
        overview += metadata.description;
    }
    const participants = [...participantSet.values()];
    if (participants.length > 0) {
        overview += "\nParticipants:\n";
        overview += participants.join(", ");
    }
    return overview;
}
export function getTranscriptParticipants(turns) {
    let participantSet = new Set();
    for (const turn of turns) {
        let speaker = getSpeaker(turn);
        if (speaker) {
            participantSet.add(speaker);
        }
        if (turn.listeners && turn.listeners.length > 0) {
            for (const listener of turn.listeners) {
                participantSet.add(listener);
            }
        }
    }
    return participantSet;
}
export function getTranscriptTags(turns) {
    const participants = getTranscriptParticipants(turns);
    const tags = new Set();
    for (const p of participants.values()) {
        tags.add(p);
        const nameTags = splitParticipantName(p);
        if (nameTags) {
            tags.add(nameTags.firstName);
        }
    }
    return [...tags.values()];
}
export function parseTranscriptDuration(startAt, lengthMinutes) {
    const startDate = dateTime.stringToDate(startAt);
    const offsetMs = lengthMinutes * 60 * 1000;
    const stopDate = new Date(startDate.getTime() + offsetMs);
    return {
        startDate: dateToDateTime(startDate),
        stopDate: dateToDateTime(stopDate),
    };
}
export function splitParticipantName(fullName) {
    const parts = split(fullName, /\s+/, {
        trim: true,
        removeEmpty: true,
    });
    switch (parts.length) {
        case 0:
            return undefined;
        case 1:
            return { firstName: parts[0] };
        case 2:
            return { firstName: parts[0], lastName: parts[1] };
        case 3:
            return {
                firstName: parts[0],
                middleName: parts[1],
                lastName: parts[2],
            };
    }
}
export async function addTranscriptTurnAliases(cm, turns) {
    const aliases = (await cm.conversation.getEntityIndex()).nameAliases;
    if (Array.isArray(turns)) {
        await asyncArray.forEachAsync(turns, 1, (t) => addListenersAlias(aliases, t.listeners));
    }
    else {
        await addListenersAlias(aliases, turns.listeners);
    }
}
async function addListenersAlias(aliases, listeners) {
    if (listeners && listeners.length > 0) {
        await asyncArray.forEachAsync(listeners, 1, async (listener) => {
            const parts = splitParticipantName(listener);
            if (parts && parts.firstName) {
                await aliases.addAlias(parts.firstName, listener);
            }
        });
    }
}
//# sourceMappingURL=transcript.js.map