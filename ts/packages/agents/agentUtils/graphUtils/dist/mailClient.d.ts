import { Message } from "@microsoft/microsoft-graph-types";
import { PageCollection } from "@microsoft/microsoft-graph-client";
import { GraphClient, DynamicObject } from "./graphClient.js";
declare enum AddressToType {
    "to" = 0,
    "cc" = 1,
    "bcc" = 2
}
export declare class MailClient extends GraphClient {
    private readonly logger;
    constructor();
    getInboxAsync(): Promise<PageCollection | undefined>;
    addEmailsToMessage(addrs: string[], message: Message | DynamicObject, addrTo: AddressToType): void;
    sendMailAsync(subject: string, body: string, to_addrs: string[] | undefined, cc_addrs: string[] | undefined, bcc_addrs: string[] | undefined): Promise<Boolean>;
    replyMailAsync(msg_id: string, content: string, cc_addrs: string[] | undefined, bcc_addrs: string[] | undefined): Promise<Boolean>;
    forwardMailAsync(msg_id: string, content: string, to_addrs: string[] | undefined, cc_addrs: string[] | undefined, bcc_addrs: string[] | undefined): Promise<Boolean>;
    findEmailAsync(sender: string, subject: string | undefined, content: string | undefined, startDateTime: string | undefined, endDateTime: string | undefined): Promise<string | undefined>;
}
export declare function createMailGraphClient(): Promise<MailClient>;
export {};
//# sourceMappingURL=mailClient.d.ts.map