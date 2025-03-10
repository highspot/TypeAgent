// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createActionResult } from "@typeagent/agent-sdk/helpers/action";
import { createMarkdownAgent } from "./translator.js";
import { fork } from "child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
export function instantiate() {
    return {
        initializeAgentContext: initializeMarkdownContext,
        updateAgentContext: updateMarkdownContext,
        executeAction: executeMarkdownAction,
        validateWildcardMatch: markdownValidateWildcardMatch,
    };
}
async function executeMarkdownAction(action, context) {
    let result = await handleMarkdownAction(action, context);
    return result;
}
async function markdownValidateWildcardMatch(action, context) {
    return true;
}
async function initializeMarkdownContext() {
    return {};
}
async function updateMarkdownContext(enable, context) {
    if (enable) {
        if (!context.agentContext.currentFileName) {
            context.agentContext.currentFileName = "live.md";
        }
        const storage = context.sessionStorage;
        const fileName = context.agentContext.currentFileName;
        if (!(await storage?.exists(fileName))) {
            await storage?.write(fileName, "");
        }
        if (!context.agentContext.viewProcess) {
            const fullPath = await getFullMarkdownFilePath(fileName, storage);
            if (fullPath) {
                process.env.MARKDOWN_FILE = fullPath;
                context.agentContext.viewProcess =
                    await createViewServiceHost(fullPath);
            }
        }
    }
    else {
        // shut down service
        if (context.agentContext.viewProcess) {
            context.agentContext.viewProcess.kill();
        }
    }
}
async function getFullMarkdownFilePath(fileName, storage) {
    const paths = await storage?.list("", { fullPath: true });
    const candidates = paths?.filter((item) => item.endsWith(fileName));
    return candidates ? candidates[0] : undefined;
}
async function handleMarkdownAction(action, actionContext) {
    let result = undefined;
    const agent = await createMarkdownAgent("GPT_4o");
    const storage = actionContext.sessionContext.sessionStorage;
    switch (action.actionName) {
        case "openDocument":
        case "createDocument": {
            if (!action.parameters.name) {
                result = createActionResult("Document could not be created: no name was provided");
            }
            else {
                result = createActionResult("Opening document ...");
                const newFileName = action.parameters.name.trim() + ".md";
                actionContext.sessionContext.agentContext.currentFileName =
                    newFileName;
                if (!(await storage?.exists(newFileName))) {
                    await storage?.write(newFileName, "");
                }
                if (actionContext.sessionContext.agentContext.viewProcess) {
                    const fullPath = await getFullMarkdownFilePath(newFileName, storage);
                    actionContext.sessionContext.agentContext.viewProcess.send({
                        type: "setFile",
                        filePath: fullPath,
                    });
                }
                result = createActionResult("Document opened");
            }
            break;
        }
        case "updateDocument": {
            result = createActionResult("Updating document ...");
            const filePath = `${actionContext.sessionContext.agentContext.currentFileName}`;
            let markdownContent;
            if (await storage?.exists(filePath)) {
                markdownContent = await storage?.read(filePath, "utf8");
            }
            const response = await agent.updateDocument(markdownContent, action.parameters.originalRequest);
            if (response.success) {
                const mdResult = response.data;
                // write to file
                if (mdResult.content) {
                    await storage?.write(filePath, mdResult.content);
                }
                if (mdResult.operationSummary) {
                    result = createActionResult(mdResult.operationSummary);
                }
                else {
                    result = createActionResult("Updated document");
                }
            }
            else {
                console.error(response.message);
            }
            break;
        }
    }
    return result;
}
export async function createViewServiceHost(filePath) {
    let timeoutHandle;
    const timeoutPromise = new Promise((_resolve, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error("Markdown view service creation timed out")), 10000);
    });
    const viewServicePromise = new Promise((resolve, reject) => {
        try {
            const expressService = fileURLToPath(new URL(path.join("..", "./view/route/service.js"), import.meta.url));
            const childProcess = fork(expressService);
            childProcess.send({
                type: "setFile",
                filePath: filePath,
            });
            childProcess.on("message", function (message) {
                if (message === "Success") {
                    resolve(childProcess);
                }
                else if (message === "Failure") {
                    resolve(undefined);
                }
            });
            childProcess.on("exit", (code) => {
                console.log("Markdown view server exited with code:", code);
            });
        }
        catch (e) {
            console.error(e);
            resolve(undefined);
        }
    });
    return Promise.race([viewServicePromise, timeoutPromise]).then((result) => {
        clearTimeout(timeoutHandle);
        return result;
    });
}
//# sourceMappingURL=markdownActionHandler.js.map