import * as iapp from "interactive-app";
import { ChunkyIndex } from "./chunkyIndex.js";
export declare function interactiveQueryLoop(chunkyIndex: ChunkyIndex, verbose?: boolean): Promise<void>;
export declare function purgeNormalizedFile(io: iapp.InteractiveIo | undefined, chunkyIndex: ChunkyIndex, fileName: string, verbose: boolean): Promise<void>;
export declare function wordWrap(text: string, wrapLength?: number): string;
export declare function testWordWrap(): void;
//# sourceMappingURL=queryInterface.d.ts.map