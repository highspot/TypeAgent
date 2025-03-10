import { Command } from "@oclif/core";
export default class Interactive extends Command {
    static description: string;
    static flags: {
        agent: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        explainer: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        model: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        debug: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        memory: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        exit: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    static args: {
        input: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, {
            exists?: boolean | undefined;
        }>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=interactive.d.ts.map