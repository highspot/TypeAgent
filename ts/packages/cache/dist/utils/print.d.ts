import { ProcessRequestActionResult } from "../cache/cache.js";
import { ImportConstructionResult } from "../index.js";
import { Transforms } from "../constructions/transforms.js";
import { ProcessExplanationResult } from "../cache/explainWorkQueue.js";
export declare function printProcessExplanationResult(result: ProcessExplanationResult, log?: (message?: string) => void): void;
export declare function printProcessRequestActionResult(result: ProcessRequestActionResult, log?: (message?: string) => void): void;
export declare function printImportConstructionResult(result: ImportConstructionResult, log?: (message?: string) => void): void;
export declare function printTransformNamespaces(transformNamespaces: Map<string, Transforms>, log: (message: string) => void, prefix?: string): void;
//# sourceMappingURL=print.d.ts.map