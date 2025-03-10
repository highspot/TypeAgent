import { RequestAction } from "../requestAction.js";
import { TypeChatAgent } from "../typeChatAgent.js";
import { AlternativesExplanation } from "./alternativesExplanationSchemaV5.js";
import { PropertyExplanation } from "./propertyExplanationSchemaV5WithContext.js";
import { SubPhraseExplanation } from "./subPhraseExplanationSchemaV5.js";
import { ExplainerConfig } from "../genericExplainer.js";
type AlternativeExplainerInput = [
    RequestAction,
    PropertyExplanation,
    SubPhraseExplanation
];
export type AlternativesExplainer = TypeChatAgent<AlternativeExplainerInput, AlternativesExplanation, ExplainerConfig>;
export declare function createAlternativesExplainer(model?: string): AlternativesExplainer;
export declare function validateAlternativesExplanationV5([requestAction, propertyExplanation, subPhraseExplanation,]: AlternativeExplainerInput, alternativeExplanation: AlternativesExplanation): string[] | undefined;
export {};
//# sourceMappingURL=alternativesExplanationV5.d.ts.map