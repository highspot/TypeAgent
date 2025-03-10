import { TextBlock } from "../text.js";
import { ConversationManager, ConversationMessage } from "./conversationManager.js";
import { DateTimeRange } from "./dateTimeSchema.js";
export type TranscriptMetadata = {
    sourcePath: string;
    name: string;
    description?: string | undefined;
    startAt?: string | undefined;
    lengthMinutes?: number | undefined;
};
export type Transcript = {
    metadata: TranscriptMetadata;
    turns: TranscriptTurn[];
};
export declare function createTranscript(transcriptFilePath: string, name: string, description: string, startAt: string, lengthMinutes: number): Promise<Transcript>;
export declare function importTranscript(transcriptFilePath: string, name: string, description: string, startAt: string, lengthMinutes: number, clean?: boolean): Promise<Transcript>;
export declare function saveTranscriptToFolder(transcript: Transcript, destPath: string, baseTurnFileName: string, clean?: boolean): Promise<void>;
/**
 * A turn in a transcript
 */
export type TranscriptTurn = {
    speaker: string;
    listeners?: string[] | undefined;
    speech: TextBlock;
    timestamp?: string | undefined;
};
/**
 * Converts a turn from a transcript into a conversation message
 * @param turn
 * @returns
 */
export declare function transcriptTurnToMessage(turn: TranscriptTurn): ConversationMessage;
/**
 * A transcript of a conversation contains turns. Splits a transcript file into individual turns
 * Each turn is a paragraph prefixed by the name of the speaker and is followed by speaker text.
 * Example of a turn:
 *   Macbeth:
 *   Tomorrow and tomorrow and tomorrow...
 *
 */
export declare function splitTranscriptIntoTurns(transcript: string): TranscriptTurn[];
/**
 * Load turns from a transcript file
 * @param filePath
 * @returns
 */
export declare function loadTurnsFromTranscriptFile(filePath: string): Promise<TranscriptTurn[]>;
/**
 * Load a transcript turn
 * @param filePath
 * @returns
 */
export declare function loadTranscriptTurn(filePath: string): Promise<TranscriptTurn | undefined>;
export declare function saveTranscriptTurnsToFolder(destFolderPath: string, baseFileName: string, turns: TranscriptTurn[]): Promise<void>;
/**
 * Text (such as a transcript) can be collected over a time range.
 * This text can be partitioned into blocks. However, timestamps for individual blocks are not available.
 * Assigns individual timestamps to blocks proportional to their lengths.
 * @param turns Transcript turns to assign timestamps to
 * @param startTimestamp starting
 * @param endTimestamp
 */
export declare function timestampTranscriptTurns(turns: TranscriptTurn[], startTimestamp: Date, endTimestamp: Date): void;
/**
 * Splits a transcript into text blocks.
 * Each block:
 * - The speaker (if any)
 * - What the speaker said
 * @param transcript
 * @returns array of text blocks
 */
export declare function splitTranscriptIntoBlocks(transcript: string): TextBlock[];
export declare function addTranscriptTurnsToConversation(cm: ConversationManager, turns: TranscriptTurn | TranscriptTurn[]): Promise<void>;
export declare function createTranscriptOverview(metadata: TranscriptMetadata, turns: TranscriptTurn[]): string;
export declare function getTranscriptParticipants(turns: TranscriptTurn[]): Set<string>;
export declare function getTranscriptTags(turns: TranscriptTurn[]): string[];
export declare function parseTranscriptDuration(startAt: string, lengthMinutes: number): DateTimeRange;
export type ParticipantName = {
    firstName: string;
    lastName?: string | undefined;
    middleName?: string | undefined;
};
export declare function splitParticipantName(fullName: string): ParticipantName | undefined;
export declare function addTranscriptTurnAliases(cm: ConversationManager, turns: TranscriptTurn | TranscriptTurn[]): Promise<void>;
//# sourceMappingURL=transcript.d.ts.map