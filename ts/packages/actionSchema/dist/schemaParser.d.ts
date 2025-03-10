export declare enum NodeType {
    String = 0,
    Numeric = 1,
    Boolean = 2,
    Object = 3,
    Union = 4,
    Interface = 5,
    Array = 6,
    ObjectArray = 7,
    Property = 8,
    Literal = 9,
    TypeReference = 10,
    Keyword = 11
}
export interface ISymbol {
    name: string;
    value: string;
    type: NodeType;
    valueType: NodeType;
    optional?: boolean;
}
export declare class SymbolNode {
    readonly parent?: SymbolNode | undefined;
    leadingComments?: string[] | undefined;
    symbol: ISymbol;
    children: SymbolNode[];
    constructor(name: string, value: string, type?: NodeType, valueType?: NodeType, parent?: SymbolNode | undefined, leadingComments?: string[] | undefined);
}
export declare class SchemaParser {
    private nodeMap;
    private checker;
    private currentSchema;
    private currentSchemaNode;
    private traversalStack;
    constructor();
    loadSchema(fileName: string): void;
    private isNodeExported;
    private parseTypeElement;
    private parseTypeSymbol;
    private parseTypeNode;
    private isNodeOptional;
    private getValueType;
    private getType;
    private parserInterfaceMembers;
    private getCommentStrings;
    private parseAST;
    actionTypeNames(): string[];
    openActionNode(actionTypeName: string): SymbolNode | undefined;
    open(symbolName: string): void;
    symbols(): ISymbol[] | undefined;
    close(): void;
    reset(): void;
    typeStr(nodeType: NodeType): string;
    printNode(node: SymbolNode, indentation?: string): void;
    printTree(): void;
}
//# sourceMappingURL=schemaParser.d.ts.map