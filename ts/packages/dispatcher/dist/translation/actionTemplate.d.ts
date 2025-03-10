import { ExecutableAction } from "agent-cache";
import { CommandHandlerContext } from "../context/commandHandlerContext.js";
import { TemplateSchema, SessionContext, AppAction } from "@typeagent/agent-sdk";
import { DeepPartialUndefined } from "common-utils";
export type TemplateData = {
    schema: TemplateSchema;
    data: unknown;
};
export type TemplateEditConfig = {
    templateAgentName: string;
    templateName: string;
    templateData: TemplateData | TemplateData[];
    defaultTemplate: TemplateSchema;
    preface?: string;
    editPreface?: string;
    completion?: boolean;
};
export declare function getActionTemplateEditConfig(context: CommandHandlerContext, actions: ExecutableAction[], preface: string, editPreface: string): TemplateEditConfig;
export declare function getSystemTemplateSchema(templateName: string, data: any, context: SessionContext<CommandHandlerContext>): Promise<TemplateSchema>;
export declare function getSystemTemplateCompletion(templateName: string, data: any, propertyName: string, context: SessionContext<CommandHandlerContext>): Promise<string[]>;
export declare function getActionCompletion(systemContext: CommandHandlerContext, action: DeepPartialUndefined<AppAction>, propertyName: string): Promise<string[]>;
//# sourceMappingURL=actionTemplate.d.ts.map