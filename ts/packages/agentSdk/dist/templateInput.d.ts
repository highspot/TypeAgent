export type TemplateFieldPrimitive = {
    type: "string" | "number" | "boolean";
};
export type TemplateFieldStringUnion = {
    type: "string-union";
    typeEnum: string[];
    discriminator?: string;
};
export type TemplateFieldScalar = TemplateFieldPrimitive | TemplateFieldStringUnion;
export type TemplateFieldArray = {
    type: "array";
    elementType: TemplateType;
};
export type TemplateFields = Record<string, TemplateField>;
export type TemplateFieldObject = {
    type: "object";
    fields: TemplateFields;
};
export type TemplateField = {
    optional?: boolean | undefined;
    type: TemplateType;
};
export type TemplateType = TemplateFieldScalar | TemplateFieldObject | TemplateFieldArray;
export type TemplateSchema = TemplateFieldObject;
//# sourceMappingURL=templateInput.d.ts.map