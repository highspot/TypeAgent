// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PropertyIndex, buildPropertyIndex } from "./propertyIndex.js";
import { buildRelatedTermsIndex, RelatedTermsIndex, } from "./relatedTermsIndex.js";
import { buildTimestampIndex, TimestampToTextRangeIndex, } from "./timestampIndex.js";
export async function buildSecondaryIndexes(conversation, buildRelated, eventHandler) {
    conversation.secondaryIndexes ??= new ConversationSecondaryIndexes();
    buildPropertyIndex(conversation);
    buildTimestampIndex(conversation);
    if (buildRelated) {
        await buildRelatedTermsIndex(conversation, eventHandler);
    }
}
export class ConversationSecondaryIndexes {
    constructor(settings = {}) {
        this.propertyToSemanticRefIndex = new PropertyIndex();
        this.timestampIndex = new TimestampToTextRangeIndex();
        this.termToRelatedTermsIndex = new RelatedTermsIndex(settings);
    }
}
//# sourceMappingURL=secondaryIndexes.js.map