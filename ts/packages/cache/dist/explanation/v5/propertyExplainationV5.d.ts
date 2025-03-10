import { TypeChatAgent } from "../typeChatAgent.js";
import { PropertyExplanation, ImplicitProperty, Property, EntityProperty } from "./propertyExplanationSchemaV5WithContext.js";
import { RequestAction } from "../requestAction.js";
import { ExplainerConfig } from "../genericExplainer.js";
export type PropertyExplainer = TypeChatAgent<RequestAction, PropertyExplanation, ExplainerConfig>;
export declare function createPropertyExplainer(enableContext: boolean, model?: string): TypeChatAgent<RequestAction, PropertyExplanation, ExplainerConfig>;
export declare function isImplicitParameter(parameter: Property | ImplicitProperty | EntityProperty): parameter is ImplicitProperty;
export declare function isEntityParameter(parameter: Property | ImplicitProperty | EntityProperty): parameter is EntityProperty;
//# sourceMappingURL=propertyExplainationV5.d.ts.map