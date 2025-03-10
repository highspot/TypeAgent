// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createCalendarGraphClient, getNormalizedDateRange, getNormalizedDateTimes, getTimeZoneName, getUniqueLocalId, } from "graph-utils";
import chalk from "chalk";
import { getTimeRangeBasedQuery, getNWeeksDateRangeISO, } from "./calendarQueryHelper.js";
import { createActionResultFromTextDisplay, createActionResultFromHtmlDisplay, createActionResultFromError, } from "@typeagent/agent-sdk/helpers/action";
import { getCommandInterface, } from "@typeagent/agent-sdk/helpers/command";
import { displayStatus, displaySuccess, displayWarn, } from "@typeagent/agent-sdk/helpers/display";
import registerDebug from "debug";
const debug = registerDebug("typeagent:calendar");
export class CalendarClientLoginCommandHandler {
    constructor() {
        this.description = "Log into MS Graph to access calendar";
    }
    async run(context) {
        const calendarClient = context.sessionContext.agentContext.calendarClient;
        if (calendarClient === undefined) {
            throw new Error("Calendar client not initialized");
        }
        if (calendarClient.isAuthenticated()) {
            displayWarn("Already logged in", context);
            return;
        }
        await calendarClient.login((prompt) => {
            displayStatus(prompt, context);
        });
        displaySuccess("Successfully logged in", context);
    }
}
export class CalendarClientLogoutCommandHandler {
    constructor() {
        this.description = "Log out of MS Graph to access calendar";
    }
    async run(context) {
        const calendarClient = context.sessionContext.agentContext.calendarClient;
        if (calendarClient === undefined) {
            throw new Error("Calendar client not initialized");
        }
        if (calendarClient.logout()) {
            displaySuccess("Successfully logged out", context);
        }
        else {
            displayWarn("Already logged out", context);
        }
    }
}
const handlers = {
    description: "Calendar login command",
    defaultSubCommand: "login",
    commands: {
        login: new CalendarClientLoginCommandHandler(),
        logout: new CalendarClientLogoutCommandHandler(),
    },
};
export function instantiate() {
    return {
        initializeAgentContext: initializeCalendarContext,
        updateAgentContext: updateCalendarContext,
        executeAction: executeCalendarAction,
        ...getCommandInterface(handlers),
    };
}
async function initializeCalendarContext() {
    return {
        calendarClient: undefined,
        graphEventIds: undefined,
        mapGraphEntity: undefined,
    };
}
function deleteLocalGraphEventId(localEventId, calendarContext) {
    if (calendarContext.graphEventIds !== undefined) {
        let index = calendarContext.graphEventIds.findIndex((graphEventRefId) => graphEventRefId.localEventId === localEventId);
        if (index !== -1) {
            calendarContext.graphEventIds.splice(index, 1);
            calendarContext.mapGraphEntity?.delete(localEventId);
        }
    }
}
function getGraphEventId(localEventId, calendarContext) {
    let graphEventId = undefined;
    if (localEventId !== undefined && calendarContext !== undefined) {
        let graphEventRefIds = calendarContext.graphEventIds?.find((graphEventRefId) => graphEventRefId.localEventId === localEventId);
        if (graphEventRefIds !== undefined) {
            graphEventId = graphEventRefIds.graphEventId;
        }
    }
    return graphEventId;
}
function getLocalEventId(graphEventId, calendarContext) {
    let localEventId = undefined;
    if (graphEventId !== undefined && calendarContext !== undefined) {
        let graphEventRefIds = calendarContext.graphEventIds?.find((graphEventRefId) => graphEventRefId.graphEventId === graphEventId);
        if (graphEventRefIds !== undefined) {
            localEventId = graphEventRefIds.localEventId;
        }
    }
    return localEventId;
}
async function updateCalendarContext(enable, context) {
    if (enable) {
        context.agentContext.calendarClient = await createCalendarGraphClient();
        if (context.agentContext.calendarClient) {
            context.agentContext.graphEventIds = [];
            context.agentContext.mapGraphEntity = new Map();
        }
    }
    else {
        context.agentContext.calendarClient = undefined;
    }
}
async function executeCalendarAction(action, context) {
    let result = await handleCalendarAction(action, context.sessionContext.agentContext);
    return result;
}
function findEventsDisplayHtml(events) {
    if (events) {
        if (Array.isArray(events) && events.length > 0) {
            const eventsCopy = events.map((event) => (delete event.attendees, event));
            let htmlEvents = `<div style="height: 100px; overflow-y: scroll; border: 1px solid #ccc; padding: 10px; font-family: sans-serif; font-size: small">Outlook Calendar Events`;
            eventsCopy.forEach((event) => {
                const calendarItemLink = `https://outlook.office.com/calendar/item/${encodeURIComponent(event.id)}`;
                htmlEvents +=
                    `<p><a href="${calendarItemLink}" target="_blank">` +
                        `<h4>${event.subject}</a>` +
                        `</p>`;
            });
            htmlEvents += `</div>`;
            return htmlEvents;
        }
        else {
            const event = events;
            const calendarItemLink = `https://outlook.office.com/calendar/item/${encodeURIComponent(event.id)}`;
            const htmlEvent = `<div>Outlook Calendar Events<a href="${calendarItemLink}" target="_blank">` +
                `<h4>${event.subject}</h4></a><div style="font-size: 12px;">` +
                "</div></div>";
            return htmlEvent;
        }
    }
    return "";
}
async function getParticipantsToAdd(participants, calendarClient) {
    let participantsToAdd = [];
    if (participants && participants.length > 0) {
        participantsToAdd =
            await calendarClient.getEmailAddressesOfUsernamesLocal(participants);
        if (!participantsToAdd || participantsToAdd?.length === 0) {
            participantsToAdd?.push(...participants);
        }
    }
    return participantsToAdd;
}
async function addParticipantsToMeeting(participantsInMeeting, participantsToAdd, description, dateInfo, calendarClient) {
    let emailAddrsInMeeting = await getParticipantsToAdd(participantsInMeeting, calendarClient);
    let emailAddrsToAdd = await getParticipantsToAdd(participantsToAdd, calendarClient);
    let eventId = undefined;
    if (emailAddrsToAdd && emailAddrsToAdd.length > 0) {
        eventId = await calendarClient.addParticipantsToMeeting(description, dateInfo ? dateInfo.startDate : undefined, dateInfo ? dateInfo.endDate : undefined, getTimeZoneName(), emailAddrsInMeeting ?? [], emailAddrsToAdd);
    }
    return eventId;
}
function updateCalendarEntity(calendarContext, eventid, emailAddrsToAdd) {
    const localEventId = getLocalEventId(eventid, calendarContext);
    if (localEventId !== undefined) {
        let calendarEvent = calendarContext.mapGraphEntity?.get(localEventId);
        if (calendarEvent !== undefined) {
            calendarEvent.participants?.push(...emailAddrsToAdd);
            calendarEvent.lastModifiedDateTime = new Date().toISOString();
            calendarContext.mapGraphEntity?.set(localEventId, calendarEvent);
        }
    }
    return localEventId;
}
function addCalendarEntity(calendarContext, eventid, description, emailAddrsInMeeting) {
    if (calendarContext && calendarContext.graphEventIds !== undefined) {
        const localId = getUniqueLocalId();
        calendarContext.graphEventIds.push({
            graphEventId: `${eventid}`,
            localEventId: `${localId}`,
        });
        if (calendarContext.mapGraphEntity !== undefined) {
            calendarContext.mapGraphEntity.set(localId, {
                id: `${eventid}`,
                localId: `${localId}`,
                type: "Event",
                subject: description,
                participants: emailAddrsInMeeting,
                lastModifiedDateTime: new Date().toISOString(),
            });
            return localId;
        }
    }
    return undefined;
}
export async function handleCalendarAction(action, calendarContext) {
    let actionEvent;
    const client = calendarContext.calendarClient;
    if (client === undefined) {
        throw new Error("Calendar client not initialized");
    }
    if (!client.isAuthenticated()) {
        await client.login();
    }
    switch (action.actionName) {
        case "addEvent":
            debug(chalk.green("Handling ADD_EVENT action ..."));
            actionEvent = action.parameters.event;
            let response = undefined;
            if (actionEvent.day != undefined ||
                actionEvent.timeRange != undefined) {
                response = await getNormalizedDateTimes(actionEvent.day, actionEvent.timeRange
                    ? actionEvent.timeRange.startTime
                    : undefined, actionEvent.timeRange
                    ? actionEvent.timeRange.endTime
                    : undefined, actionEvent.timeRange
                    ? actionEvent.timeRange.duration
                    : "1", true);
                if (response === undefined ||
                    (response.startDate === undefined &&
                        response.endDate === undefined)) {
                    if (action.parameters.event?.translatedDate) {
                        response = await getNormalizedDateRange(action.parameters.event?.translatedDate, actionEvent.timeRange
                            ? actionEvent.timeRange.startTime
                            : undefined, actionEvent.timeRange
                            ? actionEvent.timeRange.endTime
                            : undefined, actionEvent.timeRange
                            ? actionEvent.timeRange.duration
                            : "1", true);
                    }
                }
                if (response != undefined &&
                    response.startDate != undefined &&
                    response.endDate != undefined) {
                    if (actionEvent.description == "" ||
                        actionEvent.description == undefined) {
                        actionEvent.description = "** Generated Event **";
                    }
                    let participantsToAdd = [];
                    if (actionEvent.participants &&
                        actionEvent.participants.length > 0) {
                        participantsToAdd =
                            await client.getEmailAddressesOfUsernamesLocal(actionEvent.participants);
                    }
                    let eventid = await client.createCalendarEvent(actionEvent.description, actionEvent.description ?? "", response.startDate, response.endDate, getTimeZoneName(), participantsToAdd);
                    if (eventid != undefined) {
                        const localId = addCalendarEntity(calendarContext, eventid, actionEvent.description, participantsToAdd ?? []);
                        debug(chalk.bgCyanBright(`Successfully added the (local eventid:${localId}) event:${eventid}`));
                        const displayText = await populateMeetingDetails(response.startDate, response.endDate, actionEvent.description, eventid);
                        debug(displayText);
                        let result = createActionResultFromHtmlDisplay(displayText);
                        if (result && localId) {
                            result.entities = [
                                {
                                    name: `${actionEvent.description}`,
                                    type: ["event"],
                                    additionalEntityText: localId,
                                    uniqueId: localId,
                                },
                            ];
                            return result;
                        }
                    }
                    else {
                        debug(chalk.bgRedBright("Failed to add the event, please try again!"));
                        return createActionResultFromError("Failed to add the event, please try again!");
                    }
                }
            }
            break;
        case "findEvents":
            debug(chalk.green("Handling FIND_EVENTS action ..."));
            actionEvent = action.parameters.eventReference;
            if (actionEvent && actionEvent.eventid) {
                const lastLocalEventId = actionEvent.eventid;
                const lastGraphEventId = getGraphEventId(lastLocalEventId ?? "", calendarContext);
                if (lastGraphEventId !== undefined) {
                    const meeting = calendarContext.mapGraphEntity?.get(lastLocalEventId);
                    if (meeting) {
                        return populateMeetingDetailsFromEvent(actionEvent?.description, meeting);
                    }
                }
                else {
                    // the eventid is coming from the cache, but it's not in the mapGraphEntity
                    if (actionEvent && actionEvent.description) {
                        const events = await client.findEventsFromEmbeddings(actionEvent?.description);
                        if (events) {
                            return populateMeetingDetailsFromEvent(actionEvent?.description, events);
                        }
                    }
                }
            }
            else if (actionEvent &&
                (actionEvent.day ||
                    actionEvent.timeRange ||
                    actionEvent.dayRange)) {
                let findQuery = getTimeRangeBasedQuery(actionEvent);
                if (findQuery !== undefined) {
                    let results = await client.findCalendarEventsByDateRange(findQuery);
                    return populateMeetingDetailsFromEvent(actionEvent.description, results);
                }
                else {
                    const err = "Please provide a valid date and time range to search for events.";
                    debug(chalk.bgYellowBright(err));
                    return createActionResultFromError(err);
                }
            }
            else if (actionEvent && actionEvent.description) {
                let findResults = await client.findEventsFromEmbeddings(actionEvent.description);
                if (findResults?.length === 0) {
                    findResults = await client.findCalendarEventsBySubject(actionEvent.description);
                }
                return populateMeetingDetailsFromEvent(actionEvent.description, findResults);
            }
            else if (actionEvent &&
                actionEvent.participants &&
                actionEvent.participants.length > 0) {
                let findQuery = getTimeRangeBasedQuery(actionEvent);
                if (actionEvent?.participants?.length > 0 &&
                    findQuery !== undefined) {
                    debug(findQuery);
                    let results = await client.findCalendarEventsByDateRange(findQuery);
                    if (Array.isArray(results)) {
                        const findResults = results.filter((result) => {
                            if (result.attendees) {
                                const eventAttendees = result.attendees.map((attendee) => attendee.emailAddress.name.toLowerCase());
                                return actionEvent?.participants?.some((participant) => eventAttendees.some((name) => name.includes(participant.toLowerCase())));
                            }
                            return false;
                        });
                        if (findResults.length > 0) {
                            return populateMeetingDetailsFromEvent(actionEvent.description, findResults);
                        }
                    }
                }
                else {
                    const err = "Please provide a valid date and time range to search for events.";
                    debug(chalk.bgYellowBright(err));
                    return createActionResultFromError(err);
                }
            }
            else {
                const err = "Please provide participant and  valid date and time range to search for events.";
                debug(chalk.bgYellowBright(err));
                return createActionResultFromError(err);
            }
            break;
        case "addParticipants":
            debug(chalk.green("Handling ADD_PARTICIPANTS action ..."));
            actionEvent = action.parameters.eventReference;
            let participantsToAdd = action.parameters.participants;
            if (actionEvent != undefined &&
                actionEvent.description != undefined) {
                let dateInfo = undefined;
                if (actionEvent.timeRange != undefined) {
                    dateInfo = await getNormalizedDateTimes(actionEvent.day, actionEvent.timeRange.startTime, actionEvent.timeRange.endTime, actionEvent.timeRange.duration, false);
                }
                else {
                    let { startDateTime, endDateTime } = getNWeeksDateRangeISO(2);
                    dateInfo = {
                        startDate: startDateTime,
                        endDate: endDateTime,
                    };
                }
                let eventId = await addParticipantsToMeeting(actionEvent.participants, participantsToAdd, actionEvent.description ?? "** Generated Event **", dateInfo, client);
                if (eventId && typeof eventId === "string") {
                    // todo: check if the event is in the mapGraphEntity, add it if not
                    // the event won't be in the context if it's an exisitng event in the calendar
                    const localId = updateCalendarEntity(calendarContext, eventId, participantsToAdd);
                    debug(chalk.bgCyanBright(`Successfully added pariticipant(s) for (local eventid:${localId}) event:${eventId}`));
                    const displayText = await populateMeetingDetailsMin("Meeting was updated", actionEvent.description, eventId);
                    debug(displayText);
                    let result = createActionResultFromHtmlDisplay(displayText);
                    if (result && localId) {
                        result.entities = [
                            {
                                name: `${actionEvent.description}`,
                                type: ["event"],
                                additionalEntityText: localId,
                                uniqueId: localId,
                            },
                        ];
                        return result;
                    }
                }
                else {
                    debug(chalk.bgRedBright("Failed to add the event, please try again!"));
                    return createActionResultFromError("Failed to add the event, please try again!");
                }
            }
            else {
                if (actionEvent?.eventid) {
                    const lastLocalEventId = actionEvent?.eventid;
                    const lastGraphEventId = getGraphEventId(lastLocalEventId ?? "", calendarContext);
                    if (lastLocalEventId !== undefined) {
                        const meeting = calendarContext.mapGraphEntity?.get(lastLocalEventId);
                        if (meeting) {
                            let participantsToAdd = action.parameters.participants;
                            let participantsInMeeting = meeting.participants;
                            let emailAddrsInMeeting = await getParticipantsToAdd(participantsInMeeting, client);
                            let emailAddrsToAdd = await getParticipantsToAdd(participantsToAdd, client);
                            if (lastGraphEventId &&
                                emailAddrsToAdd &&
                                emailAddrsToAdd.length > 0) {
                                let eventId = await client.addParticipantsToExistingMeeting(lastGraphEventId, emailAddrsInMeeting, emailAddrsToAdd);
                                // add the new participants to the mapGraphEntity
                                if (eventId && typeof eventId === "string") {
                                    meeting.participants?.push(...emailAddrsToAdd);
                                    calendarContext.mapGraphEntity?.set(lastLocalEventId, meeting);
                                    debug(chalk.bgCyanBright(`Successfully added the participants to the (local eventid:${lastLocalEventId}) event:${eventId}`));
                                    const displayText = await populateMeetingDetailsMin("Meeting was updated", meeting.subject, eventId);
                                    debug(displayText);
                                    let result = createActionResultFromHtmlDisplay(displayText);
                                    result.entities = [
                                        {
                                            name: `${meeting.subject}`,
                                            type: ["event"],
                                            additionalEntityText: lastLocalEventId,
                                            uniqueId: lastLocalEventId,
                                        },
                                    ];
                                    return result;
                                }
                                else {
                                    // Could happen because the calendar event was deleted
                                    // and clear the entity from the context
                                    let err = eventId;
                                    if (err.code === "ErrorItemNotFound") {
                                        deleteLocalGraphEventId(lastLocalEventId, calendarContext);
                                        return createActionResultFromError("Looks like the event was deleted, please try again!");
                                    }
                                    else {
                                        return createActionResultFromError("Failed to add the participants to the event, please try again!");
                                    }
                                }
                            }
                        }
                    }
                }
            }
            break;
        default:
            throw new Error(`Unknown action: ${action.actionName}`);
    }
    return createActionResultFromError("Failed to execute the action!");
}
async function populateMeetingDetailsFromEvent(actionName, events) {
    if (events instanceof Array) {
        if (events && events.length > 0) {
            const displayText = findEventsDisplayHtml(events);
            let result = createActionResultFromHtmlDisplay(displayText);
            return result;
        }
        else {
            const displayText = `You have a meeting free day 😊`;
            let result = createActionResultFromTextDisplay(displayText);
            return result;
        }
    }
    else {
        const displayText = findEventsDisplayHtml(events);
        let result = createActionResultFromHtmlDisplay(displayText);
        return result;
    }
}
async function populateMeetingDetails(startDateTime, endDateTime, description, eventid) {
    const calendarItemLink = `https://outlook.office.com/calendar/item/${encodeURIComponent(eventid)}`;
    const meetingDetailsHTML = `<div>Outlook Meeting Schedule<a href="${calendarItemLink}" target="_blank">` +
        `<h4>${description}</h4></a><div style="font-size: 12px;">Start Time: <span>${startDateTime}</span>` +
        `<br>End Time: <span>${endDateTime}</span>` +
        "</div></div>";
    return meetingDetailsHTML;
}
async function populateMeetingDetailsMin(header, description, eventid) {
    const calendarItemLink = `https://outlook.office.com/calendar/item/${encodeURIComponent(eventid)}`;
    const meetingDetailsHTML = `<div>Outlook Meeting Schedule<a href="${calendarItemLink}" target="_blank">` +
        `<h4>${header}<br>${description}</h4></a><div style="font-size: 12px;">` +
        "</div></div>";
    return meetingDetailsHTML;
}
//# sourceMappingURL=calendarActionHandler.js.map