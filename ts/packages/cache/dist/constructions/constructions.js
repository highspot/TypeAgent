// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { RequestAction, fromJsonActions, } from "../explanation/requestAction.js";
import { matchParts } from "./constructionMatch.js";
import { createParsePartFromJSON, } from "./parsePart.js";
import { MatchPart, } from "./matchPart.js";
import { createActionProps, matchedValues, } from "./constructionValue.js";
function getDefaultTranslator(transformNamespaces) {
    return {
        transform(transformInfo, matchedText, history) {
            const matchedTextKey = matchedText.join("|");
            const { namespace, transformName } = transformInfo;
            return transformNamespaces
                .get(namespace)
                ?.get(transformName, matchedTextKey, history);
        },
        transformConflicts(transformInfo, matchedText) {
            const matchedTextKey = matchedText.join("|");
            const { namespace, transformName } = transformInfo;
            return transformNamespaces
                .get(namespace)
                ?.getConflicts(transformName, matchedTextKey);
        },
        parse(parsePart, match) {
            return parsePart.convertToValue(match);
        },
    };
}
export class Construction {
    static create(parts, transformNamespaces, implicitParameters, implicitActionName) {
        return new Construction(parts, transformNamespaces, implicitParameters, implicitActionName, -1);
    }
    constructor(parts, transformNamespaces, implicitParameters, implicitActionName, id) {
        this.parts = parts;
        this.transformNamespaces = transformNamespaces;
        this.implicitParameters = implicitParameters;
        this.implicitActionName = implicitActionName;
        this.id = id;
        if (parts.every((p) => p.optional)) {
            throw new Error("Construction must have one non-optional part");
        }
    }
    get implicitParameterCount() {
        return this.implicitParameters ? this.implicitParameters.length : 0;
    }
    match(request, config) {
        const matchedValues = matchParts(request, this.parts, config, getDefaultTranslator(this.transformNamespaces));
        if (matchedValues === undefined) {
            return [];
        }
        this.collectImplicitProperties(matchedValues.values);
        const actionProps = createActionProps(matchedValues.values);
        return [
            {
                construction: this,
                match: new RequestAction(request, fromJsonActions(actionProps), config.history),
                conflictValues: matchedValues.conflictValues,
                matchedCount: matchedValues.matchedCount,
                wildcardCharCount: matchedValues.wildcardCharCount,
                nonOptionalCount: this.parts.filter((p) => !p.optional).length,
            },
        ];
    }
    getMatchedValues(matched, config, matchValueTranslator) {
        const result = matchedValues(this.parts, matched, config, matchValueTranslator);
        if (result === undefined) {
            return undefined;
        }
        this.collectImplicitProperties(result.values);
        return result;
    }
    collectImplicitProperties(values) {
        if (this.implicitParameters) {
            for (const implicit of this.implicitParameters) {
                values.push([implicit.paramName, implicit.paramValue]);
            }
        }
    }
    toString(verbose = false) {
        return `${this.parts.map((p) => p.toString(verbose)).join("")}${this.implicitParameterCount !== 0
            ? `[${this.implicitParameters
                ?.map((p) => `${p.paramName}=${p.paramValue}`)
                .join("][")}]`
            : ""}${this.implicitActionName
            ? `[actionName=${this.implicitActionName}]`
            : ""}`;
    }
    isSupersetOf(others, implicitParameters) {
        let index = 0;
        for (const e of others) {
            let found = false;
            while (index < this.parts.length) {
                if (e.equals(this.parts[index])) {
                    found = true;
                    index++;
                    break;
                }
                if (!this.parts[index].optional) {
                    return false;
                }
                index++;
            }
            if (!found) {
                return false;
            }
        }
        for (let curr = index; curr < this.parts.length; curr++) {
            if (!this.parts[curr].optional) {
                return false;
            }
        }
        // Check implicitParameters
        const otherLength = implicitParameters ? implicitParameters.length : 0;
        const thisLength = this.implicitParameters
            ? this.implicitParameters.length
            : 0;
        if (thisLength !== otherLength) {
            return false;
        }
        if (thisLength === 0) {
            return true;
        }
        const otherSorted = implicitParameters.sort((a, b) => a.paramName.localeCompare(b.paramName));
        const thisSorted = this.implicitParameters.sort((a, b) => a.paramName.localeCompare(b.paramName));
        for (let i = 0; i < thisLength; i++) {
            if (otherSorted[i].paramName !== thisSorted[i].paramName) {
                return false;
            }
            if (otherSorted[i].paramValue !== thisSorted[i].paramValue) {
                return false;
            }
        }
        return true;
    }
    static fromJSON(construction, allMatchSets, transformNamespaces, index) {
        return new Construction(construction.parts.map((part) => {
            if (isParsePartJSON(part)) {
                return createParsePartFromJSON(part);
            }
            const matchSet = allMatchSets.get(part.matchSet);
            if (matchSet === undefined) {
                throw new Error(`Unable to resolve MatchSet ${part.matchSet}`);
            }
            return new MatchPart(matchSet, part.optional ?? false, part.wildcardMode ?? 0 /* WildcardMode.Disabled */, part.transformInfos);
        }), transformNamespaces, construction.implicitParameters, construction.implicitActionName, index);
    }
    toJSON() {
        // NOTE: transform needs to be saved separately, as they are currently global when the construction is in a cache.
        return {
            parts: this.parts,
            implicitParameters: this.implicitParameters?.length === 0
                ? undefined
                : this.implicitParameters,
            implicitActionName: this.implicitActionName,
        };
    }
}
function isParsePartJSON(part) {
    return part.parserName !== undefined;
}
export function convertConstructionV2ToV3(constructions, matchSetToTransformInfo) {
    for (const construction of constructions) {
        construction.parts.forEach((part) => {
            if (isParsePartJSON(part)) {
                throw new Error("ParsePart is not supported in V2");
            }
            const transformInfos = matchSetToTransformInfo.get(part.matchSet);
            if (transformInfos) {
                part.transformInfos = transformInfos;
            }
        });
    }
}
//# sourceMappingURL=constructions.js.map