// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export class DisplayCommandHandler {
    constructor() {
        this.description = "Send text to display";
        this.parameters = {
            flags: {
                speak: {
                    description:
                        "Speak the display for the host that supports TTS",
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
        for (const content of args.text) {
            context.actionIO.appendDisplay(
                {
                    type: "text",
                    content,
                    speak: flags.speak,
                },
                "block",
            );
        }
    }
}
//# sourceMappingURL=displayCommandHandler.js.map
