export type PropertyValueType = string | number | boolean;
export interface ImplicitProperty {
    name: string;
    value: PropertyValueType;
    isImplicit: true;
}
export interface Property {
    name: string;
    value: PropertyValueType;
    substrings: string[];
}
export interface EntityProperty {
    name: string;
    value: PropertyValueType;
    substrings: string[];
    entityIndex: number;
}
export interface PropertyExplanation {
    properties: (Property | ImplicitProperty | EntityProperty)[];
}
//# sourceMappingURL=propertyExplanationSchemaV5WithContext.d.ts.map