// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { startOfWeek, endOfWeek, endOfMonth } from "date-fns";
export function parseCalendarDateTime(calDateTime, fLocaleTime = true, isStart = true, useUTC = false) {
    let date = new Date();
    if (calDateTime.year) {
        let year;
        if (calDateTime.year.startsWith("+") ||
            calDateTime.year.startsWith("-")) {
            const yearOffset = parseOffset(calDateTime.year.replace("y", ""));
            year =
                (useUTC ? date.getUTCFullYear() : date.getFullYear()) +
                    yearOffset;
        }
        else {
            year = parseInt(calDateTime.year, 10);
        }
        if (!isNaN(year)) {
            useUTC ? date.setUTCFullYear(year) : date.setFullYear(year);
        }
        else {
            throw new Error("Invalid input: Year could not be parsed.");
        }
    }
    if (calDateTime.week) {
        const weekOffset = parseOffset(calDateTime.week.replace("w", ""));
        const daysToAdd = weekOffset * 7; // 1 week = 7 days
        useUTC
            ? date.setUTCDate(date.getUTCDate() + daysToAdd)
            : date.setDate(date.getDate() + daysToAdd);
    }
    if (calDateTime.month) {
        const currentMonth = useUTC ? date.getUTCMonth() : date.getMonth();
        if (calDateTime.month.startsWith("+") ||
            calDateTime.month.startsWith("-")) {
            const monthOffset = parseOffset(calDateTime.month.replace("M", ""));
            const newMonth = currentMonth + monthOffset;
            const yearAdjustment = Math.floor(newMonth / 12);
            const adjustedMonth = ((newMonth % 12) + 12) % 12; // Ensure valid month index
            useUTC ? date.setUTCDate(1) : date.setDate(1);
            useUTC
                ? date.setUTCFullYear(date.getUTCFullYear() + yearAdjustment)
                : date.setFullYear(date.getFullYear() + yearAdjustment);
            useUTC
                ? date.setUTCMonth(adjustedMonth)
                : date.setMonth(adjustedMonth);
        }
        else if (isNaN(parseInt(calDateTime.month, 10))) {
            const monthIndex = monthToIndex(calDateTime.month);
            if (monthIndex !== -1) {
                useUTC
                    ? date.setUTCMonth(monthIndex)
                    : date.setMonth(monthIndex);
            }
            else {
                throw new Error("Invalid input: Month name could not be parsed.");
            }
        }
        else {
            const monthIndex = parseInt(calDateTime.month, 10) - 1;
            useUTC ? date.setUTCMonth(monthIndex) : date.setMonth(monthIndex);
        }
    }
    if (calDateTime.day !== undefined) {
        if (calDateTime.day.startsWith("+") ||
            calDateTime.day.startsWith("-")) {
            const dayOffset = parseOffset(calDateTime.day.replace("d", ""));
            useUTC
                ? date.setUTCDate(date.getUTCDate() + dayOffset)
                : date.setDate(date.getDate() + dayOffset);
        }
        else if (!isNaN(parseInt(calDateTime.day, 10))) {
            useUTC
                ? date.setUTCDate(parseInt(calDateTime.day, 10))
                : date.setDate(parseInt(calDateTime.day, 10));
        }
        else {
            const weekdays = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            const targetDayIndex = weekdays.indexOf(calDateTime.day);
            if (targetDayIndex === -1) {
                throw new Error("Invalid input: Day name could not be parsed.");
            }
            const currentDayIndex = useUTC ? date.getUTCDay() : date.getDay();
            const daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;
            useUTC
                ? date.setUTCDate(date.getUTCDate() + daysUntilTarget)
                : date.setDate(date.getDate() + daysUntilTarget);
        }
    }
    else {
        if (calDateTime.week) {
            calDateTime.day = isStart ? "StartOfWeek" : "EndOfWeek";
            const adjustedDate = isStart
                ? startOfWeek(date, { weekStartsOn: 1 })
                : endOfWeek(date, { weekStartsOn: 1 });
            useUTC
                ? date.setUTCDate(adjustedDate.getUTCDate())
                : date.setDate(adjustedDate.getDate());
        }
        else if (calDateTime.month && !calDateTime.day) {
            date = isStart ? date : endOfMonth(date);
        }
    }
    if (calDateTime.hms) {
        switch (calDateTime.hms.toLowerCase()) {
            case "noon":
                useUTC
                    ? date.setUTCHours(12, 0, 0, 0)
                    : date.setHours(12, 0, 0, 0);
                break;
            case "midnight":
                useUTC
                    ? date.setUTCHours(0, 0, 0, 0)
                    : date.setHours(0, 0, 0, 0);
                break;
            default:
                const [hours, minutes, seconds] = calDateTime.hms
                    .split(":")
                    .map(Number);
                useUTC
                    ? date.setUTCHours(hours || 0, minutes || 0, seconds || 0, 0)
                    : date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
                break;
        }
    }
    else {
        useUTC
            ? date.setUTCHours(isStart ? 0 : 23, isStart ? 0 : 59, isStart ? 0 : 59, 999)
            : date.setHours(isStart ? 0 : 23, isStart ? 0 : 59, isStart ? 0 : 59, 999);
    }
    if (fLocaleTime) {
        return date.toLocaleString();
    }
    else {
        return date.toISOString();
    }
}
function monthToIndex(month) {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return months.findIndex((m) => m.toLowerCase() === month.toLowerCase());
}
// Parse offsets like "+1y", "-1M", "+3d", etc.
function parseOffset(value) {
    if (value.startsWith("+")) {
        return parseInt(value.slice(1));
    }
    else if (value.startsWith("-")) {
        return -parseInt(value.slice(1));
    }
    else {
        return parseInt(value);
    }
}
export function calcEndDateTime(startDateTime, duration, fLocaleTime = true, useUTC = false) {
    const errors = [];
    const result = { success: false, errors };
    const endDate = new Date(startDateTime);
    if (isNaN(endDate.getTime())) {
        errors.push("Invalid start datetime format.");
        return result;
    }
    const durationRegex = /^([+-]?\d{1,3}d)?(?:,?([+-]?\d{1,2}h)(?::(\d{1,2}m))?(?::(\d{1,2}s))?)?$/;
    const match = duration.match(durationRegex);
    if (!match) {
        errors.push("Invalid duration format.");
        return result;
    }
    const days = match[1] ? parseInt(match[1], 10) : 0;
    const hours = match[2] ? parseInt(match[2], 10) : 0;
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    const seconds = match[4] ? parseInt(match[4], 10) : 0;
    useUTC
        ? endDate.setUTCDate(endDate.getUTCDate() + days)
        : endDate.setDate(endDate.getDate() + days);
    useUTC
        ? endDate.setUTCHours(endDate.getUTCHours() + hours)
        : endDate.setHours(endDate.getHours() + hours);
    useUTC
        ? endDate.setUTCMinutes(endDate.getUTCMinutes() + minutes)
        : endDate.setMinutes(endDate.getMinutes() + minutes);
    useUTC
        ? endDate.setUTCSeconds(endDate.getUTCSeconds() + seconds)
        : endDate.setSeconds(endDate.getSeconds() + seconds);
    return {
        success: true,
        parsedDateTime: fLocaleTime
            ? endDate.toLocaleString()
            : endDate.toISOString(),
    };
}
export function getDateTimeFromStartDateTime(calStartDateTime, duration) {
    const startDateTimeStr = parseCalendarDateTime(calStartDateTime, false, true, false);
    if (startDateTimeStr === undefined) {
        return undefined;
    }
    const endDateTime = calcEndDateTime(startDateTimeStr, duration, false, false);
    if (!endDateTime.success) {
        return undefined;
    }
    if (endDateTime.parsedDateTime) {
        return {
            startDate: startDateTimeStr,
            endDate: endDateTime.parsedDateTime,
        };
    }
    return undefined;
}
export function getStartAndEndDateTimes(calStartDateTime, calEndDateTime) {
    const startDateTimeStr = parseCalendarDateTime(calStartDateTime, false, true, false);
    const endDateTimeStr = parseCalendarDateTime(calEndDateTime, false, false, false);
    if (startDateTimeStr === undefined || endDateTimeStr === undefined) {
        return undefined;
    }
    return { startDate: startDateTimeStr, endDate: endDateTimeStr };
}
export function getQueryParamsFromTimeRange(calStartDateTime, calEndDateTime) {
    const startDateTimeStr = parseCalendarDateTime(calStartDateTime, false, true, false);
    const endDateTimeStr = parseCalendarDateTime(calEndDateTime, false, false, false);
    if (startDateTimeStr === undefined || !endDateTimeStr === undefined) {
        return undefined;
    }
    return `startDateTime=${startDateTimeStr}&endDateTime=${endDateTimeStr}`;
}
//# sourceMappingURL=calendarDateTimeParser.js.map