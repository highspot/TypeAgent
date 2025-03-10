export type PropertyValueType = string | number | boolean;
export interface PropertyValue {
    propertyName: string;
    propertyValue: PropertyValueType;
    propertySubPhrases: string[];
    alternatives: PropertyAlternatives[];
}
export interface PropertyAlternatives {
    propertyValue: PropertyValueType;
    propertySubPhrases: string[];
}
export interface AlternativesExplanation {
    propertyAlternatives: PropertyValue[];
}
//# sourceMappingURL=alternativesExplanationSchemaV5.d.ts.map