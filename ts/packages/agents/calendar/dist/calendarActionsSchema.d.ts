export type CalendarAction = AddEventAction | RemoveEventAction | AddParticipantsAction | ChangeTimeAction | ChangeDescriptionAction | FindEventsAction;
export type AddEventAction = {
    actionName: "addEvent";
    parameters: {
        event: Event;
    };
};
export type RemoveEventAction = {
    actionName: "removeEvent";
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
export type ChangeTimeAction = {
    actionName: "changeTime";
    parameters: {
        eventReference?: EventReference;
        timeRange: EventTimeRange;
    };
};
export type ChangeDescriptionAction = {
    actionName: "changeDescription";
    parameters: {
        eventReference?: EventReference;
        description: string;
    };
};
export type FindEventsAction = {
    actionName: "findEvents";
    parameters: {
        eventReference: EventReference;
    };
};
export type EventTimeRange = {
    startTime?: string;
    endTime?: string;
    duration?: string;
};
export type Event = {
    day: string;
    timeRange: EventTimeRange;
    translatedDate?: string;
    description: string;
    location?: string;
    participants?: string[];
};
export type EventReference = {
    day?: string;
    dayRange?: string;
    timeRange?: EventTimeRange;
    description?: string;
    location?: string;
    participants?: string[];
    lookup?: boolean;
    eventid?: string;
};
//# sourceMappingURL=calendarActionsSchema.d.ts.map