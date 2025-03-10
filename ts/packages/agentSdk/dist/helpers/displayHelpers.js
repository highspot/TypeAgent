// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function gatherMessages(callback) {
    const messages = [];
    callback((message) => {
        messages.push(message);
    });
    return messages.join("\n");
}
function getMessage(input, kind) {
    const content = typeof input === "function" ? gatherMessages(input) : input;
    return kind ? { type: "text", content, kind } : content;
}
function displayMessage(message, context, kind, appendMode = "block") {
    context.actionIO.appendDisplay(getMessage(message, kind), appendMode);
}
export async function displayInfo(message, context) {
    displayMessage(message, context, "info");
}
export async function displayStatus(message, context) {
    displayMessage(message, context, "status", "temporary");
}
export async function displayWarn(message, context) {
    displayMessage(message, context, "warning");
}
export async function displayError(message, context) {
    displayMessage(message, context, "error");
}
export async function displaySuccess(message, context) {
    displayMessage(message, context, "success");
}
export async function displayResult(message, context) {
    displayMessage(message, context);
}
//# sourceMappingURL=displayHelpers.js.map