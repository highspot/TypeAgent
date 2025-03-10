"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const indexNode_js_1 = require("../src/indexNode.js");
describe("Debug logger sink", () => {
    it("createDebugLoggerSink should succeed", () => {
        const sink = (0, indexNode_js_1.createDebugLoggerSink)();
        expect(sink).not.toBeNull();
    });
});
//# sourceMappingURL=debugLoggerSinkTest.spec.js.map