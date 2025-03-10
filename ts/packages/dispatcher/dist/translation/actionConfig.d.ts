import { AppAgentManifest, SchemaDefinition } from "@typeagent/agent-sdk";
export type ActionConfig = {
    emojiChar: string;
    schemaDefaultEnabled: boolean;
    actionDefaultEnabled: boolean;
    transient: boolean;
    schemaName: string;
} & SchemaDefinition;
export declare function convertToActionConfig(name: string, config: AppAgentManifest, actionConfigs?: Record<string, ActionConfig>): Record<string, ActionConfig>;
//# sourceMappingURL=actionConfig.d.ts.map