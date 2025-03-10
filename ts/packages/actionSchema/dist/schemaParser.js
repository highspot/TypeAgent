// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import ts from "typescript";
import registerDebug from "debug";
const debug = registerDebug("typeagent:schema:parser");
export var NodeType;
(function (NodeType) {
    NodeType[NodeType["String"] = 0] = "String";
    NodeType[NodeType["Numeric"] = 1] = "Numeric";
    NodeType[NodeType["Boolean"] = 2] = "Boolean";
    NodeType[NodeType["Object"] = 3] = "Object";
    NodeType[NodeType["Union"] = 4] = "Union";
    NodeType[NodeType["Interface"] = 5] = "Interface";
    NodeType[NodeType["Array"] = 6] = "Array";
    NodeType[NodeType["ObjectArray"] = 7] = "ObjectArray";
    NodeType[NodeType["Property"] = 8] = "Property";
    NodeType[NodeType["Literal"] = 9] = "Literal";
    NodeType[NodeType["TypeReference"] = 10] = "TypeReference";
    NodeType[NodeType["Keyword"] = 11] = "Keyword";
})(NodeType || (NodeType = {}));
export class SymbolNode {
    constructor(name, value, type = NodeType.Interface, valueType = NodeType.String, parent, leadingComments) {
        this.parent = parent;
        this.leadingComments = leadingComments;
        this.symbol = {
            name: name,
            value: value,
            type: type,
            valueType: valueType,
        };
        this.symbol.optional = false;
        this.children = [];
    }
}
export class SchemaParser {
    constructor() {
        // Create a map of nodes
        this.nodeMap = {};
        this.currentSchema = "";
        this.currentSchemaNode = undefined;
        this.traversalStack = []; // Stack for traversal
    }
    loadSchema(fileName) {
        let options = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
        };
        let program = ts.createProgram([fileName], options);
        this.checker = program.getTypeChecker();
        for (const sourceFile of program.getSourceFiles()) {
            if (!sourceFile.isDeclarationFile) {
                const fullText = sourceFile.getFullText();
                ts.forEachChild(sourceFile, (node) => {
                    this.parseAST(node, fullText);
                });
            }
        }
        return;
    }
    isNodeExported(node) {
        return ((ts.getCombinedModifierFlags(node) &
            ts.ModifierFlags.Export) !==
            0 ||
            (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile));
    }
    parseTypeElement(nodeName, element, indentation = "", parSymNode) {
        if (ts.isPropertySignature(element) && element.type) {
            debug(`${indentation}Property: ${element.name.getText()}`);
            this.parseTypeNode(element.name.getText(), element.type, undefined, indentation + "\t", parSymNode);
        }
    }
    parseTypeSymbol(nodeName, element, indentation = "", parSymNode) {
        if (element.valueDeclaration &&
            ts.isPropertySignature(element.valueDeclaration)) {
            debug(`${indentation}Property: ${nodeName}`);
            // Get the type of the value declaration
            const symtype = this.checker?.getTypeAtLocation(element.valueDeclaration);
            if (symtype) {
                const typeNode = this.checker?.typeToTypeNode(symtype, undefined, undefined);
                if (typeNode)
                    this.parseTypeNode(element.getName(), typeNode, element.valueDeclaration, indentation + "\t", parSymNode);
            }
        }
    }
    parseTypeNode(nodeName, node, nodeDecl, indentation = "", symNode) {
        if (ts.isTypeLiteralNode(node)) {
            let typeLiteralNode = new SymbolNode(nodeName, node.getText(), NodeType.Object, NodeType.Object, symNode);
            typeLiteralNode.symbol.optional = this.isNodeOptional(node);
            symNode?.children.push(typeLiteralNode);
            let typeLiteralMembers = node.members;
            typeLiteralMembers.forEach((typeLiteralMember) => {
                this.parseTypeElement(typeLiteralMember.name?.getText(), typeLiteralMember, indentation + "\t", typeLiteralNode);
            });
            return typeLiteralNode;
        }
        else if (node.kind === ts.SyntaxKind.TypeReference && symNode) {
            // Note: Only handling type references at the interface level for now.
            let typeReferenceNode = undefined;
            if (ts.isTypeReferenceNode(node) &&
                node.typeName &&
                node.typeName.kind === ts.SyntaxKind.Identifier) {
                typeReferenceNode = new SymbolNode(nodeName, node.typeName.escapedText.toString(), NodeType.TypeReference, NodeType.Object, symNode);
                typeReferenceNode.symbol.optional =
                    nodeDecl && ts.isPropertySignature(nodeDecl)
                        ? nodeDecl.questionToken !== undefined
                        : false;
            }
            else {
                typeReferenceNode = new SymbolNode(nodeName, node.getText(), NodeType.TypeReference, NodeType.Object, symNode);
                typeReferenceNode.symbol.optional = this.isNodeOptional(node);
            }
            symNode?.children.push(typeReferenceNode);
            if (node.pos >= 0) {
                let typeArguments = node.getChildAt(0);
                const identifierType = this.checker?.getTypeAtLocation(typeArguments);
                const typeSymbols = identifierType?.symbol;
                if (typeSymbols) {
                    let typeRefMembers = typeSymbols.members;
                    typeRefMembers?.forEach((typeRefMember) => {
                        this.parseTypeSymbol(typeRefMember.escapedName.toString(), typeRefMember, indentation + "\t", typeReferenceNode);
                    });
                }
            }
            else {
                if (nodeDecl &&
                    ts.isTypeReferenceNode(node) &&
                    ts.isIdentifier(node.typeName)) {
                    let typeArguments = nodeDecl.getChildAt(0);
                    const identifierType = this.checker?.getTypeAtLocation(typeArguments);
                    const typeSymbols = identifierType?.symbol;
                    if (typeSymbols) {
                        let typeRefMembers = typeSymbols.members;
                        typeRefMembers?.forEach((typeRefMember) => {
                            this.parseTypeSymbol(typeRefMember.escapedName.toString(), typeRefMember, indentation + "\t", typeReferenceNode);
                        });
                    }
                }
            }
            return typeReferenceNode;
        }
        else if (ts.isArrayTypeNode(node)) {
            if (ts.isTypeLiteralNode(node.elementType)) {
                let arrayNode = new SymbolNode(nodeName, node.getText(), NodeType.ObjectArray, NodeType.Object, symNode);
                arrayNode.symbol.optional = this.isNodeOptional(node);
                let typeLiteralMembers = node.elementType.members;
                typeLiteralMembers.forEach((typeLiteralMember) => {
                    this.parseTypeElement(typeLiteralMember.name?.getText(), typeLiteralMember, indentation + "\t", arrayNode);
                });
                symNode?.children.push(arrayNode);
                return arrayNode;
            }
            else {
                let arrayNode = new SymbolNode(nodeName, node.pos >= 0 ? node.getText() : nodeDecl?.getText() ?? "", NodeType.Array, NodeType.String, symNode);
                arrayNode.symbol.valueType = this.getValueType(node);
                if (nodeDecl && ts.isPropertySignature(nodeDecl)) {
                    arrayNode.symbol.optional =
                        nodeDecl.questionToken !== undefined;
                }
                else {
                    arrayNode.symbol.optional = this.isNodeOptional(node);
                }
                symNode?.children.push(arrayNode);
                return arrayNode;
            }
        }
        else if (ts.isUnionTypeNode(node)) {
            // TBD: Only handling union of strings for now.
            let values = node.types
                .map((type) => type.getText())
                .join(" | ");
            let unionNode = new SymbolNode(nodeName, values, NodeType.Union, NodeType.String, symNode);
            symNode?.children.push(unionNode);
            unionNode.symbol.optional = this.isNodeOptional(node);
            debug(`${indentation}\tUnionType: ${values}`);
            return unionNode;
        }
        else if (ts.isPropertySignature(node)) {
            debug(`${indentation}Property: ${nodeName}`);
            let literalNode = new SymbolNode(nodeName, node.type?.getText() ?? "", NodeType.Property, NodeType.String, symNode);
            literalNode.symbol.valueType = this.getValueType(node);
            literalNode.symbol.optional = this.isNodeOptional(node);
            symNode?.children.push(literalNode);
            return literalNode;
        }
        else if (ts.isLiteralTypeNode(node)) {
            debug(`${indentation}Literal: ${nodeName}`);
            let literalValue = node.literal;
            let literalNode = new SymbolNode(nodeName, literalValue.getText(), NodeType.Literal, NodeType.String, symNode);
            literalNode.symbol.valueType = this.getValueType(literalValue);
            literalNode.symbol.optional = this.isNodeOptional(node);
            symNode?.children.push(literalNode);
            return literalNode;
        }
        else if (node.kind === ts.SyntaxKind.StringKeyword ||
            node.kind === ts.SyntaxKind.NumberKeyword ||
            node.kind === ts.SyntaxKind.BooleanKeyword ||
            node.kind === ts.SyntaxKind.AnyKeyword ||
            node.kind === ts.SyntaxKind.UnknownKeyword ||
            node.kind === ts.SyntaxKind.ObjectKeyword) {
            let literalNode = undefined;
            if (nodeDecl) {
                literalNode = new SymbolNode(nodeName, nodeDecl.getFullText(), this.getType(node), NodeType.String, symNode);
                literalNode.symbol.valueType = this.getValueType(node);
                if (ts.isPropertySignature(nodeDecl)) {
                    literalNode.symbol.optional =
                        nodeDecl.questionToken !== undefined;
                }
            }
            else {
                literalNode = new SymbolNode(nodeName, node.getText(), this.getType(node), NodeType.String, symNode);
                literalNode.symbol.valueType = this.getValueType(node);
                literalNode.symbol.optional = this.isNodeOptional(node);
            }
            symNode?.children.push(literalNode);
            return literalNode;
        }
        return undefined;
    }
    isNodeOptional(node) {
        if (ts.isPropertySignature(node.parent)) {
            return node.parent.questionToken !== undefined;
        }
        return false;
    }
    getValueType(node) {
        if (node.kind === undefined) {
            return NodeType.String;
        }
        let type = NodeType.String;
        if (node.kind === ts.SyntaxKind.StringLiteral ||
            node.kind === ts.SyntaxKind.StringKeyword) {
            type = NodeType.String;
        }
        else if (node.kind === ts.SyntaxKind.NumericLiteral ||
            node.kind === ts.SyntaxKind.NumberKeyword) {
            type = NodeType.Numeric;
        }
        else if (node.kind === ts.SyntaxKind.TrueKeyword ||
            node.kind === ts.SyntaxKind.FalseKeyword ||
            node.kind === ts.SyntaxKind.BooleanKeyword) {
            type = NodeType.Boolean;
        }
        else if (node.kind === ts.SyntaxKind.ArrayType) {
            if (ts.isArrayTypeNode(node)) {
                type = this.getValueType(node.elementType);
            }
        }
        return type;
    }
    // base on node's parent return the type
    getType(node) {
        let type = NodeType.String;
        if (node.parent?.kind === ts.SyntaxKind.PropertySignature) {
            type = NodeType.Property;
        }
        else if (node.parent?.kind === ts.SyntaxKind.TypeLiteral) {
            type = NodeType.Object;
        }
        return type;
    }
    parserInterfaceMembers(member, symNode) {
        if (ts.isPropertySignature(member) && member.type) {
            if (member.name) {
                debug(`  Member:${member.name.getText()}`);
                this.parseTypeNode(member.name.getText(), member.type, undefined, "\t", symNode);
            }
        }
    }
    getCommentStrings(fullText, node) {
        const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
        return commentRanges?.map((r) => r.kind === ts.SyntaxKind.MultiLineCommentTrivia
            ? "" // Not supported
            : fullText.slice(r.pos + 2, r.end).trim());
    }
    parseAST(node, fullText) {
        if (!this.isNodeExported(node)) {
            return;
        }
        if (ts.isTypeAliasDeclaration(node) && node.name) {
            debug(`Type alias declaration:${node.name.text}`);
            let symbol = this.checker?.getSymbolAtLocation(node.name);
            if (symbol) {
                debug(`  Symbol:${symbol.name}`);
            }
            let type = this.checker?.getTypeAtLocation(node);
            if (type) {
                debug(`  Type:${this.checker?.typeToString(type)}`);
                const symNode = this.parseTypeNode(node.name.text, node.type, undefined, "\t", undefined);
                if (symNode) {
                    symNode.leadingComments = this.getCommentStrings(fullText, node);
                    this.nodeMap[node.name.text] = symNode;
                }
            }
            let unionTypes = node
                .getChildren()
                .filter((child) => ts.isUnionTypeNode(child));
            unionTypes.forEach((unionType) => {
                debug(`  UnionType:${unionType.getText()}`);
            });
            let interfaces = node
                .getChildren()
                .filter((child) => ts.isInterfaceDeclaration(child));
            interfaces.forEach((interfaceNode) => {
                debug(`  Interface:${interfaceNode.getText()}`);
            });
            let typeReferences = node
                .getChildren()
                .filter((child) => ts.isTypeReferenceNode(child));
            typeReferences.forEach((typeReference) => {
                debug(`  TypeReference:${typeReference.getText()}`);
            });
        }
        if (ts.isInterfaceDeclaration(node) && node.name) {
            debug(`Interface declaration:${node.name.text}`);
            let symNode = this.nodeMap[node.name.text];
            if (symNode === undefined) {
                symNode = new SymbolNode(node.name.text, node.getText(), NodeType.Interface, NodeType.Object, undefined, this.getCommentStrings(fullText, node));
                this.nodeMap[node.name.text] = symNode;
            }
            let members = node.members;
            members.forEach((member) => {
                this.parserInterfaceMembers(member, symNode);
            });
        }
    }
    actionTypeNames() {
        return Object.keys(this.nodeMap);
    }
    openActionNode(actionTypeName) {
        const key = Object.keys(this.nodeMap).find((key) => key.toLowerCase() === actionTypeName.toLowerCase());
        if (key) {
            this.currentSchema = key;
            this.currentSchemaNode = this.nodeMap[this.currentSchema];
        }
        return this.currentSchemaNode ? this.currentSchemaNode : undefined;
    }
    open(symbolName) {
        if (!this.currentSchemaNode) {
            this.currentSchemaNode = this.nodeMap[symbolName];
            this.traversalStack = [];
        }
        else {
            const childNode = this.currentSchemaNode.children.find((child) => child.symbol.name === symbolName);
            if (childNode) {
                this.traversalStack.push(this.currentSchemaNode);
                this.currentSchemaNode = childNode;
            }
            else {
                console.error(`Child node ${symbolName} not found`);
            }
        }
    }
    symbols() {
        if (!this.currentSchemaNode) {
            return undefined;
        }
        else {
            return this.currentSchemaNode.children.map((child) => child.symbol);
        }
    }
    close() {
        if (this.traversalStack.length > 0) {
            this.currentSchemaNode = this.traversalStack.pop() || undefined;
        }
        else {
            this.currentSchemaNode = undefined;
        }
    }
    reset() {
        this.currentSchemaNode = undefined;
        this.traversalStack = [];
    }
    typeStr(nodeType) {
        return NodeType[nodeType];
    }
    printNode(node, indentation = "") {
        node.children.forEach((child) => {
            console.log(`${indentation}\t ${child.symbol.name}, ${child.symbol.type}`);
            this.printNode(child, indentation + "\t");
        });
    }
    printTree() {
        const keys = Object.keys(this.nodeMap);
        keys.forEach((key) => {
            const node = this.nodeMap[key];
            console.log(`${node.symbol.name}, ${node.symbol.type}\n`);
            this.printNode(this.nodeMap[key], "");
        });
    }
}
//# sourceMappingURL=schemaParser.js.map