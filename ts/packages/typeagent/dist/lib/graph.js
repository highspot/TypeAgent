"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGraphFromFile = exports.saveGraphToFile = exports.createGraph = void 0;
const __1 = require("..");
const multimap_1 = require("./multimap");
function createGraph(loadFrom) {
    // node id -> node
    const graphNodes = new Map(loadFrom ? loadFrom.nodes : undefined);
    // node id -> GraphEdge[]
    const graphEdges = new multimap_1.MultiMap(loadFrom ? loadFrom.edges : undefined);
    return {
        size() {
            return graphNodes.size;
        },
        getNode,
        getNodeAndEdges,
        putNode,
        entries,
        nodeIds: () => graphNodes.keys(),
        nodes: () => graphNodes.values(),
        removeNode,
        pushEdge,
        getEdges,
        edges,
        findEdge,
        indexOfEdge,
        removeEdgeAt,
        clearEdges,
        snapshot,
    };
    function entries() {
        return graphNodes.entries();
    }
    function getNode(id) {
        return graphNodes.get(id);
    }
    function getNodeAndEdges(id) {
        const node = getNode(id);
        if (node) {
            return [node, getEdges(id) ?? []];
        }
        return undefined;
    }
    function putNode(node, id) {
        graphNodes.set(id, node);
    }
    function removeNode(id) {
        const entity = graphNodes.get(id);
        if (entity) {
            graphNodes.delete(id);
            graphEdges.delete(id);
            return entity;
        }
        return undefined;
    }
    function pushEdge(fromNodeId, toNodeId, value, comparer) {
        graphEdges.addUnique(fromNodeId, { toNodeId, value }, comparer);
    }
    function getEdges(fromNodeId) {
        return graphEdges.get(fromNodeId);
    }
    function edges() {
        return graphEdges.entries();
    }
    function findEdge(fromNodeId, predicate) {
        return graphEdges.find(fromNodeId, predicate);
    }
    function removeEdgeAt(fromNodeId, pos) {
        return graphEdges.removeAt(fromNodeId, pos);
    }
    function indexOfEdge(fromNodeId, predicate) {
        return graphEdges.indexOf(fromNodeId, predicate);
    }
    function clearEdges(fromNodeId) {
        graphEdges.delete(fromNodeId);
    }
    function snapshot() {
        return {
            nodes: [...entries()],
            edges: [...edges()],
        };
    }
}
exports.createGraph = createGraph;
function saveGraphToFile(graph, filePath) {
    return (0, __1.writeJsonFile)(filePath, graph.snapshot());
}
exports.saveGraphToFile = saveGraphToFile;
async function loadGraphFromFile(filePath) {
    const snapshot = await (0, __1.readJsonFile)(filePath);
    if (snapshot) {
        return createGraph(snapshot);
    }
    return undefined;
}
exports.loadGraphFromFile = loadGraphFromFile;
//# sourceMappingURL=graph.js.map