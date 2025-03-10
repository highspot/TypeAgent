import { ProfileMeasure } from "telemetry";
import { ProfileNames } from "./profileNames.js";
export type Timing = {
    duration: number;
    count: number;
};
export type PhaseTiming = {
    marks?: Record<string, Timing>;
    duration?: number | undefined;
};
export type RequestMetrics = {
    parse?: PhaseTiming | undefined;
    command?: PhaseTiming | undefined;
    actions: (PhaseTiming | undefined)[];
    duration?: number | undefined;
};
export declare class RequestMetricsManager {
    private readonly profileMap;
    beginCommand(requestId: string): import("telemetry").Profiler;
    private getReader;
    getMeasures(requestId: string, name: ProfileNames): ProfileMeasure[] | undefined;
    getMetrics(requestId: string): RequestMetrics | undefined;
    endCommand(requestId: string): RequestMetrics | undefined;
}
//# sourceMappingURL=metrics.d.ts.map