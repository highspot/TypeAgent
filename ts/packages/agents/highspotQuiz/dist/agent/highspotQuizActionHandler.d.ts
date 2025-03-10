import { AppAgent } from "@typeagent/agent-sdk";
import { HighspotService } from "../service.js";
import { HighspotQuiz } from "../quiz.js";
export declare function instantiate(): AppAgent;
export interface IClientContext {
    service: HighspotService | undefined;
}
export type HighspotActionContext = {
    highspot: HighspotService | undefined;
    quizes: HighspotQuiz[];
};
//# sourceMappingURL=highspotQuizActionHandler.d.ts.map