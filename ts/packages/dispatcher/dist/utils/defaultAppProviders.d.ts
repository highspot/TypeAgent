import { AppAgentProvider } from "../agentProvider/agentProvider.js";
import { ActionConfigProvider } from "../translation/agentTranslators.js";
export declare function getBuiltinAppAgentProvider(): AppAgentProvider;
export declare function getDefaultAppAgentProviders(): AppAgentProvider[];
export declare function getSchemaNamesFromDefaultAppAgentProviders(): string[];
export declare function getActionConfigProviderFromDefaultAppAgentProviders(): ActionConfigProvider;
export declare function createSchemaInfoProviderFromDefaultAppAgentProviders(): import("agent-cache").SchemaInfoProvider;
//# sourceMappingURL=defaultAppProviders.d.ts.map