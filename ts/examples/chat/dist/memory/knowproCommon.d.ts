import * as knowLib from "knowledge-processor";
import * as kp from "knowpro";
export declare function textLocationToString(location: kp.TextLocation): string;
export declare function matchFilterToConversation(conversation: kp.IConversation, filter: knowLib.conversation.TermFilterV2, knowledgeType: kp.KnowledgeType | undefined, searchOptions: kp.SearchOptions, useAnd?: boolean): Promise<Map<kp.KnowledgeType, kp.SearchResult> | undefined>;
export declare function termFilterToSearchGroup(filter: knowLib.conversation.TermFilterV2, and: boolean): kp.SearchTermGroup;
export declare function termFilterToWhenFilter(filter: knowLib.conversation.TermFilterV2): kp.WhenFilter;
export declare function actionFilterToSearchGroup(action: knowLib.conversation.ActionTerm, and: boolean): kp.SearchTermGroup;
//# sourceMappingURL=knowproCommon.d.ts.map