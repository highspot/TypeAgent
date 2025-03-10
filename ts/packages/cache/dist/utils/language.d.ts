export interface LanguageTools {
    possibleReferentialPhrase(phrase: string): boolean;
    hasClosedClass(phase: string, exact?: boolean): boolean;
}
export declare function getLanguageTools(language: string): LanguageTools | undefined;
//# sourceMappingURL=language.d.ts.map