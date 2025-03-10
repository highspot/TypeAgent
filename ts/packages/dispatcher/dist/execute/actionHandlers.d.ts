import { ExecutableAction } from "agent-cache";
import { CommandHandlerContext } from "../context/commandHandlerContext.js";
import { SessionContext, ActionContext, ParsedCommandParams, ParameterDefinitions } from "@typeagent/agent-sdk";
import { MatchResult, PromptEntity } from "agent-cache";
import { IncrementalJsonValueCallBack } from "common-utils";
export declare function getSchemaNamePrefix(translatorName: string, systemContext: CommandHandlerContext): string;
export type ActionContextWithClose = {
    actionContext: ActionContext<unknown>;
    actionIndex: number | undefined;
    closeActionContext: () => void;
};
export declare function createSessionContext<T = unknown>(name: string, agentContext: T, context: CommandHandlerContext, allowDynamicAgent: boolean): SessionContext<T>;
export declare function executeActions(actions: ExecutableAction[], entities: PromptEntity[] | undefined, context: ActionContext<CommandHandlerContext>): Promise<void>;
export declare function validateWildcardMatch(match: MatchResult, context: CommandHandlerContext): Promise<boolean>;
export declare function startStreamPartialAction(translatorName: string, actionName: string, context: CommandHandlerContext, actionIndex: number): IncrementalJsonValueCallBack;
export declare function executeCommand(commands: string[], params: ParsedCommandParams<ParameterDefinitions> | undefined, appAgentName: string, context: CommandHandlerContext, attachments?: string[]): Promise<void>;
//# sourceMappingURL=actionHandlers.d.ts.map