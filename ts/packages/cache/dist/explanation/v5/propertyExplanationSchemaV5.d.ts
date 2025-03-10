export type PropertyValuetype = string | number | boolean;
export interface ImplicitProperty {
    name: string;
    value: PropertyValuetype;
    isImplicit: true;
}
export interface Property {
    name: string;
    value: PropertyValuetype;
    substrings: string[];
}
export interface PropertyExplanation {
    properties: (Property | ImplicitProperty)[];
}
//# sourceMappingURL=propertyExplanationSchemaV5.d.ts.map