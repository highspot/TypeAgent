import { dateTime } from "typeagent";
import { CompositeEntity } from "./entities.js";
import { ActionGroup } from "./actions.js";
export type AnswerContextItem<T> = {
    timeRanges: (dateTime.DateRange | undefined)[];
    values: T[];
};
export type AnswerContext = {
    entities?: AnswerContextItem<CompositeEntity> | undefined;
    topics?: AnswerContextItem<string> | undefined;
    actions?: AnswerContextItem<ActionGroup> | undefined;
    messages?: dateTime.Timestamped<string>[] | undefined;
};
export declare function splitAnswerContext(context: AnswerContext, maxCharsPerChunk: number, splitMessages?: boolean): IterableIterator<AnswerContext>;
export declare function answerContextToString(context: AnswerContext): string;
//# sourceMappingURL=answerContext.d.ts.map