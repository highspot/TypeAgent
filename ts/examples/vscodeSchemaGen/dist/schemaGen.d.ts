import { ChatModel, ChatModelWithStreaming, EmbeddingModel } from "aiclient";
export declare function createVSCODESchemaGen(model: ChatModelWithStreaming, jsonSchema: any): Promise<void>;
export declare function generateEmbeddingForActionsRequests(model: EmbeddingModel<string>, actionRequests: string[]): Promise<any>;
export declare function genEmbeddingDataFromActionSchema(model: ChatModel, jsonFilePath: string, schemaFilePath: string, actionPrefix: string | undefined, output_dir: string, maxNodestoProcess?: number): Promise<void>;
export declare function processVscodeCommandsJsonFile(model: ChatModel, jsonFilePath: string, schemaFilePath: string, actionPrefix: string | undefined, output_dir: string, maxNodestoProcess?: number, verbose?: boolean): Promise<void>;
//# sourceMappingURL=schemaGen.d.ts.map