export type EmailAction = SendEmailAction | ReplyEmailAction | ForwardEmailAction | FindEmailAction;
export interface GenerateContent {
    generateBody?: boolean;
    bodySearchQuery?: string;
}
export type SendEmailAction = {
    actionName: "sendEmail";
    parameters: {
        subject: string;
        body?: string;
        to: string[];
        cc?: string[];
        bcc?: string[];
        attachments?: string[];
        genContent: GenerateContent;
    };
};
interface MsgDateTimeRange {
    startTime?: string;
    endTime?: string;
    day?: string;
    dayRange?: string;
}
interface MessageReference {
    senders?: string[];
    subject?: string;
    content?: string;
    receivedDateTime?: MsgDateTimeRange;
    srcFolder?: string;
    destfolder?: string;
}
export type ForwardEmailAction = {
    actionName: "forwardEmail";
    parameters: {
        to: string[];
        cc?: string[];
        bcc?: string[];
        additionalMessage?: string;
        messageRef: MessageReference;
    };
};
export type ReplyEmailAction = {
    actionName: "replyEmail";
    parameters: {
        body?: string;
        cc?: string[];
        bcc?: string[];
        attachments?: string[];
        messageRef: MessageReference;
    };
};
export type FindEmailAction = {
    actionName: "findEmail";
    parameters: {
        messageRef: MessageReference;
    };
};
export {};
//# sourceMappingURL=emailActionsSchema.d.ts.map