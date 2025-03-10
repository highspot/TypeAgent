import { RequestAction } from "../requestAction.js";
import { TypeChatAgent } from "../typeChatAgent.js";
import { ExplainerConfig } from "../genericExplainer.js";
import { PolitenessGeneralization } from "./politenessGeneralizationSchemaV5.js";
export type PolitenessGenerializer = TypeChatAgent<RequestAction, PolitenessGeneralization, ExplainerConfig>;
export declare function createPolitenessGeneralizer(model?: string): PolitenessGenerializer;
//# sourceMappingURL=politenessGeneralizationV5.d.ts.map