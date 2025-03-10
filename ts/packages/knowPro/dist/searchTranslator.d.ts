import { TypeChatJsonTranslator, TypeChatLanguageModel } from "typechat";
import { SearchFilter } from "./searchSchema.js";
import { SearchTermGroup, WhenFilter } from "./search.js";
export declare function createSearchTranslator(model: TypeChatLanguageModel): TypeChatJsonTranslator<SearchFilter>;
export declare function createSearchGroupFromSearchFilter(filter: SearchFilter): SearchTermGroup;
export declare function createWhenFromSearchFilter(filter: SearchFilter): WhenFilter;
//# sourceMappingURL=searchTranslator.d.ts.map