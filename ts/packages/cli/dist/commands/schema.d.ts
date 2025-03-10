import { Command } from "@oclif/core";
export default class Schema extends Command {
    static description: string;
    static flags: {
        active: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        change: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        multiple: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        assistant: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        generated: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    static args: {
        translator: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
        actionName: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=schema.d.ts.map