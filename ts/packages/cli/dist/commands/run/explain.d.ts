import { Command } from "@oclif/core";
export default class ExplainCommand extends Command {
    static args: {
        request: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        schema: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        explainer: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        repeat: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        concurrency: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        filter: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    static description: string;
    static example: string[];
    run(): Promise<void>;
}
//# sourceMappingURL=explain.d.ts.map