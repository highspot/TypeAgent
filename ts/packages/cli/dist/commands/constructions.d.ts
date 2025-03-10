import { Command } from "@oclif/core";
export default class ConstructionsCommand extends Command {
    static description: string;
    static args: {
        input: import("@oclif/core/lib/interfaces/parser.js").Arg<string, {
            exists?: boolean | undefined;
        }>;
        output: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, {
            exists?: boolean | undefined;
        }>;
    };
    static flags: {
        overwrite: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=constructions.d.ts.map