import { SessionContext } from "@typeagent/agent-sdk";
import { HighspotActionContext } from "./agent/highspotConversationActionHandler.js";
export declare function parseAndExecuteQuery(query: string, tableName: string, context: SessionContext<HighspotActionContext>): Promise<string>;
export declare function callOpenAI(prompt: string, systemPrompt: string): Promise<string>;
//# sourceMappingURL=queryHandler.d.ts.map