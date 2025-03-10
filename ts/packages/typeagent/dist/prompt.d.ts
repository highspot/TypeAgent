import { PromptSection } from "typechat";
import { MessageSourceRole } from "./message";
/**
 * Create Prompt Sections from given strings
 * @param strings
 * @returns Prompt sections
 */
export declare function createPromptSections(strings: string | string[], role: MessageSourceRole): PromptSection[];
/**
 * Concatenate two prompt sections
 * @param first
 * @param second
 * @returns
 */
export declare function concatPromptSections(first?: PromptSection[], second?: PromptSection[]): PromptSection[] | undefined;
/**
 * Join sections into one:
 * @param role
 * @param sections
 * @returns
 */
export declare function joinPromptSections(role: MessageSourceRole, sections: PromptSection[]): PromptSection;
/**
 * Get the cumulative length of all text in the given prompt sections
 * @param sections
 * @returns
 */
export declare function getTotalPromptLength(sections: PromptSection[]): number;
export declare function getPreambleLength(preamble?: string | PromptSection[]): number;
/**
 * Used to return a collection of prompt sections, along with the total length
 * of the individual sections
 * (Consider): This should probably be "ArrayLike" instead.
 */
export type PromptSections = {
    length: number;
    sections: PromptSection[];
};
/**
 * PromptBuilder builds prompts that can meet a given character/token budget.
 * A prompt consists of multiple prompt sections. Builders can be reused
 *
 * builder.begin();
 * push(), push()...
 * builder.complete();
 */
export interface PromptBuilder {
    maxLength: number;
    maxSections: number;
    currentLength: number;
    prompt: PromptSection[];
    /**
     * Call begin to start building a prompt
     */
    begin(): void;
    push(section: string | string[] | PromptSection | PromptSection[]): boolean;
    pushSection(section: PromptSection): boolean;
    pushText(content: string | string[]): boolean;
    pushSections(sections: PromptSection[] | IterableIterator<PromptSection>): boolean;
    /**
     * Call complete to finish building the prompt
     */
    complete(reverse?: boolean): PromptSections;
}
/**
 * A Prompt is a collection of Prompt Sections
 * Context is usually submitted as a collection of prompt sections.
 * But contexts must satisfy a token budget: typically constrained to a maximum character count, as that
 * is easier to deal with than token counts
 *
 * Builders can be reused.
 */
export declare function createPromptBuilder(maxLength: number, maxSections?: number): PromptBuilder;
/**
 * Builds a single prompt section that sticks to a character budget.
 */
export interface PromptSectionBuilder {
    maxLength: number;
    buffer: string;
    begin(): void;
    push(object: any): boolean;
    pushText(text: string): boolean;
    complete(role: MessageSourceRole): PromptSection;
}
export declare function createPromptSectionBuilder(maxLength: number): PromptSectionBuilder;
export interface PromptSectionProvider {
    getSections(request: string): Promise<PromptSection[]>;
}
export interface ChatHistory extends Iterable<PromptSection> {
    readonly length: number;
    get(index: number): PromptSection;
    getEntries(maxEntries?: number): PromptSection[];
    push(message: PromptSection): void;
}
/**
 * Creates a chat history with a maximum past history using a circular buffer
 * @param maxPastMessages
 * @param savedHistory Saved history, if any.. ordered by oldest message first
 * @returns
 */
export declare function createChatHistory(maxPastMessages: number, savedHistory?: Iterable<PromptSection> | undefined): ChatHistory;
/**
 * Given chat history, select messages that could go into context
 * @param history Chat history
 * @param maxContextLength max number of characters available for history
 * @param maxWindowLength maximum size of the chat context window...
 */
export declare function getContextFromHistory(history: PromptSection[] | ChatHistory, maxContextLength: number, maxWindowLength?: number): IterableIterator<PromptSection>;
//# sourceMappingURL=prompt.d.ts.map