import { Command } from "@oclif/core";
export default class TranslateCommand extends Command {
    static args: {
        request: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    static flags: {
        schema: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        multiple: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        model: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        jsonSchema: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        jsonSchemaFunction: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        jsonSchemaValidate: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        schemaOptimization: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        switchEmbedding: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        switchInline: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        switchSearch: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    static description: string;
    static example: string[];
    run(): Promise<void>;
}
//# sourceMappingURL=translate.d.ts.map