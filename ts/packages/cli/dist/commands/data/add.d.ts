import { Command } from "@oclif/core";
export default class ExplanationDataAddCommand extends Command {
    static args: {
        request: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        input: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        output: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        batch: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        schema: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        explainer: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        overwrite: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        concurrency: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        model: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        updateHash: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    static description: string;
    static example: string[];
    run(): Promise<void>;
}
//# sourceMappingURL=add.d.ts.map