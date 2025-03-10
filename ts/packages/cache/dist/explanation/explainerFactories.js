// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createExplainerV5 } from "./v5/explanationV5.js";
// A list of available explainer factories.  The properties are the name used to look up
// the explainer with the `@config explainer name` command.
const explainerFactories = {
    v5: createExplainerV5,
    // Add new version of explainer here
};
export function getExplainerFactories() {
    return explainerFactories;
}
//# sourceMappingURL=explainerFactories.js.map