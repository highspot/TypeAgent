import { AppAgentManifest } from "@typeagent/agent-sdk";
import { CommandHandlerContext } from "../handlers/common/commandHandlerContext.js";
import { AppAgentProvider } from "./agentProvider.js";
export declare const inlineAgentManifests: Record<string, AppAgentManifest>;
export declare function createInlineAppAgentProvider(
    context?: CommandHandlerContext,
): AppAgentProvider;
//# sourceMappingURL=inlineAgentProvider.d.ts.map
