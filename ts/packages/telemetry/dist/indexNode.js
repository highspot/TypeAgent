"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugLoggerSink = exports.createMongoDBLoggerSink = exports.MultiSinkLogger = exports.ChildLogger = void 0;
var logger_js_1 = require("./logger/logger.js");
Object.defineProperty(exports, "ChildLogger", { enumerable: true, get: function () { return logger_js_1.ChildLogger; } });
Object.defineProperty(exports, "MultiSinkLogger", { enumerable: true, get: function () { return logger_js_1.MultiSinkLogger; } });
var mongoLoggerSink_js_1 = require("./logger/mongoLoggerSink.js");
Object.defineProperty(exports, "createMongoDBLoggerSink", { enumerable: true, get: function () { return mongoLoggerSink_js_1.createMongoDBLoggerSink; } });
var debugLoggerSink_js_1 = require("./logger/debugLoggerSink.js");
Object.defineProperty(exports, "createDebugLoggerSink", { enumerable: true, get: function () { return debugLoggerSink_js_1.createDebugLoggerSink; } });
__exportStar(require("./stopWatch.js"), exports);
__exportStar(require("./profiler/profiler.js"), exports);
__exportStar(require("./profiler/profileLogger.js"), exports);
__exportStar(require("./profiler/profileReader.js"), exports);
//# sourceMappingURL=indexNode.js.map