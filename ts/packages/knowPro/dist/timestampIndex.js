// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { collections, dateTime } from "typeagent";
import { textRangeFromLocation } from "./conversationIndex.js";
/**
 * An index of timestamp => TextRanges.
 * * Timestamps must be unique.
 * *TextRanges need not be contiguous.
 */
export class TimestampToTextRangeIndex {
    constructor() {
        // Maintains ranges sorted by timestamp
        this.ranges = [];
    }
    /**
     * Looks up text ranges in given date range.
     * Text ranges need not be contiguous
     * @param dateRange
     * @returns
     */
    lookupRange(dateRange) {
        const startAt = this.dateToTimestamp(dateRange.start);
        const stopAt = dateRange.end
            ? this.dateToTimestamp(dateRange.end)
            : undefined;
        return collections.getInRange(this.ranges, startAt, stopAt, (x, y) => x.timestamp.localeCompare(y));
    }
    addTimestamp(messageIndex, timestamp) {
        return this.insertTimestamp(messageIndex, timestamp, true);
    }
    addTimestamps(messageTimestamps) {
        for (let i = 0; i < messageTimestamps.length; ++i) {
            const [messageIndex, timestamp] = messageTimestamps[i];
            this.insertTimestamp(messageIndex, timestamp, false);
        }
        this.ranges.sort(this.compareTimestampedRange);
    }
    insertTimestamp(messageIndex, timestamp, inOrder) {
        if (!timestamp) {
            return false;
        }
        const timestampDate = new Date(timestamp);
        const entry = {
            range: textRangeFromLocation(messageIndex),
            // This string is formatted to be lexically sortable
            timestamp: this.dateToTimestamp(timestampDate),
        };
        if (inOrder) {
            collections.insertIntoSorted(this.ranges, entry, this.compareTimestampedRange);
        }
        else {
            this.ranges.push(entry);
        }
        return true;
    }
    clear() {
        this.ranges = [];
    }
    compareTimestampedRange(x, y) {
        return x.timestamp.localeCompare(y.timestamp);
    }
    dateToTimestamp(date) {
        return dateTime.timestampString(date, false);
    }
}
export function buildTimestampIndex(conversation) {
    if (conversation.messages && conversation.secondaryIndexes) {
        conversation.secondaryIndexes.timestampIndex ??=
            new TimestampToTextRangeIndex();
        addToTimestampIndex(conversation.secondaryIndexes.timestampIndex, conversation.messages, 0);
    }
}
export function addToTimestampIndex(timestampIndex, messages, baseMessageIndex) {
    const messageTimestamps = [];
    for (let i = 0; i < messages.length; ++i) {
        const timestamp = messages[i].timestamp;
        if (timestamp) {
            messageTimestamps.push([i + baseMessageIndex, timestamp]);
        }
    }
    timestampIndex.addTimestamps(messageTimestamps);
}
//# sourceMappingURL=timestampIndex.js.map