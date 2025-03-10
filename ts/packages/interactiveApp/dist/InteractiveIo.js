"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = exports.askYesNo = exports.ConsoleWriter = exports.createInteractiveIO = exports.getInteractiveIO = void 0;
const promises_1 = __importDefault(require("readline/promises"));
const url_1 = require("url");
let g_io;
function getInteractiveIO() {
    if (!g_io) {
        g_io = createInteractiveIO();
    }
    return g_io;
}
exports.getInteractiveIO = getInteractiveIO;
function createInteractiveIO() {
    const line = promises_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return {
        stdin: process.stdin,
        stdout: process.stdout,
        readline: line,
        writer: new ConsoleWriter(process.stdout),
    };
}
exports.createInteractiveIO = createInteractiveIO;
/**
 * ConsoleWriter has easy wrappers like writeLine that are missing in standard io interfaces
 */
class ConsoleWriter {
    constructor(stdout, indent = "") {
        this.stdout = stdout;
        this.indent = indent;
    }
    write(text) {
        if (text) {
            this.stdout.write(text);
        }
        return this;
    }
    writeInline(text, prevText) {
        if (prevText) {
            this.stdout.moveCursor(-prevText.length, 0);
        }
        this.write(text);
        return this;
    }
    writeLine(value) {
        let text;
        if (value !== undefined && typeof value !== "string") {
            text = value.toString();
        }
        else {
            text = value;
        }
        if (text) {
            this.write(text);
        }
        this.write("\n");
        return this;
    }
    writeJson(obj, indented = true) {
        this.writeLine(indented ? this.jsonString(obj) : JSON.stringify(obj));
        return this;
    }
    jsonString(obj) {
        return JSON.stringify(obj, null, 2);
    }
    writeList(list, options) {
        if (!list) {
            return this;
        }
        const isInline = options && (options.type === "plain" || options.type === "csv");
        if (options?.title) {
            if (isInline) {
                this.write(options.title + ": ");
            }
            else {
                this.writeLine(options.title);
            }
        }
        if (typeof list === "string") {
            this.writeLine(this.listItemToString(1, list, options));
            return this;
        }
        if (list instanceof Set) {
            list = [...list.values()];
        }
        if (isInline) {
            const sep = options.type === "plain" ? " " : ", ";
            for (let i = 0; i < list.length; ++i) {
                if (i > 0) {
                    this.write(sep);
                }
                this.write(list[i]);
            }
            this.writeLine();
        }
        else {
            for (let i = 0; i < list.length; ++i) {
                const item = list[i];
                if (item) {
                    this.writeLine(this.listItemToString(i + 1, item, options));
                }
            }
        }
        return this;
    }
    writeTable(table) {
        if (table.length === 0) {
            return this;
        }
        for (let i = 0; i < table.length; ++i) {
            this.writeList(table[i]);
        }
        return this;
    }
    writeNameValue(name, value, paddedNameLength, indent) {
        if (indent) {
            this.write(indent);
        }
        if (Array.isArray(value)) {
            value = value.join("; ");
        }
        const line = `${paddedNameLength ? name.padEnd(paddedNameLength) : name}  ${value}`;
        this.writeLine(line);
        return this;
    }
    writeRecord(record, sort = false, stringifyValue, indent) {
        const keys = Object.keys(record);
        if (sort) {
            keys.sort();
        }
        let maxLength = this.getMaxLength(keys);
        for (const key of keys) {
            let value = record[key];
            let strValues = stringifyValue ? stringifyValue(value) : value;
            if (Array.isArray(strValues) && strValues.length > 0) {
                this.writeNameValue(key, strValues[0], maxLength, indent);
                for (let i = 1; i < strValues.length; ++i) {
                    this.writeNameValue("", strValues[i], maxLength, indent);
                }
            }
            else {
                this.writeNameValue(key, strValues, maxLength, indent);
            }
        }
        return maxLength;
    }
    writeLink(url) {
        this.writeLine((0, url_1.pathToFileURL)(url).toString());
        return this;
    }
    listItemToString(i, item, options) {
        switch (options?.type ?? "plain") {
            default:
                return item;
            case "ol":
                return `${i}. ${item}`;
            case "ul":
                return "• " + item;
        }
    }
    getMaxLength(values) {
        let maxLength = 0;
        values.forEach((v) => {
            maxLength = v.length > maxLength ? v.length : maxLength;
        });
        return maxLength;
    }
}
exports.ConsoleWriter = ConsoleWriter;
async function askYesNo(io, question) {
    let answer = await io.readline.question(`${question} (y/n):`);
    return answer.trim().toLowerCase() === "y";
}
exports.askYesNo = askYesNo;
class ProgressBar {
    constructor(writer, total, count = 0) {
        this.writer = writer;
        this.total = total;
        this.count = count;
        this._lastText = "";
    }
    advance(amount = 1) {
        if (this.count >= this.total) {
            return;
        }
        let next = this.count + amount;
        if (next >= this.total) {
            next = this.total;
        }
        this.count = next;
        let progressText = `[${this.count} / ${this.total}]`;
        this.writer.writeInline(progressText, this._lastText);
        this._lastText = progressText;
    }
    complete() {
        if (this._lastText) {
            this.writer.writeInline("", this._lastText);
            this._lastText = "";
        }
    }
    reset(total) {
        this.complete();
        this.count = 0;
        if (total) {
            this.total = total;
        }
    }
}
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=InteractiveIo.js.map