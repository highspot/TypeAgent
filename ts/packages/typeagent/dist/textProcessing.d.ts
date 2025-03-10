/**
 * Functions useful and/or typically used for processing text, with AI and code.
 * Text code be:
 *  - Arrays of strings
 *  - Text files
 *  - Large text and/or large text files
 */
import { PromptSection, Result, TypeChatJsonTranslator, TypeChatLanguageModel } from "typechat";
import { ChatModel, TextEmbeddingModel } from "aiclient";
import { TypeSchema } from "./schema";
import { ProcessProgress } from "./arrayAsync";
/**
 * Assumes that paragraphs end with 2+ LF or 2+ CRLF
 * @param text
 * @returns paragaphs
 */
export declare function splitIntoParagraphs(text: string): string[];
export declare function splitSentenceIntoPhrases(text: string): string[];
/**
 * Progress callback
 * @param text The text being processed
 * @param result The result of processing the text
 */
export type Progress<T> = (text: string, result: T) => void;
/**
 * Create a set from a list of strings
 * @param items
 * @param caseSensitive
 * @returns
 */
export declare function setFromList(items: string[], caseSensitive?: boolean): Set<string>;
/**
 * Yields a stream of distinct strings
 * @param strings
 * @param caseSensitive
 */
export declare function distinctIterator(strings: Iterable<string>, caseSensitive?: boolean): IterableIterator<string>;
/**
 * Dedupe the given list of strings.
 * Returns items in the *original* order
 * @param list
 * @param caseSensitive
 */
export declare function dedupeList(list: string[], caseSensitive?: boolean): string[];
/**
 * Dedupe a file of lines.
 * The file is updated in-place by default
 * @param filePath Source file
 * @param outputFilePath (optional) Output file path
 */
export declare function dedupeLineFile(filePath: string, outputFilePath?: string, caseSensitive?: boolean): Promise<void>;
/**
 * Join the given text files into a single file
 * @param sourceFiles
 * @param outputFilePath
 * @param separator
 */
export declare function joinFiles(sourceFiles: string[], outputFilePath: string, separator?: string): Promise<void>;
/**
 * Join the items from strings into chunks, and yield each chunk.
 * Each chunk can have maxCharsPerChunk
 * Note: will not trim individual chunks that are longer than maxCharsPerChunk
 * @param strings source strings
 * @param maxCharsPerChunk max size of a chunk
 * @param separator optional, used like separator in string.'join'
 */
export declare function buildChunks(strings: string[], maxCharsPerChunk: number, separator?: string | undefined): IterableIterator<string>;
/**
 * Yield chunks of max size maxCharsPerChunk from text
 * @param text
 * @param maxCharsPerChunk maximum size of a chunk
 */
export declare function getTextChunks(text: string, maxCharsPerChunk: number): string[];
/**
 * Given some text whose length could exceed the token limit of a model, iteratively
 * transform it with the given model.
 * If text is too large, breaks text into chunks using a sentence level chunker
 * @param text
 * @param maxCharsPerChunk
 * @param model
 * @param instruction
 * @param progress
 * @returns
 */
export declare function getCompletionOnLargeText(text: string, maxCharsPerChunk: number, model: TypeChatLanguageModel, instruction: string | ((chunk: string) => string), progress?: Progress<string>): Promise<Result<string[]>>;
/**
 * Json translate request, using 'text' as context. If the text is large, breaks
 * text into chunks and iteratively runs requests against each chunk
 * @param translator
 * @param request User request
 * @param text Full text to break into chunks and use as context for each request
 * @param maxCharsPerChunk
 * @returns
 */
export declare function jsonTranslateLargeText<T extends object>(translator: TypeChatJsonTranslator<T>, request: string, text: string, maxCharsPerChunk: number): AsyncIterableIterator<[string, Result<T>]>;
/**
 * Json translate request, using text from the web page as context. If the text is large, breaks
 * text into chunks and iteratively runs requests against each chunk
 * @param translator
 * @param request User request
 * @param text Full text to break into chunks and use as context for each request
 * @param maxCharsPerChunk
 * @returns
 */
export declare function jsonTranslateWebPage<T extends object>(translator: TypeChatJsonTranslator<T>, request: string, webPageUrl: string, maxChunkSize: number, progress?: Progress<Result<T>>): AsyncIterableIterator<[string, Result<T>]>;
/**
 * Generate bullet point notes for the given text
 * @param text
 * @param maxCharsPerChunk for long text, send no more than these many chars at a time
 * @param model model to use to generate notes
 * @param progress
 * @returns
 */
