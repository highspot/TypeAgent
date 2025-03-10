import { CommandHandler, CommandMetadata, InteractiveIo, NamedArgs } from "interactive-app";
import { TypeChatLanguageModel, TypeChatJsonTranslator } from "typechat";
export interface CommandTransformer {
    model: TypeChatLanguageModel;
    metadata?: Record<string, string | CommandMetadata>;
    schemaText?: string;
    translator?: TypeChatJsonTranslator<NamedArgs>;
    transform(command: string): Promise<NamedArgs | undefined>;
    dispatch(namedArgs: NamedArgs, io: InteractiveIo): Promise<string | void>;
    transformAndDispatch(command: string, io: InteractiveIo): Promise<string | undefined>;
}
export declare function createCommandTransformer(model: TypeChatLanguageModel, handlers: Record<string, CommandHandler>): CommandTransformer;
export declare function completeCommandTransformer(handlers: Record<string, CommandHandler>, commandTransformer: CommandTransformer): void;
//# sourceMappingURL=commandTransformer.d.ts.map