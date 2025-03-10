// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export class DisplayCommandHandler {
    constructor() {
        this.description = "Send text to display";
        this.parameters = {
            flags: {
                speak: {
                    description: "Speak the display for the host that supports TTS",
                    default: false,
                },
                type: {
                    description: "Display type",
                    default: "text",
                },
                inline: {
                    description: "Display inline",
                    default: false,
                },
            },
            args: {
                text: {
                    description: "text to display",
                    multiple: true,
                },
            },
        };
    }
    async run(context, params) {
        const { flags, args } = params;
        if (flags.type !== "text" &&
            flags.type !== "html" &&
            flags.type !== "markdown" &&
            flags.type !== "iframe") {
            throw new Error(`Invalid display type: ${flags.type}`);
        }
        for (const content of args.text) {
            context.actionIO.appendDisplay({
                type: flags.type,
                content,
                speak: flags.speak,
            }, flags.inline ? "inline" : "block");
        }
    }
}
//# sourceMappingURL=displayCommandHandler.js.map