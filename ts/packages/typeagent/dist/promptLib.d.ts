/**
 * A library of common Prompt Sections to include in requests
 */
import { PromptSection } from "typechat";
import { dateTime } from ".";
/**
 * Prompt that tells the model about the current date and time.
 * @returns prompt
 */
export declare function dateTimePrompt(): string;
/**
 * A prompt section that supplies the current time stamp
 * @returns
 */
export declare function dateTimePromptSection(): PromptSection;
/**
 * Prompt that tells the model about the current date and time.
 * @returns prompt
 */
export declare function dateTimeRangePrompt(range: dateTime.DateRange): string;
/**
 * A prompt section that supplies the current time stamp
 * @returns
 */
export declare function dateTimeRangePromptSection(range: dateTime.DateRange): PromptSection;
export declare function textToProcessSection(text: string): PromptSection;
//# sourceMappingURL=promptLib.d.ts.map