import { InteractiveIo } from "interactive-app";
import { TextBlock } from "knowledge-processor";
import { dateTime, WorkQueue } from "typeagent";
import { ChatMemoryPrinter } from "./chatMemoryPrinter.js";
export declare function timestampBlocks(blocks: Iterable<TextBlock>, startDate: Date, minMsOffset: number, maxMsOffset: number): IterableIterator<dateTime.Timestamped<TextBlock>>;
export declare function convertMsgFiles(sourcePath: string, io: InteractiveIo): Promise<void>;
export declare function runImportQueue(queue: WorkQueue, statsFilePath: string, clean: boolean, maxItems: number, pauseMs: number, printer: ChatMemoryPrinter, itemProcessor: (filePath: string, index: number, total: number) => Promise<number>): Promise<void>;
//# sourceMappingURL=importer.d.ts.map