export type Quantity = {
    amount: number;
    units: string;
};
export type Value = string | number | boolean | Quantity;
export type Facet = {
    name: string;
    value: Value;
};
export type ConcreteEntity = {
    name: string;
    type: string[];
    facets?: Facet[];
};
export type ActionParam = {
    name: string;
    value: Value;
};
export type VerbTense = "past" | "present" | "future";
export type Action = {
    verbs: string[];
    verbTense: VerbTense;
    subjectEntityName: string | "none";
    objectEntityName: string | "none";
    indirectObjectEntityName: string | "none";
    params?: (string | ActionParam)[];
    subjectEntityFacet?: Facet | undefined;
};
export type KnowledgeResponse = {
    entities: ConcreteEntity[];
    actions: Action[];
    inverseActions: Action[];
    topics: string[];
};
//# sourceMappingURL=knowledgeSchema.d.ts.map