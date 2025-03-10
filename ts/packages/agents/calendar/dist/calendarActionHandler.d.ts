import { CalendarClient, GraphEntity } from "graph-utils";
import { CalendarAction } from "./calendarActionsSchema.js";
import { AppAgent, ActionContext } from "@typeagent/agent-sdk";
import { CommandHandlerNoParams } from "@typeagent/agent-sdk/helpers/command";
export declare class CalendarClientLoginCommandHandler implements CommandHandlerNoParams {
    readonly description = "Log into MS Graph to access calendar";
    run(context: ActionContext<CalendarActionContext>): Promise<void>;
}
export declare class CalendarClientLogoutCommandHandler implements CommandHandlerNoParams {
    readonly description = "Log out of MS Graph to access calendar";
    run(context: ActionContext<CalendarActionContext>): Promise<void>;
}
export declare function instantiate(): AppAgent;
interface GraphEventRefIds {
    graphEventId: string;
    localEventId: string;
}
export type CalendarActionContext = {
    calendarClient: CalendarClient | undefined;
    graphEventIds: GraphEventRefIds[] | undefined;
    mapGraphEntity: Map<string, GraphEntity> | undefined;
};
export declare function handleCalendarAction(action: CalendarAction, calendarContext: CalendarActionContext): Promise<import("@typeagent/agent-sdk").ActionResultSuccess | import("@typeagent/agent-sdk").ActionResultError>;
export {};
//# sourceMappingURL=calendarActionHandler.d.ts.map