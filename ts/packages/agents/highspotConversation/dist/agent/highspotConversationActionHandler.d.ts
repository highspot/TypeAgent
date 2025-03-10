import { AppAgent } from "@typeagent/agent-sdk";
import { ISqliteDB } from "../sqliteHandler.js";
export type HighspotActionContext = {
    db: ISqliteDB | undefined;
};
export declare function instantiate(): AppAgent;
//# sourceMappingURL=highspotConversationActionHandler.d.ts.map