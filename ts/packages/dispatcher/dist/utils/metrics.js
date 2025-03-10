// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createProfileLogger, ProfileReader, } from "telemetry";
import { ProfileNames } from "./profileNames.js";
function minStart(measures) {
    const value = measures.reduce((start, measure) => Math.min(start, measure.start), Number.MAX_VALUE);
    return value;
}
function totalDuration(measures) {
    if (!measures) {
        return undefined;
    }
    const value = measures.reduce((sum, measure) => sum + (measure.duration ?? 0), 0);
    return value === 0 ? undefined : value;
}
function totalMarkDuration(measures, name) {
    if (measures === undefined) {
        return undefined;
    }
    let duration = 0;
    let count = 0;
    for (const measure of measures) {
        for (const mark of measure.marks) {
            if (mark.name === name) {
                duration += mark.duration;
                count++;
            }
        }
    }
    return count === 0 ? undefined : { duration, count };
}
function getInfo(timing) {
    if (timing.duration === undefined && timing.marks === undefined) {
        return undefined;
    }
    return timing;
}
export class RequestMetricsManager {
    constructor() {
        this.profileMap = new Map();
    }
    beginCommand(requestId) {
        const logger = createProfileLogger();
        this.profileMap.set(requestId, {
            logger,
            reader: new ProfileReader(),
        });
        return logger.measure(ProfileNames.command, true, requestId);
    }
    getReader(requestId) {
        const data = this.profileMap.get(requestId);
        if (data === undefined) {
            return undefined;
        }
        const { logger, reader } = data;
        const entries = logger.getUnreadEntries();
        if (entries !== undefined) {
            reader.addEntries(entries);
        }
        return reader;
    }
    getMeasures(requestId, name) {
        return this.getReader(requestId)?.getMeasures(name);
    }
    getMetrics(requestId) {
        const reader = this.getReader(requestId);
        if (reader == undefined) {
            return undefined;
        }
        const commandMeasures = reader.getMeasures(ProfileNames.command);
        if (commandMeasures === undefined) {
            return undefined;
        }
        const commandStart = minStart(commandMeasures);
        const commandDuration = totalDuration(commandMeasures);
        let parseDuration = commandDuration;
        let command;
        const actions = [];
        const requestMeasures = reader.getMeasures(ProfileNames.request);
        if (requestMeasures !== undefined) {
            // request command
            const actionMeasures = reader.getMeasures(ProfileNames.executeAction);
            if (actionMeasures !== undefined) {
                // Includes translation time by exclude the action time.
                parseDuration = minStart(actionMeasures) - commandStart;
                for (const actionMeasure of actionMeasures) {
                    if (actionMeasure.duration === undefined) {
                        continue;
                    }
                    const index = actionMeasure.startData;
                    if (actions[index] === undefined) {
                        actions[index] = { duration: 0 };
                    }
                    actions[index].duration += actionMeasure.duration;
                }
            }
        }
        else {
            // For non request command
            const executeCommandMeasures = reader.getMeasures(ProfileNames.executeCommand);
            if (executeCommandMeasures) {
                // Exclude the execution time from parse time.
                parseDuration = minStart(executeCommandMeasures) - commandStart;
                const executeCommandDuration = totalDuration(executeCommandMeasures);
                if (executeCommandDuration !== undefined) {
                    command = { duration: executeCommandDuration };
                }
            }
        }
        const parse = {
            duration: parseDuration,
        };
        const firstToken = totalMarkDuration(reader.getMeasures(ProfileNames.translate), ProfileNames.firstToken);
        if (firstToken !== undefined) {
            parse.marks = { "First Token": firstToken };
        }
        return {
            parse: getInfo(parse),
            command,
            actions,
            duration: commandDuration,
        };
    }
    endCommand(requestId) {
        const metrics = this.getMetrics(requestId);
        if (metrics) {
            this.profileMap.delete(requestId);
        }
        return metrics;
    }
}
//# sourceMappingURL=metrics.js.map