import { ConstructionCreationConfig, GenericExplanationResult } from "../genericExplainer.js";
import { Explainer } from "../explainer.js";
import { SubPhraseExplanation } from "./subPhraseExplanationSchemaV5.js";
import { AlternativesExplanation } from "./alternativesExplanationSchemaV5.js";
import { PropertyExplanation } from "./propertyExplanationSchemaV5WithContext.js";
import { RequestAction } from "../requestAction.js";
import { Construction } from "../../constructions/constructions.js";
import { PolitenessGeneralization } from "./politenessGeneralizationSchemaV5.js";
type Explanation = PropertyExplanation & SubPhraseExplanation & AlternativesExplanation & Partial<PolitenessGeneralization>;
export type ExplanationResult = GenericExplanationResult<Explanation>;
export declare const form = "The user request is a JSON object containing a request string and the translated action";
export declare function createExplainerV5(model?: string): Explainer<Explanation>;
export type ExplanationV5 = Explanation;
export declare function createConstructionV5(requestAction: RequestAction, explanation: Explanation, constructionCreationConfig: ConstructionCreationConfig): Construction;
export {};
//# sourceMappingURL=explanationV5.d.ts.map