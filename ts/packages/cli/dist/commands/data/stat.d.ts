import { Command } from "@oclif/core";
export default class ExplanationDataStatCommmand extends Command {
    static strict: boolean;
    static args: {
        files: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        schema: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        explainer: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        succeeded: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        failed: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        corrections: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        file: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        error: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        all: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        message: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=stat.d.ts.map