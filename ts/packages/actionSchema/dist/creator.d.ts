import { SchemaTypeAliasDefinition, SchemaTypeInterfaceDefinition, SchemaTypeArray, SchemaObjectField, SchemaTypeObject, SchemaTypeStringUnion, SchemaType, SchemaTypeReference, SchemaTypeDefinition, SchemaTypeNumber, SchemaTypeBoolean, SchemaTypeString, SchemaTypeUnion } from "./type.js";
export declare function string(): SchemaTypeString;
export declare function string(...union: (string | string[])[]): SchemaTypeStringUnion;
export declare function number(): SchemaTypeNumber;
export declare function boolean(): SchemaTypeBoolean;
export declare function array<T extends SchemaType>(elementType: T): SchemaTypeArray<T>;
export type FieldSpec = Record<string, SchemaObjectField | SchemaType>;
type CommentSpec = string | string[];
export declare function type<T extends SchemaType = SchemaType>(name: string, type: T, comments?: CommentSpec, exported?: boolean): SchemaTypeAliasDefinition<T>;
export declare function intf<T extends SchemaTypeObject = SchemaTypeObject>(name: string, type: T, comments?: CommentSpec, exported?: boolean): SchemaTypeInterfaceDefinition<T>;
export declare function field<T extends SchemaType = SchemaType>(type: T, comments?: CommentSpec): SchemaObjectField<T>;
export declare function optional<T extends SchemaType = SchemaType>(type: T, comments?: CommentSpec): SchemaObjectField<T>;
type SchemaObjectFieldTypeFromFieldSpec<T extends SchemaObjectField | SchemaType> = T extends SchemaType ? SchemaObjectField<T> : T;
type SchemaObjectFieldsFromSpec<T extends FieldSpec> = {
    [K in keyof T]: SchemaObjectFieldTypeFromFieldSpec<T[K]>;
};
type SchemaTypeObjectFromSpec<T extends FieldSpec> = SchemaTypeObject<SchemaObjectFieldsFromSpec<T>>;
export declare function obj<T extends FieldSpec>(f: T): SchemaTypeObjectFromSpec<T>;
export declare function ref<T extends SchemaTypeDefinition = SchemaTypeDefinition>(definition: string | T): SchemaTypeReference<T>;
export declare function union<T extends SchemaType>(...types: (T | T[])[]): SchemaTypeUnion<T>;
export declare function union(...types: (SchemaType | SchemaType[])[]): SchemaTypeUnion<SchemaType>;
export {};
//# sourceMappingURL=creator.d.ts.map