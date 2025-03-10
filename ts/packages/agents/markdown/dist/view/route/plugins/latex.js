// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// @ts-ignore
import markdownItTexmath from "markdown-it-texmath";
import katex from "katex";
export function LatexPlugin(md) {
    md.use(markdownItTexmath, {
        engine: katex,
        delimiters: ["dollars", "gitlab"],
        katexOptions: {
            macros: {
                "\\RR": "\\mathbb{R}",
            },
        },
    });
}
//# sourceMappingURL=latex.js.map