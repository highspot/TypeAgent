import { HistoryContext, ParamValueType } from "../explanation/requestAction.js";
type TransformEntityRecord = {
    entityTypes: string[];
};
type TransformValueRecordJSON = {
    value: ParamValueType;
    count: number;
    conflicts?: [ParamValueType, number][] | undefined;
};
type TransformRecordJSON = TransformEntityRecord | TransformValueRecordJSON;
export type TransformsJSON = {
    name: string;
    transform: [string, TransformRecordJSON][];
}[];
export declare class Transforms {
    private readonly transforms;
    add(paramName: string, text: string, value: ParamValueType, original: boolean): void;
    addEntity(paramName: string, text: string, entityTypes: string[]): void;
    private addTransformRecord;
    merge(transforms: Transforms, cacheConflicts?: boolean): void;
    get(paramName: string, text: string, history?: HistoryContext): ParamValueType | undefined;
    getConflicts(paramName: string, text: string): ParamValueType[] | undefined;
    toJSON(): TransformsJSON;
    static fromJSON(transformsJSON: TransformsJSON): Transforms;
    toString(prefix?: string): string;
}
export {};
//# sourceMappingURL=transforms.d.ts.map