export declare function generateNotes(text: string, maxCharsPerChunk: number, model: TypeChatLanguageModel, progress?: Progress<string>): Promise<Result<string[]>>;
export interface Entity {
    name: string;
    type: string[];
}
export interface ChunkChatResponse {
    answerStatus: "Answered" | "NotAnswered" | "PartiallyAnswered";
    generatedText?: string;
    entities: Entity[];
    urls?: string[];
}
export declare function accumulateAnswer(answer: ChunkChatResponse, chunkResponse: ChunkChatResponse, url?: string): ChunkChatResponse;
/**
 * Generate an answer for request from information in the given text. If the text is too big, iteratively
 * process the text in chunks of maxCharsPerChunk
 * @param request Question
 * @param text Text which may contain answer for question.
 * @param maxCharsPerChunk max size of each chunk
 * @param model model to use
 * @param concurrency generation concurrency.
 * @param progress generation progress
 * @returns
 */
export declare function generateAnswer(request: string, text: string, maxCharsPerChunk: number, model: TypeChatLanguageModel, concurrency: number, progress?: Progress<ChunkChatResponse>): Promise<Result<string | ChunkChatResponse>>;
/**
 * Fetches HTML from a Url, extracts text from it and
 * @param model
 * @param webPageUrl
 * @param instruction Instruction can be a string, or a call back that can emit the instruction on the fly
 * @param maxChunkSize
 * @param maxTextLengthToSearch Maximum amount of text in a single web page to search. Assumes, if an answer is not found in first N chars, probably won't be
 * @param concurrency How many requests to run concurrently?
 * @param progress
 * @returns
 */
export declare function generateAnswerFromWebPage(model: TypeChatLanguageModel, webPageUrl: string, request: string, maxChunkSize: number, maxTextLengthToSearch: number | undefined, concurrency: number, progress?: Progress<ChunkChatResponse>): Promise<ChunkChatResponse | undefined>;
/**
 * Fetches a set of web pages and attempts to get an answer to request from them
 * @param optimizeFor Use Speed for non-GPT4 models. Speed will not emit Entities
 * @param model model to use for generating answers
 * @param webPageUrls urls of pages to retrieve
 * @param request question for which to get answers
 * @param options Lookup options
 * @param concurrency Parallel processing for an individual page
 * @param progress Callback... as the search runs
 * @returns
 */
export declare function generateAnswerFromWebPages(optimizeFor: "Speed" | "Quality", model: TypeChatLanguageModel, webPageUrls: string[], request: string, options: LookupOptions, concurrency: number, context?: PromptSection[], progress?: Progress<ChunkChatResponse>): Promise<ChunkChatResponse | undefined>;
export type AnswerRelevance = "NoAnswer" | "PartialAnswer" | "FullAnswer";
export type AnswerResponse = {
    type: AnswerRelevance;
    answer?: string;
};
/**
 * Answer the given query from the provided text
 * @param model
 * @param query
 * @param text
 * @returns
 */
export declare function answerQuery(model: TypeChatLanguageModel, query: string, text: string, context?: PromptSection[]): Promise<Result<AnswerResponse>>;
/**
 * Simple, but works great with GPT_35_Turbo
 * @param model
 * @param question
 * @param text
 * @param maxCharsPerChunk
 */
export declare function answerQueryFromLargeText(model: TypeChatLanguageModel, query: string, text: string, maxCharsPerChunk: number, concurrency: number | undefined, rewriteForReadability: boolean, rewriteFocus?: string | undefined, context?: PromptSection[], progress?: ProcessProgress<string, AnswerResponse>): Promise<AnswerResponse>;
export type WebLookup = {
    query: string;
    webPageUrl: string;
};
export type LookupOptions = {
    maxCharsPerChunk: number;
    maxTextLengthToSearch: number;
    deepSearch?: boolean;
    rewriteForReadability?: boolean;
    rewriteModel?: ChatModel;
    rewriteFocus?: string | undefined;
};
/**
 * Try to answer a query from the text downloaded from the provided web page url
 * @param model
 * @param lookup
 * @param maxCharsPerChunk
 * @returns
 */
export declare function lookupAnswerOnWebPage(model: TypeChatLanguageModel, lookup: WebLookup, options: LookupOptions, concurrency?: number, context?: PromptSection[], progress?: ProcessProgress<WebLookup, AnswerResponse>): Promise<AnswerResponse>;
export type WebLookupAnswer = {
    answer: AnswerResponse;
    webPageUrls: string[];
};
/**
 * Find an answer for the given query from the text of web pages whose urls is provided
 * @param model
 * @param webPageUrls
 * @param query
 * @param options
 * @param concurrency
 * @param progress
 * @returns
 */
export declare function lookupAnswersOnWebPages(model: TypeChatLanguageModel, query: string, webPageUrls: string[], options: LookupOptions, concurrency?: number, context?: PromptSection[], progress?: ProcessProgress<WebLookup, AnswerResponse>): Promise<WebLookupAnswer>;
/**
 * lookupAnswersOnWeb answers a question using information from the Internet
 * - Takes a model and a query..
 * - Searches the web using Bing
 * - Takes the top K matches, fetches the HTML for each one, extracts text
 * - Runs through the text chunk by chunk... passing each chunk to the LLM
 * - If a chunk answered the question (fully or partially), collects the answer
 * - Collects up all the sub-answers, then rewrites them into a more cogent response, also using the LLM.
 * @param model Language model to use
 * @param query The query for which we should get an answer
 * @param maxSearchResults maximum search results to get from Bing. This impacts how many web pages we look at
 * @param options
 * @param concurrency
 * @param context
 * @param progress
 * @returns
 */
