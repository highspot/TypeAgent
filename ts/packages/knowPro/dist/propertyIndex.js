// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { facetValueToString } from "./knowledge.js";
export var PropertyNames;
(function (PropertyNames) {
    PropertyNames["EntityName"] = "name";
    PropertyNames["EntityType"] = "type";
    PropertyNames["FacetName"] = "facet.name";
    PropertyNames["FacetValue"] = "facet.value";
    PropertyNames["Verb"] = "verb";
    PropertyNames["Subject"] = "subject";
    PropertyNames["Object"] = "object";
    PropertyNames["IndirectObject"] = "indirectObject";
    PropertyNames["Tag"] = "tag";
})(PropertyNames || (PropertyNames = {}));
function addFacet(facet, propertyIndex, semanticRefIndex) {
    if (facet !== undefined) {
        propertyIndex.addProperty(PropertyNames.FacetName, facet.name, semanticRefIndex);
        if (facet.value !== undefined) {
            propertyIndex.addProperty(PropertyNames.FacetValue, facetValueToString(facet), semanticRefIndex);
        }
    }
}
export function addEntityPropertiesToIndex(entity, propertyIndex, semanticRefIndex) {
    propertyIndex.addProperty(PropertyNames.EntityName, entity.name, semanticRefIndex);
    for (const type of entity.type) {
        propertyIndex.addProperty(PropertyNames.EntityType, type, semanticRefIndex);
    }
    // add every facet name as a separate term
    if (entity.facets && entity.facets.length > 0) {
        for (const facet of entity.facets) {
            addFacet(facet, propertyIndex, semanticRefIndex);
        }
    }
}
export function addActionPropertiesToIndex(action, propertyIndex, semanticRefIndex) {
    propertyIndex.addProperty(PropertyNames.Verb, action.verbs.join(" "), semanticRefIndex);
    if (action.subjectEntityName !== "none") {
        propertyIndex.addProperty(PropertyNames.Subject, action.subjectEntityName, semanticRefIndex);
    }
    if (action.objectEntityName !== "none") {
        propertyIndex.addProperty(PropertyNames.Object, action.objectEntityName, semanticRefIndex);
    }
    if (action.indirectObjectEntityName !== "none") {
        propertyIndex.addProperty(PropertyNames.IndirectObject, action.indirectObjectEntityName, semanticRefIndex);
    }
}
export function buildPropertyIndex(conversation) {
    if (conversation.secondaryIndexes && conversation.semanticRefs) {
        conversation.secondaryIndexes.propertyToSemanticRefIndex ??=
            new PropertyIndex();
        addToPropertyIndex(conversation.secondaryIndexes.propertyToSemanticRefIndex, conversation.semanticRefs, 0);
    }
}
export function addToPropertyIndex(propertyIndex, semanticRefs, baseSemanticRefIndex) {
    for (let i = 0; i < semanticRefs.length; ++i) {
        const semanticRef = semanticRefs[i];
        const semanticRefIndex = i + baseSemanticRefIndex;
        switch (semanticRef.knowledgeType) {
            default:
                break;
            case "action":
                addActionPropertiesToIndex(semanticRef.knowledge, propertyIndex, semanticRefIndex);
                break;
            case "entity":
                addEntityPropertiesToIndex(semanticRef.knowledge, propertyIndex, semanticRefIndex);
                break;
            case "tag":
                const tag = semanticRef.knowledge;
                propertyIndex.addProperty(PropertyNames.Tag, tag.text, semanticRefIndex);
                break;
        }
    }
}
export class PropertyIndex {
    constructor() {
        this.map = new Map();
    }
    get size() {
        return this.map.size;
    }
    getValues() {
        const terms = [];
        for (const key of this.map.keys()) {
            const nv = this.termTextToNameValue(key);
            terms.push(nv[1]);
        }
        return terms;
    }
    addProperty(propertyName, value, semanticRefIndex) {
        let termText = this.toPropertyTermText(propertyName, value);
        if (typeof semanticRefIndex === "number") {
            semanticRefIndex = {
                semanticRefIndex: semanticRefIndex,
                score: 1,
            };
        }
        termText = this.prepareTermText(termText);
        if (this.map.has(termText)) {
            this.map.get(termText)?.push(semanticRefIndex);
        }
        else {
            this.map.set(termText, [semanticRefIndex]);
        }
    }
    clear() {
        this.map.clear();
    }
    lookupProperty(propertyName, value) {
        const termText = this.toPropertyTermText(propertyName, value);
        return this.map.get(this.prepareTermText(termText)) ?? [];
    }
    /**
     * Do any pre-processing of the term.
     * @param termText
     */
    prepareTermText(termText) {
        return termText.toLowerCase();
    }
    toPropertyTermText(name, value) {
        return makePropertyTermText(name, value);
    }
    termTextToNameValue(termText) {
        return splitPropertyTermText(termText);
    }
}
export function lookupPropertyInPropertyIndex(propertyIndex, propertyName, propertyValue, semanticRefs, rangesInScope) {
    let scoredRefs = propertyIndex.lookupProperty(propertyName, propertyValue);
    if (scoredRefs && scoredRefs.length > 0 && rangesInScope) {
        scoredRefs = scoredRefs.filter((sr) => rangesInScope.isRangeInScope(semanticRefs[sr.semanticRefIndex].range));
    }
    return scoredRefs;
}
const PropertyDelimiter = "@@";
function makePropertyTermText(name, value) {
    return `prop.${name}${PropertyDelimiter}${value}`;
}
function splitPropertyTermText(termText) {
    const parts = termText.split(PropertyDelimiter);
    return [parts[0], parts[1]];
}
//# sourceMappingURL=propertyIndex.js.map