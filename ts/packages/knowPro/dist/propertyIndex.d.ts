import { IConversation, ScoredSemanticRef, SemanticRef, SemanticRefIndex } from "./interfaces.js";
import { conversation as kpLib } from "knowledge-processor";
import { IPropertyToSemanticRefIndex } from "./interfaces.js";
import { TextRangesInScope } from "./collections.js";
export declare enum PropertyNames {
    EntityName = "name",
    EntityType = "type",
    FacetName = "facet.name",
    FacetValue = "facet.value",
    Verb = "verb",
    Subject = "subject",
    Object = "object",
    IndirectObject = "indirectObject",
    Tag = "tag"
}
export declare function addEntityPropertiesToIndex(entity: kpLib.ConcreteEntity, propertyIndex: IPropertyToSemanticRefIndex, semanticRefIndex: SemanticRefIndex): void;
export declare function addActionPropertiesToIndex(action: kpLib.Action, propertyIndex: IPropertyToSemanticRefIndex, semanticRefIndex: SemanticRefIndex): void;
export declare function buildPropertyIndex(conversation: IConversation): void;
export declare function addToPropertyIndex(propertyIndex: IPropertyToSemanticRefIndex, semanticRefs: SemanticRef[], baseSemanticRefIndex: SemanticRefIndex): void;
export declare class PropertyIndex implements IPropertyToSemanticRefIndex {
    private map;
    constructor();
    get size(): number;
    getValues(): string[];
    addProperty(propertyName: string, value: string, semanticRefIndex: SemanticRefIndex | ScoredSemanticRef): void;
    clear(): void;
    lookupProperty(propertyName: string, value: string): ScoredSemanticRef[] | undefined;
    /**
     * Do any pre-processing of the term.
     * @param termText
     */
    private prepareTermText;
    private toPropertyTermText;
    private termTextToNameValue;
}
export declare function lookupPropertyInPropertyIndex(propertyIndex: IPropertyToSemanticRefIndex, propertyName: string, propertyValue: string, semanticRefs: SemanticRef[], rangesInScope?: TextRangesInScope): ScoredSemanticRef[] | undefined;
//# sourceMappingURL=propertyIndex.d.ts.map