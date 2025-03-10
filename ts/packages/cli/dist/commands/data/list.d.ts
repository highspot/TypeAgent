import { Command } from "@oclif/core";
export default class ExplanationDataListCommand extends Command {
    static args: {
        file: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, {
            exists?: boolean | undefined;
        }>;
    };
    static description: string;
    run(): Promise<void>;
}
//# sourceMappingURL=list.d.ts.map