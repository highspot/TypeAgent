// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createActionResultFromError, createActionResultFromHtmlDisplay, createActionResultFromTextDisplay, } from "@typeagent/agent-sdk/helpers/action";
import path from "path";
import os from "node:os";
import { createDatabase, sql_appendCondition, sql_makeInClause, } from "./database.js";
import { dateTime, ensureDir } from "typeagent";
export function instantiate() {
    return createMeasurementAgent();
}
export function createMeasurementAgent() {
    return {
        initializeAgentContext,
        updateAgentContext,
        executeAction,
    };
    async function initializeAgentContext() {
        return {};
    }
    async function updateAgentContext(enable, context) {
        if (enable) {
            const storageDir = await ensureStorageDir();
            const dbPath = path.join(storageDir, "measurements.db");
            context.agentContext.store = await createMeasurementTable(dbPath, true);
        }
        else {
        }
    }
    async function executeAction(action, actionContext) {
        const measureAction = action;
        const context = actionContext.sessionContext.agentContext;
        let result = undefined;
        //let displayText: string | undefined = undefined;
        switch (measureAction.actionName) {
            case "getMeasurement":
                result = await handleGetMeasurements(context, measureAction);
                break;
            case "putMeasurement":
                result = await handlePutMeasurements(context, measureAction);
                break;
            case "removeMeasurement":
            default:
                result = createActionResultFromError(`${measureAction.actionName} not implemented`);
                break;
        }
        return result;
    }
    async function handleGetMeasurements(context, action) {
        const filter = action.parameters.filter;
        const matches = context.store.get(filter);
        if (!matches || matches.length === 0) {
            return createActionResultFromTextDisplay("No measurements found");
        }
        const html = measurementsToHtml(matches);
        const csv = measurementsToCsv(matches);
        return createActionResultFromHtmlDisplay(html, csv);
    }
    async function handlePutMeasurements(context, action) {
        const items = action.parameters.items;
        items.forEach((m) => context.store.put(m));
        return createActionResultFromTextDisplay(`Added ${items.length} measurements`);
    }
    async function ensureStorageDir() {
        const storagePath = getStoragePath();
        await ensureDir(storagePath);
        return storagePath;
    }
    function getStoragePath() {
        const basePath = path.join(os.homedir(), ".typeagent");
        return path.join(basePath, "measures");
    }
    function measurementsToHtml(measures) {
        let html = "<table>";
        html +=
            "<th><td>Type</td><td>When</td><td>Value</td><td>Units</td></th>";
        for (const m of measures) {
            html += measurementToHtml(m);
        }
        html += "</table>";
        return html;
    }
    function measurementToHtml(measure) {
        let html = "";
        html += `<td>${measure.type}</td>`;
        html += `<td>${measure.when}</td>`;
        html += `<td>${measure.value.value}</td>`;
        html += `<td>${measure.value.units}</td>`;
        return html;
    }
    function measurementsToCsv(measures) {
        let csvHeader = "Type, When, Value, Units\n";
        let rows = measures.map((m) => measurementToCsv(m)).join("\n");
        return csvHeader + rows;
    }
    function measurementToCsv(measure) {
        return `${measure.type}, ${measure.when}, ${measure.value.value}, ${measure.value.units}`;
    }
}
async function createMeasurementTable(filePath, ensureExists) {
    const db = await createDatabase(filePath, false);
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      whenDate TEXT NOT NULL,
      value REAL NOT NULL,
      units TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_measurements_type ON measurements (type);
    CREATE INDEX IF NOT EXISTS idx_measurements_values ON measurements (value, units);
    CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON measurements (timestamp);
    `;
    if (ensureExists) {
        db.exec(schemaSql);
    }
    const sql_add = db.prepare(`INSERT OR IGNORE INTO measurements (timestamp, type, whenDate, value, units) VALUES (?, ?, ?, ?, ?)`);
    return {
        get,
        put,
    };
    function get(filter) {
        const sql = filterToSql(filter);
        const stmt = db.prepare(sql);
        let rows = stmt.all();
        let measurements = [];
        for (const row of rows) {
            const mRow = row;
            measurements.push({
                id: mRow.id,
                type: mRow.type,
                when: mRow.whenDate,
                value: {
                    value: mRow.value,
                    units: mRow.units,
                },
            });
        }
        return measurements;
    }
    function put(measurement) {
        const when = measurement.when ? new Date(measurement.when) : new Date();
        const timestamp = dateTime.timestampString(when);
        if (!measurement.id || measurement.id === "new") {
            sql_add.run(timestamp, measurement.type, when.toISOString(), measurement.value.value, measurement.value.units);
        }
    }
    function filterToSql(filter) {
        let sql = "SELECT * FROM measurements\n";
        let sqlWhere = "";
        if (filter.types && filter.types.length > 0) {
            sqlWhere = sql_appendCondition(sqlWhere, `type IN (${sql_makeInClause(filter.types)})`);
        }
        if (filter.valueRange) {
            sqlWhere = sql_appendCondition(sqlWhere, measurementRangeToSql(filter.valueRange));
        }
        if (filter.timeRange) {
            sqlWhere = sql_appendCondition(sqlWhere, timeRangeToSql(filter.timeRange));
        }
        if (sqlWhere) {
            sql += `WHERE ${sqlWhere}`;
        }
        sql += "ORDER BY type ASC, timestamp ASC";
        return sql;
    }
    function measurementRangeToSql(range) {
        let sql = "";
        if (range.start) {
            sql += `value >= ${range.start}`;
        }
        if (range.end) {
            if (sql) {
                sql += " AND ";
            }
            sql += `value <= ${range.end}`;
        }
        if (sql) {
            sql += ` AND units = ${range.units}`;
        }
        return sql;
    }
    function timeRangeToSql(range) {
        const startAt = range.start
            ? dateTime.timestampString(new Date(range.start))
            : undefined;
        const endAt = range.end
            ? dateTime.timestampString(new Date(range.end))
            : undefined;
        let sql = "";
        if (startAt) {
            sql += `timestamp >= ${startAt}`;
        }
        if (endAt) {
            if (sql) {
                sql += " AND ";
            }
            sql += `timestamp <= ${endAt}`;
        }
        return sql;
    }
}
//# sourceMappingURL=measureActionHandler.js.map