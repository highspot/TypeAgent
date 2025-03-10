import { RequestAction } from "../explanation/requestAction.js";
import { ExplainerFactory } from "./factory.js";
import { ConstructionCreationConfig, GenericExplanationResult } from "../explanation/genericExplainer.js";
export type ExplanationOptions = {
    concurrent?: boolean;
    valueInRequest?: boolean;
    noReferences?: boolean;
    checkExplainable?: ((requestAction: RequestAction) => Promise<void>) | undefined;
};
export type ProcessExplanationResult = {
    explanation: GenericExplanationResult;
    elapsedMs: number;
    toPrettyString?: ((explanation: object) => string) | undefined;
};
export declare class ExplainWorkQueue {
    readonly getExplainerForTranslator: ExplainerFactory;
    private queue;
    constructor(getExplainerForTranslator: ExplainerFactory);
    queueTask(requestAction: RequestAction, cache: boolean, options?: ExplanationOptions, constructionCreationConfig?: ConstructionCreationConfig, model?: string): Promise<ProcessExplanationResult>;
}
//# sourceMappingURL=explainWorkQueue.d.ts.map