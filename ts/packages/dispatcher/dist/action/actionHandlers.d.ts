import { Actions } from "agent-cache";
import { CommandHandlerContext } from "../handlers/common/commandHandlerContext.js";
import {
    SessionContext,
    ActionContext,
    ParsedCommandParams,
    ParameterDefinitions,
} from "@typeagent/agent-sdk";
import { MatchResult } from "agent-cache";
import { IncrementalJsonValueCallBack } from "common-utils";
export declare function getTranslatorPrefix(
    translatorName: string,
    systemContext: CommandHandlerContext,
): string;
export declare function createSessionContext<T = unknown>(
    name: string,
    agentContext: T,
    context: CommandHandlerContext,
): SessionContext<T>;
export declare function executeActions(
    actions: Actions,
    context: ActionContext<CommandHandlerContext>,
): Promise<void>;
export declare function validateWildcardMatch(
    match: MatchResult,
    context: CommandHandlerContext,
): Promise<boolean>;
export declare function startStreamPartialAction(
    translatorName: string,
    actionName: string,
    context: CommandHandlerContext,
): IncrementalJsonValueCallBack;
export declare function executeCommand(
    commands: string[],
    params: ParsedCommandParams<ParameterDefinitions> | undefined,
    appAgentName: string,
    context: CommandHandlerContext,
    attachments?: string[],
): Promise<void>;
//# sourceMappingURL=actionHandlers.d.ts.map
