import { TypeSchema, VariationType } from "typeagent";
import { TypeChatLanguageModel } from "typechat";
export declare function generateActionRequests(type: VariationType | string, model: TypeChatLanguageModel, actionSchema: TypeSchema, actionDescription: string | undefined, count: number, facets?: string, example?: string, language?: string): Promise<string[]>;
//# sourceMappingURL=actionGen.d.ts.map