export type IncrementalJsonValueCallBack = (prop: string, value: any, delta?: string) => void;
export declare function createIncrementalJsonParser(callback: IncrementalJsonValueCallBack, options?: {
    full?: boolean;
    partial?: boolean;
}): {
    callback: IncrementalJsonValueCallBack;
    parse: (chunk: string) => boolean;
    complete: () => boolean;
};
export type IncrementalJsonParser = ReturnType<typeof createIncrementalJsonParser>;
//# sourceMappingURL=incrementalJsonParser.d.ts.map