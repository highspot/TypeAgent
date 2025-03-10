import { conversation as kpLib } from "knowledge-processor";
import { ScoredKnowledge, ScoredSemanticRef, SemanticRef } from "./interfaces.js";
export declare function facetValueToString(facet: kpLib.Facet): string;
export declare function mergeTopics(semanticRefs: SemanticRef[], semanticRefMatches: ScoredSemanticRef[], topK?: number): ScoredKnowledge[];
export declare function mergedEntities(semanticRefs: SemanticRef[], semanticRefMatches: ScoredSemanticRef[], topK?: number): ScoredKnowledge[];
//# sourceMappingURL=knowledge.d.ts.map