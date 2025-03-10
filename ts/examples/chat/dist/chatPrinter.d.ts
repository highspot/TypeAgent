import { InteractiveIo } from "interactive-app";
import { Result } from "typechat";
import { ChalkWriter } from "./chalkWriter.js";
import { openai } from "aiclient";
import { IndexingStats } from "knowledge-processor";
export declare class ChatPrinter extends ChalkWriter {
    constructor(io?: InteractiveIo | undefined);
    writeTranslation<T>(result: Result<T>): this;
    writeTitle(title: string | undefined): this;
    writeLog(value: string): this;
    writeCompletionStats(stats: openai.CompletionUsageStats): this;
    writeIndexingStats(stats: IndexingStats): this;
    writeProgress(curCount: number, total: number, label?: string | undefined): this;
}
//# sourceMappingURL=chatPrinter.d.ts.map