import { ActionContext } from "../agentInterface.js";
import { MessageContent } from "../display.js";
type LogFn = (log: (message?: string) => void) => void;
export declare function displayInfo(message: MessageContent | LogFn, context: ActionContext<unknown>): Promise<void>;
export declare function displayStatus(message: MessageContent | LogFn, context: ActionContext<unknown>): Promise<void>;
export declare function displayWarn(message: MessageContent | LogFn, context: ActionContext<unknown>): Promise<void>;
export declare function displayError(message: MessageContent | LogFn, context: ActionContext<unknown>): Promise<void>;
export declare function displaySuccess(message: MessageContent | LogFn, context: ActionContext<unknown>): Promise<void>;
export declare function displayResult(message: MessageContent | LogFn, context: ActionContext<unknown>): Promise<void>;
export {};
//# sourceMappingURL=displayHelpers.d.ts.map