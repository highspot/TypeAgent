// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function parseCommandLine(line) {
    if (line.length == 0) {
        return undefined;
    }
    const args = line.split(/\s+/);
    if (args.length == 0) {
        return undefined;
    }
    const cmd = {
        name: args[0],
    };
    args.shift();
    cmd.args = args;
    return cmd;
}
//# sourceMappingURL=command.js.map