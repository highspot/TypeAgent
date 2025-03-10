// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function normalizeParamString(str) {
    return str
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
}
export function normalizeParamValue(value) {
    return typeof value === "string" ? normalizeParamString(value) : value;
}
export function equalNormalizedParamValue(a, b) {
    return a === b || normalizeParamValue(a) === normalizeParamValue(b);
}
export function equalNormalizedParamObject(a = {}, b = {}) {
    return (normalizeParamString(JSON.stringify(a)) ===
        normalizeParamString(JSON.stringify(b)));
}
export function createExecutableAction(translatorName, actionName, parameters, resultEntityId) {
    const action = {
        translatorName,
        actionName,
    };
    if (parameters !== undefined) {
        action.parameters = parameters;
    }
    const executableAction = {
        action,
    };
    if (resultEntityId !== undefined) {
        executableAction.resultEntityId = resultEntityId;
    }
    return executableAction;
}
const format = "'<request> => translator.action(<parameters>)' or '<request> => [ translator.action1(<parameters1>), translator.action2(<parameters2>), ... ]'";
function parseFullActionNameParts(fullActionName) {
    const parts = fullActionName.split(".");
    const translatorName = parts.slice(0, -1).join(".");
    const actionName = parts.at(-1);
    return { translatorName, actionName };
}
function parseAction(action, index = -1) {
    const leftParan = action.indexOf("(");
    if (leftParan === -1) {
        throw new Error(`${index !== -1 ? `Action ${index}: ` : ""}Missing '('. Input must be in the form of ${format}`);
    }
    const functionName = action.substring(0, leftParan);
    const { translatorName, actionName } = parseFullActionNameParts(functionName);
    if (!actionName) {
        throw new Error(`${index !== -1 ? `Action ${index}: ` : ""}Unable to parse action name from '${functionName}'. Input must be in the form of ${format}`);
    }
    if (action[action.length - 1] !== ")") {
        throw new Error(`${index !== -1 ? `Action ${index}: ` : ""}Missing terminating ')'. Input must be in the form of ${format}`);
    }
    const paramStr = action.substring(leftParan + 1, action.length - 1).trim();
    let parameters;
    if (paramStr) {
        try {
            parameters = JSON.parse(paramStr);
        }
        catch (e) {
            throw new Error(`${index !== -1 ? `Action ${index}: ` : ""}Unable to parse parameters as JSON: '${paramStr}\n${e.message}'`);
        }
    }
    return createExecutableAction(translatorName, actionName, parameters);
}
function parseActions(actionStr) {
    if (actionStr[actionStr.length - 1] !== "]") {
        `Missing terminating ']'. Input must be in the form of ${format}`;
    }
    const actions = [];
    // Remove the brackets
    let curr = actionStr.substring(1, actionStr.length - 1);
    // Try guessing the end of the action and try parsing it.
    let right = -1;
    while (true) {
        // Find the next possible end of the action
        right = curr.indexOf("}),", right + 1);
        if (right === -1) {
            // End of the list, try parse the error, and if it fails, the error propagates
            actions.push(parseAction(curr, actions.length + 1));
            break;
        }
        const action = curr.substring(0, right + 2);
        try {
            // Try to see if we can parse action.
            actions.push(parseAction(action, actions.length));
        }
        catch {
            // If not, it could be that the pattern is in a quote. Try to find the next possible end of the action
            continue;
        }
        curr = curr.substring(right + 3).trim();
        right = -1;
    }
    return actions;
}
export function getFullActionName(action) {
    return `${action.action.translatorName}.${action.action.actionName}`;
}
function parseExecutableActionsString(actions) {
    return actions[0] === "[" ? parseActions(actions) : [parseAction(actions)];
}
function executableActionToString(action) {
    return `${getFullActionName(action)}(${action.action.parameters ? JSON.stringify(action.action.parameters) : ""})`;
}
function executableActionsToString(actions) {
    return actions.length !== 1
        ? `[${actions.map(executableActionToString).join(",")}]`
        : executableActionToString(actions[0]);
}
function fromJsonAction(actionJSON) {
    const { translatorName, actionName } = parseFullActionNameParts(actionJSON.fullActionName);
    return createExecutableAction(translatorName, actionName, actionJSON.parameters, actionJSON.resultEntityId);
}
export function fromJsonActions(actions) {
    return Array.isArray(actions)
        ? actions.map((a) => fromJsonAction(a))
        : [fromJsonAction(actions)];
}
function toJsonAction(action) {
    const result = { fullActionName: getFullActionName(action) };
    if (action.action.parameters) {
        result.parameters = action.action.parameters;
    }
    if (action.resultEntityId) {
        result.resultEntityId = action.resultEntityId;
    }
    return result;
}
export function toJsonActions(actions) {
    return actions.length !== 1
        ? actions.map(toJsonAction)
        : toJsonAction(actions[0]);
}
export function toExecutableActions(actions) {
    return actions.map((action) => ({ action }));
}
export function toFullActions(actions) {
    return actions.map((a) => a.action);
}
export function getTranslationNamesForActions(actions) {
    return Array.from(new Set(actions.map((a) => a.action.translatorName))).sort();
}
export class RequestAction {
    constructor(request, actions, history) {
        this.request = request;
        this.actions = actions;
        this.history = history;
    }
    toString() {
        return `${this.request}${RequestAction.Separator}${executableActionsToString(this.actions)}`;
    }
    toPromptString() {
        return JSON.stringify({
            request: this.request,
            actions: this.actions,
        }, undefined, 2);
    }
    static fromString(input) {
        // Very simplistic parser for request/action.
        const trimmed = input.trim();
        const separator = trimmed.indexOf(RequestAction.Separator);
        if (separator === -1) {
            throw new Error(`'${RequestAction.Separator}' not found. Input must be in the form of ${format}`);
        }
        const request = trimmed.substring(0, separator).trim();
        const actions = trimmed
            .substring(separator + RequestAction.Separator.length)
            .trim();
        return new RequestAction(request, parseExecutableActionsString(actions));
    }
    static create(request, actions, history) {
        return new RequestAction(request, Array.isArray(actions) ? actions : [actions], history);
    }
}
RequestAction.Separator = " => ";
//# sourceMappingURL=requestAction.js.map