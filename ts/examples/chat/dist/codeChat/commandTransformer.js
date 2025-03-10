// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createJsonTranslator, } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
export function createCommandTransformer(model, handlers) {
    const transformer = {
        model,
        transform,
        dispatch,
        transformAndDispatch,
    };
    completeCommandTransformer(handlers, transformer);
    async function transform(command) {
        const promptPreamble = "If no value is given for a parameter, use the default from the comment, if present.";
        const result = await transformer.translator.translate(command, promptPreamble);
        if (result.success === false) {
            console.log("[Error:]", result.message);
            return undefined;
        }
        else {
            // console.log("[Success:]", JSON.stringify(result, null, 2));
            // TODO: Validate that result.data is a valid NamedArgs?
            return result.data;
        }
    }
    // Returns a string if an error occurred
    async function dispatch(namedArgs, io) {
        // io.writer.writeLine("[Transformed:] " + JSON.stringify(transformed));
        if (!namedArgs) {
            return "Sorry, I didn't get that (or the server is down)";
        }
        else if (namedArgs.name === "Unknown") {
            return "Sorry, I didn't get that";
        }
        else {
            const name = namedArgs.name;
            if (name in handlers) {
                if (!handlers[name].metadata) {
                    // Missing metadata: handler ignores arguments
                    const handler = handlers[name];
                    await handler([], io);
                }
                else if (typeof handlers[name].metadata === "string") {
                    // Metadata is a string: handler only takes a list of strings
                    const handler = handlers[name];
                    await handler(namedArgs.args, io);
                }
                else {
                    // Otherwise: handler takes a NamedArgs as well (best case)
                    const handler = handlers[name];
                    await handler(namedArgs, io);
                }
            }
            else {
                // Should never get this if the schema is correct
                return `Sorry, I don't know how to handle ${name}`;
            }
        }
    }
    // Returns a string if an error occurred
    async function transformAndDispatch(command, io) {
        const namedArgs = await transform(command);
        if (namedArgs) {
            return await dispatch(namedArgs, io);
        }
    }
    return transformer;
}
// Call this when the handlers' metadata is complete, before calling transform()
export function completeCommandTransformer(handlers, commandTransformer) {
    // Copy the handlers' metadata into the command transformer
    const cmdMetadata = {};
    for (const key in handlers) {
        if (!/^\w+/.test(key)) {
            continue;
        }
        const metadata = handlers[key].metadata;
        if (typeof metadata === "undefined") {
            cmdMetadata[key] = key;
        }
        else {
            cmdMetadata[key] = metadata;
        }
    }
    commandTransformer.metadata = cmdMetadata;
    // Construct a suitable TypeChat schema and add it
    let schemaText = "";
    for (const key in cmdMetadata) {
        schemaText += makeClassDef(key, cmdMetadata[key]);
    }
    schemaText += "export type Command = \n";
    for (const key in cmdMetadata) {
        schemaText += `  | ${key}\n`;
    }
    schemaText += "  | { name: 'Unknown', query: string }  // Fallback\n";
    schemaText += ";\n";
    commandTransformer.schemaText = schemaText;
    // console.log(schemaText);
    // Now construct the translator and add it
    const validator = createTypeScriptJsonValidator(commandTransformer.schemaText, "Command");
    const translator = createJsonTranslator(commandTransformer.model, validator);
    commandTransformer.translator = translator;
}
function makeClassDef(name, metadata) {
    if (typeof metadata === "string") {
        return (`// ${metadata}\n` +
            `export interface ${name} { name: '${name}'; args: string[]; }\n\n`);
    }
    let def = `// ${metadata.description}\n`;
    def += `export interface ${name} {\n`;
    def += "  name: '" + name + "';\n";
    // TODO: the same for args (currently not used by code chat)
    const options = metadata.options;
    for (const key in options) {
        const option = options[key];
        let tp = option.type
            ? String(option.type)
            : undefined;
        if (tp === "path") {
            tp = "string";
        }
        if (!tp) {
            tp = "string";
        }
        if (option.defaultValue === undefined) {
            def += `  ${key}: ${tp}`;
        }
        else {
            def += `  ${key}?: ${tp} | undefined`;
        }
        def += ";";
        if (option.description) {
            def += `  // ${option.description}`;
        }
        if (option.defaultValue !== undefined) {
            def += `  // default: ${JSON.stringify(option.defaultValue)}`;
        }
        def += "\n";
    }
    def += "}\n\n";
    return def;
}
//# sourceMappingURL=commandTransformer.js.map