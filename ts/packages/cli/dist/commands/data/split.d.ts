import { Command } from "@oclif/core";
export default class ExplanationDataSplitCommmand extends Command {
    static strict: boolean;
    static args: {
        files: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        limit: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=split.d.ts.map