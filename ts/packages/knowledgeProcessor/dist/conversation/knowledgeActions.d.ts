import { PromptSection, Result, TypeChatLanguageModel } from "typechat";
import { SearchAction } from "./knowledgeSearchSchema.js";
import { dateTime } from "typeagent";
import { DateTime, DateTimeRange } from "./dateTimeSchema.js";
import { SearchTermsAction } from "./knowledgeTermSearchSchema.js";
import { SearchTermsActionV2 } from "./knowledgeTermSearchSchema2.js";
export interface KnowledgeActionTranslator {
    requestInstructions: string;
    translateSearch(userRequest: string, context?: PromptSection[]): Promise<Result<SearchAction>>;
    translateSearchTerms(userRequest: string, context?: PromptSection[]): Promise<Result<SearchTermsAction>>;
    translateSearchTermsV2(userRequest: string, context?: PromptSection[]): Promise<Result<SearchTermsActionV2>>;
}
export declare function createKnowledgeActionTranslator(model: TypeChatLanguageModel): KnowledgeActionTranslator;
export declare function toDateRange(range: DateTimeRange): dateTime.DateRange;
export declare function toStartDate(dateTime: DateTime): Date;
export declare function toStopDate(dateTime: DateTime | undefined): Date | undefined;
export declare function dateTimeToDate(dateTime: DateTime): Date;
export declare function dateToDateTime(dt: Date): DateTime;
export type FilterWithTagScope<TFilter = any> = {
    filter: TFilter;
    scopeType: "tags";
    tags: string[];
};
export declare function isFilterWithTagScope(obj: any): obj is FilterWithTagScope;
//# sourceMappingURL=knowledgeActions.d.ts.map