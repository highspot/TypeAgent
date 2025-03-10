/// <reference types="node" resolution-mode="require"/>
import { ChildProcess } from "child_process";
import { CommandHandlerTable } from "@typeagent/agent-sdk/helpers/command";
export declare function createServiceHost(): Promise<ChildProcess | undefined>;
export declare function getServiceHostCommandHandlers(): CommandHandlerTable;
//# sourceMappingURL=serviceHostCommandHandler.d.ts.map
