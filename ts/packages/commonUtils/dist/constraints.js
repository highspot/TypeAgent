// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { error, success } from "typechat";
/**
 * Create a constraints validator
 * The validator handles arrays as well as all values() of the object
 */
export function createConstraintsValidator(validationCallback) {
    const validator = {
        validateConstraints: validate,
    };
    return validator;
    function validate(value) {
        // Call the validation callback with context
        const context = new ValidationContext();
        validationCallback(value, context);
        // Collect any diagnostics returned
        if (context.diagnostics.length > 0) {
            return error(context.diagnosticString());
        }
        return success(value);
    }
}
/**
 * Context used to collect diagnostics during constraints checking
 */
export class ValidationContext {
    constructor() {
        this._errors = [];
    }
    /**
     * Diagnostics collected so far
     */
    get diagnostics() {
        return this._errors;
    }
    /**
     * Add a diagnostic message
     * @param message
     */
    addMessage(message) {
        this._errors.push({ message: message });
    }
    /**
     * Add a diagnostic
     * @param error
     */
    addDiagnostic(category, message) {
        this._errors.push({ category: category, message: message });
    }
    /**
     * Construct a diagnostic string
     * @param includeCategory whether to include the diagnostic category
     * @returns
     */
    diagnosticString() {
        const diagnostics = this._errors.map((d) => d.category ? d.category + ", " + d.message : d.message);
        return diagnostics.join("\n");
    }
}
//# sourceMappingURL=constraints.js.map