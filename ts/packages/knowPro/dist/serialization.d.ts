import { IConversationDataWithIndexes } from "./secondaryIndexes.js";
export declare function writeConversationDataToFile(conversationData: IConversationDataWithIndexes, dirPath: string, baseFileName: string): Promise<void>;
export declare function readConversationDataFromFile(dirPath: string, baseFileName: string, embeddingSize: number | undefined): Promise<IConversationDataWithIndexes | undefined>;
//# sourceMappingURL=serialization.d.ts.map