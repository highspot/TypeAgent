// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as sc from "./creator.js";
export function wrapTypeWithJsonSchema(type) {
    // The root of a Json schema is always an object
    // place the root type definition with an object with a response field of the type.
    return sc.type(type.name, sc.obj({ response: type.type }), undefined, true);
}
function fieldComments(field) {
    const combined = [
        ...(field.comments ?? []),
        ...(field.trailingComments ?? []),
    ];
    return combined.length > 0 ? combined.join("\n").trim() : undefined;
}
function generateJsonSchemaType(type, pending, strict) {
    switch (type.type) {
        case "object":
            return {
                type: "object",
                properties: Object.fromEntries(Object.entries(type.fields).map(([key, field]) => {
                    const fieldType = generateJsonSchemaType(field.type, pending, strict);
                    const comments = fieldComments(field);
                    // BUG: missing comment on fields with type references.
                    // See Issue https://github.com/OAI/OpenAPI-Specification/issues/1514
                    if (field.type.type !== "type-reference") {
                        if (comments) {
                            fieldType.description = comments;
                        }
                    }
                    return [key, fieldType];
                })),
                required: Object.keys(type.fields),
                additionalProperties: false,
            };
        case "array":
            return {
                type: "array",
                items: generateJsonSchemaType(type.elementType, pending, strict),
            };
        case "string-union":
            return {
                type: "string",
                enum: type.typeEnum,
            };
        case "type-union":
            return {
                anyOf: type.types.map((t) => generateJsonSchemaType(t, pending, strict)),
            };
        case "type-reference":
            if (type.definition) {
                pending.push(type.definition);
            }
            else if (strict) {
                throw new Error(`Unresolved type reference: ${type.name}`);
            }
            return {
                $ref: `#/$defs/${type.name}`,
            };
        case "undefined": {
            // Note: undefined is presented by null in JSON schema
            return { type: "null" };
        }
        default:
            return { type: type.type };
    }
}
function generateJsonSchemaTypeWithDefs(type, strict = true) {
    const pending = [];
    const schema = generateJsonSchemaType(type, pending, strict);
    if (pending.length !== 0) {
        const $defs = {};
        do {
            const definition = pending.shift();
            if ($defs[definition.name]) {
                continue;
            }
            $defs[definition.name] = generateJsonSchemaType(definition.type, pending, strict);
            if (definition.comments) {
                $defs[definition.name].description =
                    definition.comments.join("\n");
            }
        } while (pending.length > 0);
        schema.$defs = $defs;
    }
    return schema;
}
function generateJsonSchemaTypeDefinition(def, strict = true) {
    const root = {
        name: def.name,
        strict: true,
        schema: generateJsonSchemaTypeWithDefs(def.type, strict),
    };
    if (def.comments) {
        root.schema.description = def.comments.join("\n");
    }
    return root;
}
export function generateActionJsonSchema(actionSchemaGroup) {
    const type = wrapTypeWithJsonSchema(actionSchemaGroup.entry);
    return generateJsonSchemaTypeDefinition(type);
}
export function generateActionActionFunctionJsonSchemas(actionSchemaGroup, strict = true) {
    const entry = actionSchemaGroup.entry;
    const definitions = [entry];
    const tools = [];
    while (definitions.length !== 0) {
        const def = definitions.shift();
        switch (def.type.type) {
            case "object":
                const tool = {
                    type: "function",
                    function: {
                        name: def.type.fields.actionName.type.typeEnum[0],
                        strict: true,
                    },
                };
                const parameters = def.type.fields.parameters;
                if (parameters !== undefined) {
                    tool.function.parameters = generateJsonSchemaTypeWithDefs(parameters.type, strict);
                    const comments = fieldComments(parameters);
                    if (comments) {
                        tool.function.description = comments;
                    }
                }
                else {
                    tool.function.parameters = {
                        type: "object",
                        properties: {},
                        required: [],
                        additionalProperties: false,
                    };
                }
                tools.push(tool);
                break;
            case "type-union":
                for (const type of def.type.types) {
                    if (type.definition === undefined) {
                        if (strict && type.definition === undefined) {
                            throw new Error(`Unresolved type reference: ${type.name}`);
                        }
                        continue;
                    }
                    definitions.push(type.definition);
                }
                break;
            case "type-reference":
                if (def.type.definition) {
                    definitions.push(def.type.definition);
                }
                else if (strict) {
                    throw new Error(`Unresolved type reference: ${def.type.name}`);
                }
                break;
        }
    }
    return tools;
}
//# sourceMappingURL=jsonSchemaGenerator.js.map