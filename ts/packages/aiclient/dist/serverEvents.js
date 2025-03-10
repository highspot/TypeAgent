"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMessages = exports.readServerEventStream = void 0;
const restClient_1 = require("./restClient");
async function* readServerEventStream(response) {
    const textStream = (0, restClient_1.readResponseStream)(response);
    for await (const message of readMessages(textStream)) {
        yield readEvent(message);
    }
}
exports.readServerEventStream = readServerEventStream;
// Returns the next full server message
async function* readMessages(textStream) {
    let buffer = "";
    let scanStartAt = 0;
    // Chunks stream in from the server.
    //  - a single chunk can contain multiple messages
    //  - a message can span multiple chunks
    //  - a message end sequence can span two chunks
    for await (const chunk of textStream) {
        scanStartAt = buffer.length > 1 ? buffer.length - 1 : 0;
        buffer += chunk;
        // Scan over buffer finding messages
        while (buffer.length > 0) {
            const terminatorPos = buffer.indexOf(Delimiters.Message, scanStartAt);
            if (terminatorPos < 0) {
                // Delimiter not in remaining buffer. Lets grab next chunk from stream
                break;
            }
            if (terminatorPos > 0) {
                const message = buffer.slice(0, terminatorPos);
                yield message;
            }
            scanStartAt = 0;
            const sliceStartAt = terminatorPos + Delimiters.Message.length;
            if (sliceStartAt >= buffer.length) {
                buffer = "";
                break;
            }
            buffer = buffer.slice(sliceStartAt);
        }
    }
    // Any remaining buffer is ignored as being incomplete
}
exports.readMessages = readMessages;
var Delimiters;
(function (Delimiters) {
    Delimiters["Message"] = "\n\n";
    Delimiters["Field"] = "\n";
    Delimiters["FieldName"] = ":";
})(Delimiters || (Delimiters = {}));
var FieldNames;
(function (FieldNames) {
    FieldNames["Id"] = "id";
    FieldNames["Event"] = "event";
    FieldNames["Data"] = "data";
})(FieldNames || (FieldNames = {}));
// Parse server event into fields. Each field is separated by '\n'
function readEvent(text) {
    const event = { data: "" };
    const fields = text.split(Delimiters.Field);
    for (const field of fields) {
        const fieldNameEndPos = field.indexOf(Delimiters.FieldName);
        if (fieldNameEndPos < 1) {
            continue;
        }
        const name = field.slice(0, fieldNameEndPos);
        const value = field.slice(fieldNameEndPos + 1).trimStart();
        switch (name) {
            default:
                break;
            case FieldNames.Id:
                event.id = value;
                break;
            case FieldNames.Event:
                event.event = value;
                break;
            case FieldNames.Data:
                event.data = value;
                break;
        }
    }
    return event;
}
//# sourceMappingURL=serverEvents.js.map