import * as iapp from "interactive-app";
import { ChunkyIndex } from "./chunkyIndex.js";
import { ChunkedFile } from "./pythonChunker.js";
export declare function importAllFiles(files: string[], chunkyIndex: ChunkyIndex, io: iapp.InteractiveIo | undefined, verbose: boolean): Promise<void>;
export declare function embedChunkedFile(chunkedFile: ChunkedFile, chunkyIndex: ChunkyIndex, io: iapp.InteractiveIo | undefined, verbose?: boolean): Promise<void>;
export declare function sanitizeKey(key: string): string;
//# sourceMappingURL=pythonImporter.d.ts.map