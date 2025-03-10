// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createJsonTranslatorFromFile } from "common-utils";
import { TypeChatAgent } from "../typeChatAgent.js";
import { getPackageFilePath } from "../../utils/getPackageFilePath.js";
import { form } from "./explanationV5.js";
function createInstructions(requestAction) {
    const instructions = [
        form,
        "Generate 4 request with added politeness prefix and suffix that doesn't change the action",
    ];
    return [
        {
            role: "system",
            content: instructions.join("\n"),
        },
    ];
}
export function createPolitenessGeneralizer(model) {
    return new TypeChatAgent("politeness generalization", () => {
        return createJsonTranslatorFromFile("PolitenessGeneralization", getPackageFilePath("./src/explanation/v5/politenessGeneralizationSchemaV5.ts"), { model });
    }, createInstructions, (requestAction) => requestAction.toPromptString());
}
//# sourceMappingURL=politenessGeneralizationV5.js.map