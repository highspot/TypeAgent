import { Command } from "@oclif/core";
export default class RequestCommand extends Command {
    static args: {
        request: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
        attachment: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        schema: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        explainer: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        model: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    static description: string;
    static example: string[];
    run(): Promise<void>;
    loadAttachment(fileName: string | undefined): string[] | undefined;
}
//# sourceMappingURL=request.d.ts.map