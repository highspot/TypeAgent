// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ConsoleWriter, } from "interactive-app";
import chalk from "chalk";
export class ChalkWriter extends ConsoleWriter {
    constructor(io) {
        super(io.stdout);
        this._io = io;
        this._color = {};
    }
    get io() {
        return this._io;
    }
    getColor() {
        return { ...this._color };
    }
    setForeColor(color) {
        const prev = this._color.foreColor;
        this._color.foreColor = color;
        return prev;
    }
    setBackColor(color) {
        const prev = this._color.backColor;
        this._color.backColor = color;
        return prev;
    }
    setColor(color) {
        const prevColor = this._color;
        this._color = { ...color };
        return prevColor;
    }
    write(text, isStyled = false) {
        if (text) {
            if (!isStyled) {
                if (this._color.foreColor) {
                    text = this._color.foreColor(text);
                }
                if (this._color.backColor) {
                    text = this._color.backColor(text);
                }
            }
            super.write(text);
        }
        return this;
    }
    writeLine(text, isStyled = false) {
        this.write(text, isStyled);
        this.write("\n");
        return this;
    }
    log(text) {
        super.write(text);
        super.write("\n");
        return this;
    }
    writeLines(lines) {
        lines.forEach((l) => this.writeLine(l));
        return this;
    }
    writeBullet(line) {
        return this.writeLine("• " + line);
    }
    writeInColor(color, writable) {
        const prevColor = this.setForeColor(color);
        try {
            if (typeof writable === "string") {
                this.writeLine(writable);
            }
            else if (typeof writable === "number") {
                this.writeLine(writable.toString());
            }
            else {
                writable();
            }
        }
        finally {
            this.setForeColor(prevColor);
        }
    }
    writeHeading(text) {
        this.writeLine(chalk.underline(chalk.bold(text)));
        return this;
    }
    writeUnderline(text) {
        this.writeLine(chalk.underline(text));
        return this;
    }
    writeBold(text) {
        this.writeLine(chalk.bold(text));
        return this;
    }
    writeTiming(color, clock, label) {
        const timing = label
            ? `${label}: ${clock.elapsedString()}`
            : clock.elapsedString();
        this.writeInColor(color, timing);
    }
    writeError(message) {
        this.writeLine(chalk.redBright(message));
    }
    writeListInColor(color, list, options) {
        const prevColor = this.setForeColor(color);
        try {
            this.writeList(list, options);
        }
        finally {
            this.setForeColor(prevColor);
        }
    }
}
//# sourceMappingURL=chalkWriter.js.map