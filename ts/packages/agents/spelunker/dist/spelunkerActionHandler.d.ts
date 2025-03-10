import { AppAgent } from "@typeagent/agent-sdk";
import { QueryContext } from "./queryContext.js";
export declare function instantiate(): AppAgent;
export type SpelunkerContext = {
    focusFolders: string[];
    queryContext: QueryContext | undefined;
};
export declare function initializeSpelunkerContext(): Promise<SpelunkerContext>;
//# sourceMappingURL=spelunkerActionHandler.d.ts.map