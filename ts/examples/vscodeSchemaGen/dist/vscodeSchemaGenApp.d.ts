import { ChatModel } from "aiclient";
export interface VSCodeSchemaGenApp {
    readonly model: ChatModel;
    run(): Promise<void>;
}
export declare function createVSCodeSchemaGenApp(): Promise<VSCodeSchemaGenApp>;
//# sourceMappingURL=vscodeSchemaGenApp.d.ts.map