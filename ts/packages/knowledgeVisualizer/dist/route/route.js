// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { VisualizationNotifier, } from "./visualizationNotifier.js";
export function setupMiddlewares(middlewares, devServer) {
    const app = devServer.app;
    let clients = [];
    VisualizationNotifier.getinstance().onListChanged = (lists) => {
        sendEvent("updateListVisualization", lists);
    };
    VisualizationNotifier.getinstance().onKnowledgeUpdated = (graph) => {
        sendEvent("updateKnowledgeVisualization", graph);
    };
    VisualizationNotifier.getinstance().onHierarchyUpdated = (hierarchy) => {
        sendEvent("updateKnowledgeHierarchyVisualization", hierarchy);
    };
    VisualizationNotifier.getinstance().onWordsUpdated = (words) => {
        sendEvent("updateWordCloud", words);
    };
    // SSE endpoint
    app.get("/events", (req, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        clients.push(res);
        req.on("close", () => {
            clients = clients.filter((client) => client !== res);
        });
    });
    // Get all data
    app.get("/initializeData", async (req, res) => {
        const visualizer = VisualizationNotifier.getinstance();
        const l = await visualizer.enumerateLists();
        if (visualizer.onListChanged != null) {
            visualizer.onListChanged(l);
        }
        const know = await visualizer.enumerateKnowledge();
        if (visualizer.onKnowledgeUpdated != null) {
            visualizer.onKnowledgeUpdated(know);
        }
        const h = await visualizer.enumerateKnowledgeForHierarchy();
        if (visualizer.onHierarchyUpdated != null) {
            visualizer.onHierarchyUpdated(h);
        }
        const w = await visualizer.enumerateKnowledgeForWordCloud();
        if (visualizer.onWordsUpdated != null) {
            visualizer.onWordsUpdated(w);
        }
    });
    // Send events to all clients
    function sendEvent(event, data) {
        clients.forEach((client) => {
            client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        });
    }
    return middlewares;
}
//# sourceMappingURL=route.js.map