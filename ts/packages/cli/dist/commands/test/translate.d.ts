import { Command } from "@oclif/core";
export default class TestTranslateCommand extends Command {
    static args: {
        files: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
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
        stream: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        concurrency: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        repeat: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        output: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        succeeded: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        failed: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        skipped: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        input: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        summarize: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        sample: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=translate.d.ts.map