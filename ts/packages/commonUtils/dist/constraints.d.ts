import { Result } from "typechat";
/**
 * Represents an object that can validate that an object of T matches constraints on its values.
 * Examples of constraints include number ranges, email address formats, etc.
 * Constraints checking is applied after structural JSON validation
 */
export interface TypeChatConstraintsValidator<T extends object> {
    validateConstraints(value: T): Result<T>;
}
/**
 * Diagnostics emitted during constraints validation
 */
export type ValidationDiagnostic = {
    category?: string;
    message: string;
};
/**
 * Create a constraints validator
 * The validator handles arrays as well as all values() of the object
 */
export declare function createConstraintsValidator<T extends object>(validationCallback: (value: T, context: ValidationContext) => void): TypeChatConstraintsValidator<T>;
/**
 * Context used to collect diagnostics during constraints checking
 */
export declare class ValidationContext {
    private _errors;
    constructor();
    /**
     * Diagnostics collected so far
     */
    get diagnostics(): ValidationDiagnostic[];
    /**
     * Add a diagnostic message
     * @param message
     */
    addMessage(message: string): void;
    /**
     * Add a diagnostic
     * @param error
     */
    addDiagnostic(category: string, message: string): void;
    /**
     * Construct a diagnostic string
     * @param includeCategory whether to include the diagnostic category
     * @returns
     */
    diagnosticString(): string;
}
//# sourceMappingURL=constraints.d.ts.map