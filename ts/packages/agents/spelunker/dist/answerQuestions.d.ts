import { ChatModel } from "aiclient";
import { TypeChatJsonTranslator } from "typechat";
import { ActionResult } from "@typeagent/agent-sdk";
import { AnswerSpecs } from "./makeAnswerSchema.js";
import { SelectorSpecs } from "./makeSelectorSchema.js";
import { SpelunkerContext } from "./spelunkerActionHandler.js";
export interface ModelContext {
    chatModel: ChatModel;
    answerMaker: TypeChatJsonTranslator<AnswerSpecs>;
    miniModel: ChatModel;
    chunkSelector: TypeChatJsonTranslator<SelectorSpecs>;
}
export declare function answerQuestion(context: SpelunkerContext, input: string): Promise<ActionResult>;
//# sourceMappingURL=answerQuestions.d.ts.map