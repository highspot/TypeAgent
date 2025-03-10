export declare function parseDateString(dateString: string): Date | undefined;
export declare function parseFuzzyDateString(
    dateString: string,
): Date | undefined;
export declare function parseTimeString(timeString: string): string;
export declare function getShortDate(dateStr: Date): string;
export declare function combineDateTime(
    datePart: string,
    timePart: string,
): Date;
export declare function getISODayStartTime(currentDate: Date): string;
export declare function getISODayEndTime(currentDate: Date): string;
export declare function getTimeZoneName(): string;
export declare function parseDuration(durationString: string): number;
export declare function getDateTimeUsingDuration(
    startDateTimeString: string,
    durationString: string,
    fLocaleTime?: boolean,
): string;
export declare function getDateRelativeToTodayAlt(
    relativeDate: string,
): Date | undefined;
export declare function getDateRelativeToDayV3(
    relativeDate: string,
): Date | undefined;
export declare function getDateRelativeToDayV2(
    relativeDate: string,
): Date | undefined;
export declare function getDateRelativeToDayV1(
    relativeDate: string,
): Date | undefined;
export declare function getDateRelativeToToday(
    relativeDate: string,
): Date | undefined;
export declare function formatTime(time: string): string;
export declare function isValidTime(time: string): boolean;
export declare function getNormalizedDateRange(
    inputDate: string,
    startTime: string | undefined,
    endTime: string | undefined,
    duration: string | undefined,
    fLocaleTime?: boolean,
): Promise<
    | {
          startDate: string;
          endDate: string;
      }
    | undefined
>;
export declare function getNormalizedDateTimes(
    day: string | undefined,
    startTime: string | undefined,
    endTime: string | undefined,
    duration: string | undefined,
    fLocaleTime?: boolean,
): Promise<
    | {
          startDate: string;
          endDate: string;
      }
    | undefined
>;
export declare function getUniqueLocalId(timestamp?: Date): string;
//# sourceMappingURL=datetimeHelper.d.ts.map
