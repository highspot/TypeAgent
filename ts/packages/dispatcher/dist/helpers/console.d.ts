/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { ClientIO } from "../context/interactiveIO.js";
import readline from "readline";
export declare function withConsoleClientIO(callback: (clientIO: ClientIO) => Promise<void>, rl?: readline.promises.Interface): Promise<void>;
/**
 * A request processor for interactive input or input from a text file. If an input file name is specified,
 * the callback function is invoked for each line in file. Otherwise, the callback function is invoked for
 * each line of interactive input until the user types "quit" or "exit".
 * @param interactivePrompt Prompt to present to user.
 * @param inputFileName Input text file name, if any.
 * @param processRequest Async callback function that is invoked for each interactive input or each line in text file.
 */
export declare function processCommands<T>(interactivePrompt: string | ((context: T) => string), processCommand: (request: string, context: T) => Promise<any>, context: T, inputs?: string[]): Promise<void>;
//# sourceMappingURL=console.d.ts.map