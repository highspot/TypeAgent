import { CalendarDateTime } from "../calendarActionsSchemaV2.js";
export declare function parseCalendarDateTime(calDateTime: CalendarDateTime, fLocaleTime?: boolean, isStart?: boolean, useUTC?: boolean): string;
export interface DateTimeParseResult {
    success: boolean;
    parsedDateTime?: string;
    errors?: string[];
}
export declare function calcEndDateTime(startDateTime: string, duration: string, fLocaleTime?: boolean, useUTC?: boolean): DateTimeParseResult;
export declare function getDateTimeFromStartDateTime(calStartDateTime: CalendarDateTime, duration: string): {
    startDate: string;
    endDate: string;
} | undefined;
export declare function getStartAndEndDateTimes(calStartDateTime: CalendarDateTime, calEndDateTime: CalendarDateTime): {
    startDate: string;
    endDate: string;
} | undefined;
export declare function getQueryParamsFromTimeRange(calStartDateTime: CalendarDateTime, calEndDateTime: CalendarDateTime): string | undefined;
//# sourceMappingURL=calendarDateTimeParser.d.ts.map