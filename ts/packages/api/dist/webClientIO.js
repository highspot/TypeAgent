// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export class WebAPIClientIO {
    constructor() {
        this.yesNoCallbacks = new Map();
        this.proposedActionCallbacks = new Map();
        this.questionCallbacks = new Map();
        this.maxAskYesNoId = 0;
        this.maxProposedActionId = 0;
    }
    get CurrentWebSocket() {
        return this.currentws;
    }
    set CurrentWebSocket(value) {
        this.currentws = value;
    }
    resolveYesNoPromise(yesNoAskId, accept) {
        if (this.yesNoCallbacks.has(yesNoAskId)) {
            let callback = this.yesNoCallbacks.get(yesNoAskId);
            callback(accept);
            this.yesNoCallbacks.delete(yesNoAskId);
        }
    }
    resolveProposeActionPromise(proposedActionId, replacement) {
        if (this.proposedActionCallbacks.has(proposedActionId)) {
            let callback = this.proposedActionCallbacks.get(proposedActionId);
            callback(replacement);
            this.proposedActionCallbacks.delete(proposedActionId);
        }
    }
    resolveQuestionPromise(questionId, response) {
        if (this.questionCallbacks.has(questionId)) {
            let callback = this.questionCallbacks.get(questionId);
            callback(response);
            this.questionCallbacks.delete(questionId);
        }
    }
    clear() {
        this.currentws?.send(JSON.stringify({
            message: "clear",
            data: {},
        }));
    }
    setDisplay(message) {
        this.updateDisplay(message);
    }
    appendDisplay(message, mode) {
        this.updateDisplay(message, mode ?? "inline");
    }
    updateDisplay(message, mode) {
        this.currentws?.send(JSON.stringify({
            message: "update-display",
            data: {
                message,
                mode,
            },
        }));
        console.log("update-display");
    }
    setDynamicDisplay(source, requestId, actionIndex, displayId, nextRefreshMs) {
        this.currentws?.send(JSON.stringify({
            message: "set-dynamic-action-display",
            data: {
                source,
                requestId,
                actionIndex,
                displayId,
                nextRefreshMs,
            },
        }));
    }
    async askYesNo(message, requestId, defaultValue = false) {
        // Ignore message without requestId
        if (requestId === undefined) {
            console.warn("askYesNo: requestId is undefined");
            return defaultValue;
        }
        const currentAskYesNoId = this.maxAskYesNoId++;
        return new Promise((resolve) => {
            this.yesNoCallbacks.set(currentAskYesNoId, (accept) => {
                resolve(accept);
            });
            this.currentws?.send(JSON.stringify({
                message: "askYesNo",
                data: {
                    requestId,
                    currentAskYesNoId,
                    message,
                },
            }));
        });
    }
    proposeAction(actionTemplates, requestId, source) {
        const currentProposeActionId = this.maxProposedActionId++;
        return new Promise((resolve) => {
            this.proposedActionCallbacks.set(currentProposeActionId, (replacement) => {
                resolve(replacement);
            });
            this.currentws?.send(JSON.stringify({
                message: "proposeAction",
                data: {
                    currentProposeActionId,
                    actionTemplates,
                    requestId,
                    source,
                },
            }));
        });
    }
    notify(event, requestId, data, source) {
        this.currentws?.send(JSON.stringify({
            message: "notify",
            data: {
                event,
                requestId,
                data,
                source,
            },
        }));
    }
    exit() {
        this.currentws?.send(JSON.stringify({
            message: "exit",
            data: {},
        }));
    }
    takeAction(action, data) {
        this.currentws?.send(JSON.stringify({
            message: "take-action",
            data: { action, data },
        }));
    }
    updateSettingsSummary(summary, registeredAgents) {
        this.currentws?.send(JSON.stringify({
            message: "setting-summary-changed",
            data: {
                summary,
                registeredAgents,
            },
        }));
    }
    sendSuccessfulCommandResult(messageId, requestId, metrics) {
        this.currentws?.send(JSON.stringify({
            message: "process-shell-request-done",
            data: {
                messageId,
                requestId,
                metrics,
            },
        }));
    }
    sendFailedCommandResult(messageId, requestId, error) {
        this.sendMessage("process-shell-request-error", {
            messageId,
            requestId,
            error,
        });
    }
    sendTemplateSchema(messageId, schema) {
        this.sendMessage("set-template-schema", {
            messageId,
            schema,
        });
    }
    sendMessage(messageType, payload) {
        this.currentws?.send(JSON.stringify({
            message: messageType,
            data: payload,
        }));
    }
}
//# sourceMappingURL=webClientIO.js.map