// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { NodeType, SchemaParser } from "action-schema";
export function loadActionSchema(filePathOrSchema, typeName) {
    let schema;
    if (typeof filePathOrSchema === "string") {
        schema = new SchemaParser();
        schema.loadSchema(filePathOrSchema);
    }
    else {
        schema = filePathOrSchema;
    }
    const node = schema.openActionNode(typeName);
    if (!node) {
        return;
    }
    let schemaText = getTypeSchema(schema, typeName, node.symbol.valueType);
    const refTypes = getReferencedTypes(node);
    if (refTypes) {
        let refTypesSchema = getSchemaForReferencedTypes(schema, refTypes);
        schemaText = appendBlock(schemaText, refTypesSchema);
    }
    return {
        typeName,
        schemaText,
    };
}
function getReferencedTypes(node, types) {
    if (node.children) {
        for (const child of node.children) {
            types = getReferencedTypes(child, types);
        }
    }
    if (node.symbol.type === NodeType.TypeReference &&
        node.symbol.valueType === NodeType.Object) {
        types ??= new Map();
        types.set(node.symbol.value, node.symbol.valueType);
    }
    return types;
}
function getNodeSchema(node) {
    let schemaText = node.leadingComments
        ? joinComments(node.leadingComments)
        : "";
    schemaText = appendBlock(schemaText, `export interface ${node.symbol.name}`);
    return appendBlock(schemaText, node.symbol.value);
}
function getSchemaForReferencedTypes(schema, types) {
    let schemaText = "";
    for (const typeName of types.keys()) {
        schemaText = appendBlock(schemaText, getTypeSchema(schema, typeName, types.get(typeName)));
    }
    return schemaText;
}
function getTypeSchema(schema, typeName, type) {
    const typeNode = schema.openActionNode(typeName);
    if (!typeNode) {
        return "";
    }
    return getNodeSchema(typeNode);
}
function joinComments(comments) {
    let comment = "/*\n";
    comment += comments.join("\n");
    comment += "\n*/";
    return comment;
}
function appendBlock(text, newBlock) {
    if (newBlock && newBlock.length > 0) {
        if (text.length > 0) {
            text += "\n";
        }
        text += newBlock;
    }
    return text;
}
//# sourceMappingURL=schema.js.map