export interface SubPhrase {
    text: string;
}
export interface NonPropertySubPhrase extends SubPhrase {
    category: string;
    synonyms: string[];
    isOptional?: boolean;
}
export interface PropertySubPhase extends SubPhrase {
    category: string;
    propertyNames: string[];
}
export type SubPhraseType = PropertySubPhase | NonPropertySubPhrase;
export interface SubPhraseExplanation {
    subPhrases: SubPhraseType[];
}
//# sourceMappingURL=subPhraseExplanationSchemaV5.d.ts.map