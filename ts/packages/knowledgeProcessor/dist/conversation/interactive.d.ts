import { ChatUserInterface } from "typeagent";
import { PromptSection, Result } from "typechat";
/**
 * Interact with a user to refine a value
 * Steps:
 *  - translate the user input + past history of user inputs into a value
 *  - evaluate the quality of the translated value. This might involve:
 *      - further transformations
 *      - actually running queries etc (if the translated object is a query for example)
 *  - If the evaluation says that further user input may be needed, return a followup message for the user
 * @param ux
 * @param initialUserInput
 * @param value
 * @param translate
 * @param evaluate
 * @param maxAttempts
 * @returns
 */
export declare function interactivelyProcessUserInput(ux: ChatUserInterface, initialUserInput: string, value: any | undefined, translate: (userInput: string, previousInput: PromptSection[]) => Promise<Result<any>>, evaluate: (userInput: string, previousInput: PromptSection[], value: any) => Promise<TranslationEvaluation>, maxAttempts?: number): Promise<Result<any> | undefined>;
export type TranslationEvaluation = {
    retVal: Result<any>;
    followUpMessageForUser?: string | undefined;
};
//# sourceMappingURL=interactive.d.ts.map