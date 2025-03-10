import { HistoryContext, JSONAction } from "./requestAction.js";
export type ExplanationDataEntry<T extends object = object> = {
    request: string;
    action: JSONAction | JSONAction[];
    history?: HistoryContext | undefined;
    explanation: T;
};
export type ExplanationData<T extends object = object> = {
    schemaNames: string[];
    sourceHashes: string[];
    explainerName: string;
    entries: ExplanationDataEntry<T>[];
    fileName: string | undefined;
};
//# sourceMappingURL=explanationData.d.ts.map