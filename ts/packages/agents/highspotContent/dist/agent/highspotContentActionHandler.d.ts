import { AppAgent } from "@typeagent/agent-sdk";
import { HighspotService } from "../service.js";
export declare function instantiate(): AppAgent;
export interface IClientContext {
    service: HighspotService | undefined;
}
export type HighspotActionContext = {
    highspot: HighspotService | undefined;
};
//# sourceMappingURL=highspotContentActionHandler.d.ts.map