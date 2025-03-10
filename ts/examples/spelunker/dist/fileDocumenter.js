// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { loadSchema } from "typeagent";
import { createJsonTranslator } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
export function createFileDocumenter(model) {
    const fileDocTranslator = createFileDocTranslator(model);
    return {
        document,
    };
    async function document(chunks) {
        let text = "";
        for (const chunk of chunks) {
            text += `***: Docmument the following ${chunk.treeName}:\n`;
            for (const blob of chunk.blobs) {
                for (let i = 0; i < blob.lines.length; i++) {
                    text += `[${blob.start + i + 1}]: ${blob.lines[i]}\n`;
                }
            }
        }
        const request = "Document the given Python code, its purpose, and any relevant details.\n" +
            "The code has (non-contiguous) line numbers, e.g.: `[1]: def foo():`\n" +
            "There are also marker lines, e.g.: `***: Document the following FuncDef`\n" +
            "Write a concise paragraph for EACH marker.\n" +
            "For example, the comment could be:\n" +
            "```\n" +
            "Method C.foo finds the most twisted anagram for a word.\n" +
            "It uses various heuristics to rank a word's twistedness'.\n" +
            "```\n" +
            "Also fill in the lists of keywords, tags, synonyms, and dependencies.\n";
        const result = await fileDocTranslator.translate(request, text);
        // Now assign each comment to its chunk.
        if (result.success) {
            const fileDocs = result.data;
            // Assign each comment to its chunk.
            for (const chunkDoc of fileDocs.chunkDocs ?? []) {
                for (const chunk of chunks) {
                    for (const blob of chunk.blobs) {
                        // Reminder: blob.start is 0-based, comment.lineNumber is 1-based.
                        if (!blob.breadcrumb &&
                            blob.start < chunkDoc.lineNumber &&
                            chunkDoc.lineNumber <=
                                blob.start + blob.lines.length) {
                            const chunkDocs = chunk?.docs?.chunkDocs ?? [];
                            chunkDocs.push(chunkDoc);
                            chunk.docs = { chunkDocs };
                        }
                    }
                }
            }
            return fileDocs;
        }
        else {
            throw new Error(result.message);
        }
    }
}
function createFileDocTranslator(model) {
    const typeName = "FileDocumentation";
    const schema = loadSchema(["fileDocSchema.ts"], import.meta.url);
    const validator = createTypeScriptJsonValidator(schema, typeName);
    const translator = createJsonTranslator(model, validator);
    return translator;
}
//# sourceMappingURL=fileDocumenter.js.map