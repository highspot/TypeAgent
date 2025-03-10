import { ActionSchemaFile } from "action-schema";
import { ActionConfig } from "./actionConfig.js";
export interface ActionConfigProvider {
    tryGetActionConfig(schemaName: string): ActionConfig | undefined;
    getActionConfig(schemaName: string): ActionConfig;
    getActionConfigs(): ActionConfig[];
    getActionSchemaFileForConfig(config: ActionConfig): ActionSchemaFile;
}
//# sourceMappingURL=actionConfigProvider.d.ts.map