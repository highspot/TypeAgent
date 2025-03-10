import { CommandHandlerTable } from "@typeagent/agent-sdk/helpers/command";
export type UserRequestList = {
    messages: UserRequest[];
};
export type UserRequest = {
    message: string;
};
export declare function getRandomCommandHandlers(): CommandHandlerTable;
//# sourceMappingURL=randomCommandHandler.d.ts.map