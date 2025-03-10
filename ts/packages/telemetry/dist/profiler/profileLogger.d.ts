import { UnreadProfileEntries } from "./profileReader.js";
import { Profiler } from "./profiler.js";
export type ProfileLogger = {
    measure(name: string, start?: boolean, data?: unknown): Profiler;
    getUnreadEntries(): UnreadProfileEntries | undefined;
};
export declare function createProfileLogger(): ProfileLogger;
//# sourceMappingURL=profileLogger.d.ts.map