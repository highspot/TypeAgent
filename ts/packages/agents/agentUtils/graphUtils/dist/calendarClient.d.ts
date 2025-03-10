import { GraphClient, ErrorResponse } from "./graphClient.js";
export declare class CalendarClient extends GraphClient {
    private readonly useEmbeddings;
    private readonly calendarDataIndex;
    private readonly calendarDataMap;
    private fCalendarIndexed;
    private stopCurrentSyncThread;
    constructor();
    private generateEmbedding;
    private indexCalendarEvents;
    private startSyncThread;
    private stopSyncThread;
    createCalendarEvent(subject: string, body: string, startDateTime: string, endDateTime: string, timeZone: string, attendees: string[] | undefined): Promise<string | undefined>;
    deleteCalendarEvent(eventId: string): Promise<boolean>;
    findFreeSlots(startTime: string, endTime: string, durationInMinutes: number): Promise<any[]>;
    private findBestMatch;
    private findBestMatchByParticipants;
    findEventsFromEmbeddings(subject: string): Promise<string[]>;
    addParticipantsToMeeting(subject: string, startTime: string | undefined, endTime: string | undefined, timeZone: string, participantsInMeeting: string[], participants: string[] | undefined): Promise<string | undefined | ErrorResponse>;
    addParticipantsToExistingMeeting(meetingId: string, attendees: any, participants: string[]): Promise<string | ErrorResponse | undefined>;
    createMeetingAndAddParticipants(subject: string, startTime: string, endTime: string, timeZone: string, attendees: string[]): Promise<string | undefined>;
    findCalendarEvents(criteria: any): Promise<any[]>;
    findCalendarEventsBySubject(subject: string): Promise<any[]>;
    findCalendarEventsByDateRange(query: any): Promise<any[]>;
    findCalendarView(query: string): Promise<any[]>;
}
export declare function createCalendarGraphClient(): Promise<CalendarClient>;
//# sourceMappingURL=calendarClient.d.ts.map