export declare function lookupAnswersOnWeb(model: TypeChatLanguageModel, query: string, maxSearchResults: number, options: LookupOptions, concurrency?: number, context?: PromptSection[], progress?: ProcessProgress<WebLookup, AnswerResponse>): Promise<WebLookupAnswer>;
export type EntityResponse = {
    type: "Success" | "NoEntities";
    entities?: Entity[];
};
/**
 * Extract entities from the given text
 * @param model
 * @param text
 * @returns
 */
export declare function extractEntities(model: TypeChatLanguageModel, text: string): Promise<Entity[]>;
export declare function extractEntitiesFromLargeText(model: TypeChatLanguageModel, text: string, maxCharsPerChunk: number, concurrency: number): Promise<Entity[]>;
/**
 * Extract all text from the given html.
 * @param html raw html
 * @param nodeQuery A JQuery like list of node types to extract text from. By default, p, div and span
 * @returns text
 */
export declare function htmlToText(html: string, nodeQuery?: string): string;
/**
 * Fetches HTML from a Url, extracts text from it. Then sends the text to a language model for processing
 * along with instructions you supply. If the text is too long, does so in chunks
 * @param model
 * @param webPageUrl
 * @param instruction Instruction can be a string, or a call back that can emit the instruction on the fly
 * @param maxChunkSize
 * @param progress
 * @returns
 */
export declare function processTextFromWebPage(model: TypeChatLanguageModel, webPageUrl: string, instruction: string | ((chunk: string) => string), maxChunkSize: number, progress?: Progress<string>): Promise<string | undefined>;
/**
 * Generate notes for the given web page
 * @param model
 * @param webPageUrl
 * @param instruction
 * @param maxChunkSize
 * @param progress
 */
export declare function generateNotesForWebPage(model: TypeChatLanguageModel, webPageUrl: string, maxChunkSize: number, progress?: Progress<string>): Promise<string | undefined>;
/**
 * Summarize the given text
 * @param model model to use to generate notes
 * @param text
 * @param maxCharsPerChunk for long text, send no more than these many chars at a time
 * @param progress
 * @returns
 */
export declare function summarize(model: TypeChatLanguageModel, text: string, maxCharsPerChunk: number, progress?: Progress<string>): Promise<Result<string[]>>;
/**
 * Summarize a web page
 * @param model
 * @param webPageUrl
 * @param maxChunkSize
 * @param progress
 * @returns
 */
export declare function summarizeWebPage(model: TypeChatLanguageModel, webPageUrl: string, maxChunkSize: number, progress?: Progress<string>): Promise<string | undefined>;
/**
 * Useful for rewriting text to be more readable, concise, and non-redundant
 * @param model
 * @param text
 * @param question
 * @returns
 */
export declare function rewriteText(model: TypeChatLanguageModel, text: string, question?: string, rewriteFocus?: string): Promise<string | undefined>;
/**
 * Generate lists as per the given list definition
 * @param model model to use
 * @param listDefinition list definition
 * @param itemCount (optional) number of items to return
 * @returns A list OR an empty array if the list could not be generated
 */
export declare function generateList(model: TypeChatLanguageModel, listDefinition: string, context: PromptSection[] | undefined, itemCount?: number): Promise<string[]>;
/**
 * Typical variations
 */
export type VariationType = "variations" | "alternatives" | "synonyms" | "antonyms" | "similar" | "canonical" | "typical variations" | "common variations" | "likely" | "unlikely" | "most likely" | "most unlikely";
export interface VariationSettings {
    type: VariationType | string;
    count: number;
    /**
     * (Optional) Variations must be translatable to this schema
     */
    schema?: TypeSchema | undefined;
    /**
     * Hints on how to generate the variations
     */
    hints?: string | undefined;
    /**
     * Facets to vary
     */
    facets: string | undefined;
}
/**
 * Generate variations on a seed phrase
 * @param model
 * @param seedPhrase
 * @param settings
 * @returns A list of variations
 */
export declare function generateVariations(model: TypeChatLanguageModel, seedPhrase: string, settings: VariationSettings): Promise<string[]>;
/**
 * Recursively generate variations on a seed phrase, using generated phrases as new seed phrases
 * @param model model to use
 * @param seedPhrase
 * @param settings
 * @param depth Number of levels of variation generation
 * @param progress
 * @returns A list of variations
 */
export declare function generateVariationsRecursive(model: TypeChatLanguageModel, seedPhrase: string, settings: VariationSettings, depth?: number, progress?: Progress<string[]>): Promise<string[]>;
export declare function stringSimilarity(model: TextEmbeddingModel, x: string | undefined, y: string | undefined): Promise<number>;
//# sourceMappingURL=textProcessing.d.ts.map