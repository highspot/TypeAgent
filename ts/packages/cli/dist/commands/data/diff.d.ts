import { Command } from "@oclif/core";
export default class ExplanationDataDiffCommand extends Command {
    static args: {
        file: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
        diff: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    static description: string;
    static example: string[];
    run(): Promise<void>;
}
//# sourceMappingURL=diff.d.ts.map