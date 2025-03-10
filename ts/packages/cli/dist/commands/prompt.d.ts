import { Command } from "@oclif/core";
export default class Prompt extends Command {
    static description: string;
    static args: {
        request: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    static flags: {
        model: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        stream: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        json: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=prompt.d.ts.map