import { RequestAction } from "./requestAction.js";
import { GenericExplanationResult, ConstructionFactory, ConstructionCreationConfig, ExplainerConfig } from "./genericExplainer.js";
import { GenericTypeChatAgent, ValidationError } from "./typeChatAgent.js";
export declare function getExactStringRequirementMessage(subphraseText?: boolean): string;
export declare function getSubphraseExplanationInstruction(): string;
export declare function getActionDescription(requestAction: RequestAction): string;
export declare class Explainer<T extends object> {
    private readonly agent;
    readonly createConstruction?: ConstructionFactory<T> | undefined;
    readonly toPrettyString?: ((explanation: T) => string) | undefined;
    readonly augmentExplanation?: ((explanation: T, requestAction: RequestAction, constructionCreationConfig: ConstructionCreationConfig) => Promise<void>) | undefined;
    constructor(agent: GenericTypeChatAgent<RequestAction, T, ExplainerConfig>, createConstruction?: ConstructionFactory<T> | undefined, toPrettyString?: ((explanation: T) => string) | undefined, augmentExplanation?: ((explanation: T, requestAction: RequestAction, constructionCreationConfig: ConstructionCreationConfig) => Promise<void>) | undefined);
    validate(requestAction: RequestAction, explanation: T, config?: ExplainerConfig): ValidationError | undefined;
    generate(requestAction: RequestAction, config?: ExplainerConfig): Promise<GenericExplanationResult<T>>;
    correct(requestAction: RequestAction, explanation: T, correction: ValidationError): Promise<import("./typeChatAgent.js").TypeChatAgentResult<T>>;
}
//# sourceMappingURL=explainer.d.ts.map