import { Command } from "@oclif/core";
export default class ExplanationDataRegenerateCommand extends Command {
    static strict: boolean;
    static args: {
        files: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        batch: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        builtin: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        output: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        explainer: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        override: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        concurrency: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        model: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        explanation: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        succeeded: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        failed: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        resume: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        request: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        actionName: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        correction: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        error: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        validate: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        constructions: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        none: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        entities: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        updateHash: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    static description: string;
    static example: string[];
    run(): Promise<void>;
}
//# sourceMappingURL=regenerate.d.ts.map