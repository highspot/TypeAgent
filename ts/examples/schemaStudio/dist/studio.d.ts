import { ChatModel } from "aiclient";
import { CommandHandler } from "interactive-app";
export interface SchemaStudio {
    readonly model: ChatModel;
    commands: Record<string, CommandHandler>;
}
export declare function createStudio(): Promise<SchemaStudio>;
//# sourceMappingURL=studio.d.ts.map