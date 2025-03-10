export type DateVal = {
    day: number;
    month: number;
    year: number;
};
export type TimeVal = {
    hour: number;
    minute: number;
    seconds: number;
};
export type DateTime = {
    date: DateVal;
    time?: TimeVal | undefined;
};
export type DateTimeRange = {
    startDate: DateTime;
    stopDate?: DateTime | undefined;
};
//# sourceMappingURL=dateTimeSchema.d.ts.map