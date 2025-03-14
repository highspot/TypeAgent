import { ActionResult, ActionResultError, ActionResultSuccess, ActionResultSuccessNoDisplay } from "../action.js";
import { Entity } from "../memory.js";
export declare function createActionResultNoDisplay(literalText: string): ActionResultSuccessNoDisplay;
export declare function createActionResult(literalText: string, speak?: boolean | undefined, entities?: Entity[] | undefined): ActionResultSuccess;
export declare function createActionResultFromTextDisplay(displayText: string, literalText?: string): ActionResultSuccess;
export declare function createActionResultFromHtmlDisplay(displayText: string, literalText?: string): ActionResultSuccess;
export declare function createActionResultFromHtmlDisplayWithScript(displayText: string, literalText?: string): ActionResultSuccess;
export declare function createActionResultFromMarkdownDisplay(literalText: string, entities?: Entity[], resultEntity?: Entity): ActionResultSuccess;
export declare function createActionResultFromError(error: string): ActionResultError;
export declare function actionResultToString(actionResult: ActionResult): string;
//# sourceMappingURL=actionHelpers.d.ts.map