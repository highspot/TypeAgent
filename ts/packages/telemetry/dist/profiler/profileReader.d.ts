type ProfileCommonEntry = {
    type: "mark" | "start" | "stop";
    measureId: number;
    timestamp: number;
    data: unknown;
};
type ProfileMarkEntry = ProfileCommonEntry & {
    type: "mark";
    name: string;
};
type ProfileStartEntry = ProfileCommonEntry & {
    type: "start";
    name: string;
    parentId: number | undefined;
};
type ProfileStopEntry = ProfileCommonEntry & {
    type: "stop";
};
export type ProfileEntry = ProfileMarkEntry | ProfileStartEntry | ProfileStopEntry;
export type UnreadProfileEntries = {
    id: number;
    entries: ProfileEntry[];
};
export type ProfileMeasure = {
    name: string;
    start: number;
    startData: unknown;
    endData?: unknown;
    duration?: number;
    marks: ProfileMark[];
    measures: ProfileMeasure[];
};
export type ProfileMark = {
    name: string;
    data: unknown;
    timestamp: number;
    duration: number;
};
export declare class ProfileReader {
    private readId;
    private readonly rootMeasures;
    private readonly pendingEntries;
    private readonly measuresById;
    private readonly measuresByName;
    constructor();
    addEntries(entries: UnreadProfileEntries): void;
    getMeasures(name: string, filter?: unknown | ((data: unknown) => boolean)): ProfileMeasure[] | undefined;
    private processEntries;
    private processStart;
    private processMark;
    private processStop;
}
export {};
//# sourceMappingURL=profileReader.d.ts.map