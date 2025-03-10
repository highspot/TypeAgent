import { NormalizedEmbedding, ScoredItem, NameValue } from "typeagent";
export type EventInfo = {
    eventId: string;
    eventData: string;
};
export interface CalendarDataIndex {
    addOrUpdate(eventData: string): Promise<void>;
    remove(eventId: EventInfo): Promise<void>;
    reset(): Promise<void>;
    search(query: string | NormalizedEmbedding, maxMatches: number): Promise<ScoredItem<NameValue<number>>[]>;
}
export declare function createCalendarDataIndex(): {
    addOrUpdate: (eventInfo: EventInfo) => Promise<void>;
    remove: (eventId: string) => Promise<void>;
    reset: () => Promise<void>;
    search: (query: string | NormalizedEmbedding, maxMatches: number) => Promise<ScoredItem<NameValue<string>>[]>;
};
//# sourceMappingURL=calendarDataIndex.d.ts.map