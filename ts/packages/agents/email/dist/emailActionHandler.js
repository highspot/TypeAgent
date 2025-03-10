// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createMailGraphClient } from "graph-utils";
import chalk from "chalk";
import { generateNotes } from "typeagent";
import { openai } from "aiclient";
import { createActionResultFromHtmlDisplay } from "@typeagent/agent-sdk/helpers/action";
import { getCommandInterface, } from "@typeagent/agent-sdk/helpers/command";
import { displayStatus, displaySuccess, displayWarn, } from "@typeagent/agent-sdk/helpers/display";
import registerDebug from "debug";
const debug = registerDebug("typeagent:email");
class MailClientLoginCommandHandler {
    constructor() {
        this.description = "Log into the MS Graph to access email";
    }
    async run(context) {
        const mailClient = context.sessionContext.agentContext.mailClient;
        if (mailClient === undefined) {
            throw new Error("Mail client not initialized");
        }
        if (mailClient.isAuthenticated()) {
            displayWarn("Already logged in", context);
            return;
        }
        await mailClient.login((prompt) => displayStatus(prompt, context));
        displaySuccess("Successfully logged in", context);
    }
}
class MailClientLogoutCommandHandler {
    constructor() {
        this.description = "Log out of MS Graph to access email";
    }
    async run(context) {
        const mailClient = context.sessionContext.agentContext.mailClient;
        if (mailClient === undefined) {
            throw new Error("Calendar client not initialized");
        }
        if (mailClient.logout()) {
            displaySuccess("Successfully logged out", context);
        }
        else {
            displayWarn("Already logged out", context);
        }
    }
}
const handlers = {
    description: "Email login command",
    defaultSubCommand: "login",
    commands: {
        login: new MailClientLoginCommandHandler(),
        logout: new MailClientLogoutCommandHandler(),
    },
};
export function instantiate() {
    return {
        initializeAgentContext: initializeEmailContext,
        updateAgentContext: updateEmailContext,
        executeAction: executeEmailAction,
        ...getCommandInterface(handlers),
    };
}
async function initializeEmailContext() {
    return {
        mailClient: undefined,
    };
}
async function updateEmailContext(enable, context) {
    if (enable) {
        context.agentContext.mailClient = await createMailGraphClient();
    }
    else {
        context.agentContext.mailClient = undefined;
    }
}
async function executeEmailAction(action, context) {
    const { mailClient } = context.sessionContext.agentContext;
    if (mailClient === undefined) {
        throw new Error("Mail client not initialized");
    }
    if (!mailClient.isAuthenticated()) {
        await mailClient.login();
    }
    let result = await handleEmailAction(action, context);
    if (result) {
        return createActionResultFromHtmlDisplay(result);
    }
}
async function handleEmailAction(action, context) {
    const { mailClient } = context.sessionContext.agentContext;
    if (!mailClient) {
        return "<div>Mail client not initialized ...</div>";
    }
    let res;
    switch (action.actionName) {
        case "sendEmail":
            let to_addrs = [];
            if (action.parameters.to && action.parameters.to.length > 0) {
                to_addrs = await mailClient.getEmailAddressesOfUsernamesLocal(action.parameters.to);
            }
            let cc_addrs = [];
            if (action.parameters.cc && action.parameters.cc.length > 0) {
                cc_addrs = await mailClient.getEmailAddressesOfUsernamesLocal(action.parameters.cc);
            }
            let bcc_addrs = [];
            if (action.parameters.bcc && action.parameters.bcc.length > 0) {
                bcc_addrs = await mailClient.getEmailAddressesOfUsernamesLocal(action.parameters.bcc);
            }
            let genContent = "";
            if (action.parameters.genContent.generateBody) {
                let query = action.parameters.genContent.bodySearchQuery;
                if (query) {
                    let result = await generateNotes(query, 4096, openai.createChatModel("GPT_35_TURBO", undefined, undefined, ["emailActionHandler"]), undefined);
                    if (result.success) {
                        result.data.forEach((data) => {
                            genContent += data + "\n";
                        });
                    }
                }
            }
            debug(chalk.green("Handling sendEmail action ..."));
            res = await mailClient.sendMailAsync(action.parameters.subject, genContent.length > 0
                ? genContent
                : action.parameters.body ?? "", to_addrs, cc_addrs, bcc_addrs);
            if (res) {
                return "<div>Email sent ...</div>";
            }
            else {
                return "<div>Error encountered when sending email!</div>";
            }
            break;
        case "forwardEmail":
        case "replyEmail":
            await handleForwardOrReplyAction(action, mailClient);
            break;
        default:
            throw new Error(`Unknown action: ${action.actionName}`);
    }
}
async function handleForwardOrReplyAction(action, mailClient) {
    let msgRef = action.parameters.messageRef;
    if (msgRef) {
        // use the message reference to find the email to reply to
        console.log(chalk.green("Handling replyEmail action ..."));
        let senders = [];
        if (msgRef.senders && msgRef.senders.length > 0) {
            senders = await mailClient.getEmailAddressesOfUsernamesLocal(msgRef.senders);
        }
        if (senders && senders.length > 0) {
            // get the email message to reply to
            let msg_id = await mailClient.findEmailAsync(senders[0], msgRef.subject, msgRef.content, msgRef.receivedDateTime?.startTime, msgRef.receivedDateTime?.endTime);
            if (msg_id) {
                let cc_addrs = [];
                if (action.parameters.cc && action.parameters.cc.length > 0) {
                    cc_addrs =
                        await mailClient.getEmailAddressesOfUsernamesLocal(action.parameters.cc);
                }
                cc_addrs;
                let bcc_addrs = [];
                if (action.parameters.bcc && action.parameters.bcc.length > 0) {
                    bcc_addrs =
                        await mailClient.getEmailAddressesOfUsernamesLocal(action.parameters.bcc);
                }
                // reply to the email
                if (action.actionName === "replyEmail") {
                    let res = await mailClient.replyMailAsync(msg_id, action.parameters.body ?? "", cc_addrs, bcc_addrs);
                    if (res) {
                        return "<div>Email replied ...</div>";
                    }
                    else {
                        return "<div>Error encountered when replying to email!</div>";
                    }
                }
                else {
                    let to_addrs = [];
                    if (action.parameters.to &&
                        action.parameters.to.length > 0) {
                        to_addrs =
                            await mailClient.getEmailAddressesOfUsernamesLocal(action.parameters.to);
                    }
                    let res = await mailClient.forwardMailAsync(msg_id, action.parameters.additionalMessage ?? "", to_addrs, cc_addrs, bcc_addrs);
                    if (res) {
                        return "<div>Email forwarded ...</div>";
                    }
                    else {
                        return "<div>Error encountered when forwarding email!</div>";
                    }
                }
            }
        }
        else {
            console.log(chalk.red("No sender found in message reference"));
        }
    }
}
//# sourceMappingURL=emailActionHandler.js.map