type NamedTime = "Noon" | "Midnight";
type SpecialDay = "StartOfWeek" | "EndOfWeek" | "StartOfMonth" | "EndOfMonth" | "StartOfYear" | "EndOfYear";
type SpecialDateTime = "Now" | "InThePast" | "InTheFuture";
export type CalendarDateTime = {
    specialDateTime?: SpecialDateTime;
    year?: string;
    month?: string;
    week?: string;
    day?: string | SpecialDay;
    hms?: string | NamedTime;
};
export type EventTimeRange = {
    startDateTime?: CalendarDateTime;
    endDateTime?: CalendarDateTime;
    duration?: string;
};
export type Event = {
    timeRange: EventTimeRange;
    description: string;
    location?: string;
    participants?: string[];
};
export type EventReference = {
    timeRange?: EventTimeRange;
    description?: string;
    location?: string;
    participants?: string[];
    lookup?: boolean;
    eventid?: string;
};
export type CalendarAction = AddEventAction | FindEventsAction | AddParticipantsAction;
export type AddEventAction = {
    actionName: "addEvent";
    parameters: {
        event: Event;
    };
};
export type FindEventsAction = {
    actionName: "findEvents";
    parameters: {
        eventReference: EventReference;
    };
};
export type AddParticipantsAction = {
    actionName: "addParticipants";
    parameters: {
        eventReference?: EventReference;
        participants: string[];
    };
};
export {};
//# sourceMappingURL=calendarActionsSchemaV2.d.ts.map