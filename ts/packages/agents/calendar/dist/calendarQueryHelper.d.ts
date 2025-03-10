import { EventReference } from "./calendarActionsSchemaV1.js";
export declare function generateEventReferenceCriteria(eventReference: EventReference): string;
export declare function getTimeRangeBasedQuery(eventReference: EventReference): string | undefined;
export declare function getCurrentWeekDates(): {
    startDate: Date;
    endDate: Date;
};
export declare function getCurrentMonthDates(): {
    startDate: Date;
    endDate: Date;
};
export declare function getNextDaysDates(numDays: number): {
    startDate: Date;
    endDate: Date;
};
export declare function getNWeeksDateRangeISO(nWeeks: number): {
    startDateTime: string;
    endDateTime: string;
};
export declare function generateNaturalLanguageCriteria(input: string): string | undefined;
export declare function generateQueryFromFuzzyDay(input: string): string | undefined;
//# sourceMappingURL=calendarQueryHelper.d.ts.map