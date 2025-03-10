import { RequestAction } from "../requestAction.js";
import { PropertyExplanation } from "./propertyExplanationSchemaV5WithContext.js";
import { TypeChatAgent } from "../typeChatAgent.js";
import { PropertySubPhase, SubPhrase, SubPhraseExplanation } from "./subPhraseExplanationSchemaV5.js";
import { ExplainerConfig } from "../genericExplainer.js";
type SubPhraseExplainerInput = [RequestAction, PropertyExplanation];
export type SubPhraseExplainer = TypeChatAgent<SubPhraseExplainerInput, SubPhraseExplanation, ExplainerConfig>;
export declare function createSubPhraseExplainer(model?: string): TypeChatAgent<SubPhraseExplainerInput, SubPhraseExplanation, unknown>;
export declare function isPropertySubPhrase(phrase: SubPhrase): phrase is PropertySubPhase;
export declare function hasPropertyNames(phrase: SubPhrase): phrase is PropertySubPhase;
export {};
//# sourceMappingURL=subPhraseExplanationV5.d.ts.map