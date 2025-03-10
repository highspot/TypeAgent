// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import registerDebug from "debug";
import chalk from "chalk";
import { GraphClient } from "./graphClient.js";
var AddressToType;
(function (AddressToType) {
    AddressToType[AddressToType["to"] = 0] = "to";
    AddressToType[AddressToType["cc"] = 1] = "cc";
    AddressToType[AddressToType["bcc"] = 2] = "bcc";
})(AddressToType || (AddressToType = {}));
export class MailClient extends GraphClient {
    constructor() {
        super("@email login");
        this.logger = registerDebug("typeagent:graphUtils:mailClient");
    }
    async getInboxAsync() {
        const client = await this.ensureClient();
        return client
            .api("/me/mailFolders/inbox/messages")
            .select(["from", "isRead", "receivedDateTime", "subject"])
            .top(25)
            .orderby("receivedDateTime DESC")
            .get();
    }
    addEmailsToMessage(addrs, message, addrTo) {
        if (addrs && addrs.length > 0) {
            switch (addrTo) {
                case AddressToType.to:
                    addrs.forEach((addr) => {
                        if (addr) {
                            message.toRecipients = [];
                            const recipient = {
                                emailAddress: {
                                    address: addr,
                                },
                            };
                            message.toRecipients?.push(recipient);
                        }
                    });
                    break;
                case AddressToType.cc:
                    addrs.forEach((addr) => {
                        if (addr) {
                            message.ccRecipients = [];
                            const recipient = {
                                emailAddress: {
                                    address: addr,
                                },
                            };
                            message.ccRecipients?.push(recipient);
                        }
                    });
                    break;
                case AddressToType.bcc:
                    addrs.forEach((addr) => {
                        if (addr) {
                            message.bccRecipients = [];
                            const recipient = {
                                emailAddress: {
                                    address: addr,
                                },
                            };
                            message.bccRecipients?.push(recipient);
                        }
                    });
                    break;
            }
        }
    }
    async sendMailAsync(subject, body, to_addrs, cc_addrs, bcc_addrs) {
        const client = await this.ensureClient();
        let fSent = false;
        try {
            const message = {
                subject: subject,
                body: {
                    content: body,
                    contentType: "text",
                },
            };
            if (to_addrs && to_addrs.length > 0) {
                this.addEmailsToMessage(to_addrs, message, AddressToType.to);
            }
            if (cc_addrs && cc_addrs.length > 0) {
                this.addEmailsToMessage(cc_addrs, message, AddressToType.cc);
            }
            if (bcc_addrs && bcc_addrs.length > 0) {
                this.addEmailsToMessage(bcc_addrs, message, AddressToType.bcc);
            }
            await client
                .api("me/sendMail")
                .post({
                message: message,
            })
                .then(async (response) => {
                this.logger(chalk.green(`Mail sent successfully`));
                fSent = true;
            })
                .catch((error) => {
                this.logger(chalk.red(`Error sending mail: ${error}`));
            });
        }
        catch (error) {
            this.logger(chalk.red(`Error sending mail: ${error}`));
        }
        return fSent;
    }
    async replyMailAsync(msg_id, content, cc_addrs, bcc_addrs) {
        const client = await this.ensureClient();
        try {
            const reply = {
                message: {},
                comment: `${content}`,
            };
            if (cc_addrs && cc_addrs.length > 0) {
                this.addEmailsToMessage(cc_addrs, reply.message, AddressToType.cc);
            }
            if (bcc_addrs && bcc_addrs.length > 0) {
                this.addEmailsToMessage(bcc_addrs, reply.message, AddressToType.bcc);
            }
            let res = await client
                .api(`me/messages/${msg_id}/reply`)
                .post(reply);
            if (res) {
                this.logger(chalk.green(`Mail replied successfully to msg_id: ${msg_id}`));
                return true;
            }
        }
        catch (error) {
            this.logger(chalk.red(`Error replying to mail: ${error}`));
        }
        return false;
    }
    async forwardMailAsync(msg_id, content, to_addrs, cc_addrs, bcc_addrs) {
        const client = await this.ensureClient();
        try {
            const message = {
                comment: `${content}`,
            };
            if (to_addrs && to_addrs.length > 0) {
                this.addEmailsToMessage(to_addrs, message, AddressToType.to);
            }
            if (cc_addrs && cc_addrs.length > 0) {
                this.addEmailsToMessage(cc_addrs, message, AddressToType.cc);
            }
            if (bcc_addrs && bcc_addrs.length > 0) {
                this.addEmailsToMessage(bcc_addrs, message, AddressToType.bcc);
            }
            let res = await client
                .api(`me/messages/${msg_id}/forward`)
                .post(message);
            if (res) {
                this.logger(chalk.green(`Mail replied successfully to msg_id: ${msg_id}`));
                return true;
            }
        }
        catch (error) {
            this.logger(chalk.red(`Error replying to mail: ${error}`));
        }
        return false;
    }
    async findEmailAsync(sender, subject, content, startDateTime, endDateTime) {
        const client = await this.ensureClient();
        try {
            if (sender && sender.length > 0) {
                let msgs = await client
                    .api("/me/messages")
                    .filter(`from/emailAddress/address eq '${sender}'`)
                    .select(["from", "id", "receivedDateTime", "subject"])
                    .top(5)
                    .get();
                if (msgs && msgs.value && msgs.value.length > 0) {
                    // we take the latest message
                    let msg = msgs.value[msgs.value.length - 1];
                    return msg.id;
                }
            }
        }
        catch (error) {
            this.logger(chalk.red(`Error finding email: ${error}`));
        }
        return undefined;
    }
}
export async function createMailGraphClient() {
    return new MailClient();
}
//# sourceMappingURL=mailClient.js.map