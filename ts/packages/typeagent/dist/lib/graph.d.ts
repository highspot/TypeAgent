/**
 * An in-memory Graph
 */
export interface Graph<TNode, TEdge, TNodeId> {
    size(): number;
    getNode(id: TNodeId): TNode | undefined;
    getNodeAndEdges(id: TNodeId): [TNode, GraphEdge<TEdge, TNodeId>[]] | undefined;
    putNode(node: TNode, id: TNodeId): void;
    removeNode(id: TNodeId): TNode | undefined;
    entries(): IterableIterator<[TNodeId, TNode]>;
    nodeIds(): IterableIterator<TNodeId>;
    nodes(): IterableIterator<TNode>;
    pushEdge(fromNodeId: TNodeId, toNodeId: TNodeId, value: TEdge, comparer?: (value: GraphEdge<TEdge, TNodeId>, toValue: GraphEdge<TEdge, TNodeId>) => boolean): void;
    getEdges(fromNodeId: TNodeId): GraphEdge<TEdge, TNodeId>[] | undefined;
    edges(): IterableIterator<[TNodeId, GraphEdge<TEdge, TNodeId>[]]>;
    findEdge(fromNodeId: TNodeId, predicate: (value: GraphEdge<TEdge, TNodeId>, index: number, obj: GraphEdge<TEdge, TNodeId>[]) => boolean): GraphEdge<TEdge, TNodeId> | undefined;
    indexOfEdge(fromNodeId: TNodeId, predicate: (value: GraphEdge<TEdge, TNodeId>, index: number, obj: GraphEdge<TEdge, TNodeId>[]) => boolean): number;
    removeEdgeAt(fromNodeId: TNodeId, pos: number): boolean;
    clearEdges(fromNodeId: TNodeId): void;
    snapshot(): GraphSnapshot<TNode, TEdge, TNodeId>;
}
export type GraphEdge<TEdge, TNodeId> = {
    toNodeId: TNodeId;
    value: TEdge;
};
export type GraphSnapshot<TNode, TEdge, TNodeId> = {
    nodes: [TNodeId, TNode][];
    edges: [TNodeId, GraphEdge<TEdge, TNodeId>[]][];
};
export declare function createGraph<TNode, TEdge, TNodeId = number>(loadFrom?: GraphSnapshot<TNode, TEdge, TNodeId>): Graph<TNode, TEdge, TNodeId>;
export declare function saveGraphToFile<TNode, TEdge, TNodeId = number>(graph: Graph<TNode, TEdge, TNodeId>, filePath: string): Promise<void>;
export declare function loadGraphFromFile<TNode, TEdge, TNodeId = number>(filePath: string): Promise<Graph<TNode, TEdge, TNodeId> | undefined>;
//# sourceMappingURL=graph.d.ts.map