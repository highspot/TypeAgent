export declare class TypeAgentList {
    name: string;
    items: TypeAgentList[] | string[];
    constructor(name: string, items: TypeAgentList[] | string[]);
}
export declare class KnowledgeGraph {
    id: string;
    parents?: string[] | undefined;
    constructor(id: string, parents?: string[] | undefined);
}
export type KnowledgeHierarchy = {
    name: string;
    imports: string[];
};
export declare class VisualizationNotifier {
    private static instance;
    onListChanged: ((lists: TypeAgentList) => void) | null;
    onKnowledgeUpdated: ((knowledge: KnowledgeGraph[][]) => void) | null;
    onHierarchyUpdated: ((hierarchy: KnowledgeHierarchy[]) => void) | null;
    onWordsUpdated: ((words: string[]) => void) | null;
    private knowledgeFileDebounce;
    private listFileDebounce;
    private constructor();
    static getinstance: () => VisualizationNotifier;
    enumerateLists(): Promise<TypeAgentList>;
    enumerateKnowledge(): Promise<KnowledgeGraph[][]>;
    enumerateKnowledgeForHierarchy(): Promise<KnowledgeHierarchy[]>;
    enumerateKnowledgeForWordCloud(): Promise<string[]>;
}
//# sourceMappingURL=visualizationNotifier.d.ts.map