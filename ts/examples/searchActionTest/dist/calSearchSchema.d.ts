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
export type CalendarSearchAction = {
    actionName: "calendar search";
    parameters: {
        attendees?: string[];
        start?: CalendarDateTime;
        end?: CalendarDateTime;
        singleEvent?: boolean;
        meetingDescriptionKeyphrases?: string[];
    };
};
export {};
//# sourceMappingURL=calSearchSchema.d.ts.map