// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getArtist } from "./endpoints.js";
export var FilterTokenType;
(function (FilterTokenType) {
    FilterTokenType[FilterTokenType["Genre"] = 0] = "Genre";
    FilterTokenType[FilterTokenType["Artist"] = 1] = "Artist";
    FilterTokenType[FilterTokenType["Year"] = 2] = "Year";
    FilterTokenType[FilterTokenType["Description"] = 3] = "Description";
    FilterTokenType[FilterTokenType["Colon"] = 4] = "Colon";
    FilterTokenType[FilterTokenType["AND"] = 5] = "AND";
    FilterTokenType[FilterTokenType["OR"] = 6] = "OR";
    FilterTokenType[FilterTokenType["LParen"] = 7] = "LParen";
    FilterTokenType[FilterTokenType["RParen"] = 8] = "RParen";
    FilterTokenType[FilterTokenType["Value"] = 9] = "Value";
})(FilterTokenType || (FilterTokenType = {}));
// split a string into an array of non-whitespace strings
function splitNonWhitespace(str) {
    const nested = str.split(/\s+/).map((w) => w.split(/\b/));
    return nested.flat().filter((w) => w.length > 0);
}
function tokenize(filter) {
    const nonws = splitNonWhitespace(filter);
    const tokens = [];
    for (const rawtok of nonws) {
        const tok = rawtok.toLowerCase();
        if (tok === "and") {
            tokens.push({ type: FilterTokenType.AND });
        }
        else if (tok === "or") {
            tokens.push({ type: FilterTokenType.OR });
        }
        else if (tok === "(") {
            tokens.push({ type: FilterTokenType.LParen });
        }
        else if (tok === ")") {
            tokens.push({ type: FilterTokenType.RParen });
        }
        else if (tok === ":") {
            tokens.push({ type: FilterTokenType.Colon });
        }
        else if (tok === "genre") {
            tokens.push({ type: FilterTokenType.Genre });
        }
        else if (tok === "artist") {
            tokens.push({ type: FilterTokenType.Artist });
        }
        else if (tok === "year") {
            tokens.push({ type: FilterTokenType.Year });
        }
        else if (tok === "description") {
            tokens.push({ type: FilterTokenType.Description });
        }
        else {
            tokens.push({ type: FilterTokenType.Value, rawValue: rawtok });
        }
    }
    return tokens;
}
export var FilterConstraintType;
(function (FilterConstraintType) {
    FilterConstraintType["Genre"] = "genre";
    FilterConstraintType["Artist"] = "artist";
    FilterConstraintType["Year"] = "year";
    FilterConstraintType["Description"] = "description";
})(FilterConstraintType || (FilterConstraintType = {}));
export var FilterCombinerType;
(function (FilterCombinerType) {
    FilterCombinerType["AND"] = "AND";
    FilterCombinerType["OR"] = "OR";
})(FilterCombinerType || (FilterCombinerType = {}));
function makeFilterCombiner(combinerType = FilterCombinerType.AND) {
    return { type: "combiner", combinerType, operands: [] };
}
// map filter token type to filter constraint type
const filterConstraintTypeMap = new Map([
    [FilterTokenType.Genre, FilterConstraintType.Genre],
    [FilterTokenType.Artist, FilterConstraintType.Artist],
    [FilterTokenType.Year, FilterConstraintType.Year],
    [FilterTokenType.Description, FilterConstraintType.Description],
]);
function makeFilterConstraint(constraintType, constraintValue) {
    return {
        type: "constraint",
        constraintType,
        constraintValue,
    };
}
function isValueBoundary(tokenType) {
    return (tokenType !== FilterTokenType.Colon &&
        tokenType !== FilterTokenType.Value);
}
export function filterNodeToString(node, depth = 0) {
    if (node.type === "combiner") {
        return ("(" +
            node.combinerType +
            " " +
            node.operands
                .map((op) => filterNodeToString(op, depth + 1))
                .join(" ") +
            ")");
    }
    else {
        return node.constraintType + ":" + node.constraintValue;
    }
}
function simplifyFilterNode(ast) {
    if (ast.type === "combiner") {
        if (ast.operands.length === 1) {
            return simplifyFilterNode(ast.operands[0]);
        }
        else {
            for (let i = 0; i < ast.operands.length; i++) {
                ast.operands[i] = simplifyFilterNode(ast.operands[i]);
            }
            return ast;
        }
    }
    else {
        return ast;
    }
}
export function parseFilter(filter) {
    const tokens = tokenize(filter);
    let pendingConstraint = undefined;
    const stack = [{ andExpr: makeFilterCombiner() }];
    for (const token of tokens) {
        if (isValueBoundary(token.type)) {
            if (pendingConstraint) {
                stack[stack.length - 1].andExpr.operands.push(pendingConstraint);
                pendingConstraint = undefined;
            }
        }
        if (token.type === FilterTokenType.Genre ||
            token.type === FilterTokenType.Artist ||
            token.type === FilterTokenType.Year ||
            token.type === FilterTokenType.Description) {
            if (pendingConstraint !== undefined) {
                return { diagnostics: ["Nested constraint prefix"] };
            }
            else {
                pendingConstraint = makeFilterConstraint(filterConstraintTypeMap.get(token.type), "");
            }
        }
        else if (token.type === FilterTokenType.Colon) {
            if (!pendingConstraint) {
                return { diagnostics: ["Expected constraint type before ':'"] };
            }
        }
        else if (token.type === FilterTokenType.AND) {
            // do nothing; always in an AND
        }
        else if (token.type === FilterTokenType.OR) {
            const orNode = makeFilterCombiner(FilterCombinerType.OR);
            const top = stack[stack.length - 1];
            if (top.pendingOr) {
                top.pendingOr.operands.push(top.andExpr);
                orNode.operands.push(top.pendingOr);
            }
            else {
                orNode.operands.push(top.andExpr);
            }
            top.pendingOr = orNode;
            top.andExpr = makeFilterCombiner();
        }
        else if (token.type === FilterTokenType.LParen) {
            stack.push({ andExpr: makeFilterCombiner() });
        }
        else if (token.type === FilterTokenType.RParen) {
            if (stack.length === 1) {
                return { diagnostics: ["Mismatched )"] };
            }
            const prevTop = stack.pop();
            if (prevTop.pendingOr) {
                prevTop.pendingOr.operands.push(prevTop.andExpr);
                stack[stack.length - 1].andExpr.operands.push(prevTop.pendingOr);
            }
            else {
                stack[stack.length - 1].andExpr.operands.push(prevTop.andExpr);
            }
        }
        else if (token.type === FilterTokenType.Value) {
            if (!pendingConstraint) {
                return {
                    diagnostics: [
                        "Unexpected: value without constraint prefix",
                    ],
                };
            }
            else {
                if (pendingConstraint.constraintValue.length > 0) {
                    pendingConstraint.constraintValue += " ";
                }
                pendingConstraint.constraintValue += token.rawValue;
            }
        }
    }
    if (pendingConstraint) {
        stack[stack.length - 1].andExpr.operands.push(pendingConstraint);
    }
    if (stack.length !== 1) {
        return { diagnostics: ["Mismatched ("] };
    }
    const top = stack[0];
    if (top.pendingOr) {
        top.pendingOr.operands.push(top.andExpr);
        return { ast: simplifyFilterNode(top.pendingOr) };
    }
    else {
        return { ast: simplifyFilterNode(top.andExpr) };
    }
}
const filterDiag = false;
export async function applyFilterExpr(clientContext, model, filterExpr, tracks, negate = false) {
    if (tracks.length === 0) {
        return tracks;
    }
    switch (filterExpr.type) {
        case "constraint":
            switch (filterExpr.constraintType) {
                case FilterConstraintType.Genre: {
                    process.stdout.write(`fetching genre for ${tracks.length} tracks`);
                    const genre = filterExpr.constraintValue;
                    const results = [];
                    for (const track of tracks) {
                        process.stdout.write(".");
                        const wrapper = await getArtist(clientContext.service, track.album.artists[0].id);
                        if (wrapper) {
                            let hit = wrapper.genres.includes(genre);
                            if (negate) {
                                hit = !hit;
                            }
                            if (hit) {
                                results.push(track);
                            }
                        }
                    }
                    process.stdout.write("\n");
                    tracks = results;
                    break;
                }
                case FilterConstraintType.Artist: {
                    const results = [];
                    for (const track of tracks) {
                        let hit = false;
                        for (const artist of track.artists) {
                            if (filterDiag) {
                                console.log(`${artist.name.toLowerCase()} vs ${filterExpr.constraintValue.toLowerCase()}`);
                            }
                            if (artist.name
                                .toLowerCase()
                                .includes(filterExpr.constraintValue.toLowerCase())) {
                                hit = true;
                            }
                            if (negate) {
                                hit = !hit;
                            }
                            if (hit) {
                                results.push(track);
                            }
                            if (hit) {
                                break;
                            }
                        }
                    }
                    process.stdout.write("\n");
                    tracks = results;
                    break;
                }
                case FilterConstraintType.Year: {
                    const results = [];
                    for (const track of tracks) {
                        // TODO year ranges
                        if (filterDiag) {
                            console.log(`${track.album.release_date} vs ${filterExpr.constraintValue}`);
                        }
                        if (track.album.release_date.includes(filterExpr.constraintValue)) {
                            results.push(track);
                        }
                    }
                    tracks = results;
                    break;
                }
                case FilterConstraintType.Description: {
                    const results = [];
                    const indicesResult = await llmFilter(model, filterExpr.constraintValue, tracks);
                    if (indicesResult.success) {
                        if (indicesResult.data) {
                            const indices = JSON.parse(indicesResult.data);
                            for (const j of indices.trackNumbers) {
                                results.push(tracks[j]);
                            }
                        }
                    }
                    tracks = results;
                    break;
                }
            }
            break;
        case "combiner":
            if (filterExpr.combinerType === FilterCombinerType.AND) {
                for (const childExpr of filterExpr.operands) {
                    tracks = await applyFilterExpr(clientContext, model, childExpr, tracks, negate);
                }
            }
            else if (filterExpr.combinerType === FilterCombinerType.OR) {
                let subTracks = [];
                for (const childExpr of filterExpr.operands) {
                    subTracks = subTracks.concat(await applyFilterExpr(clientContext, model, childExpr, tracks, negate));
                }
                tracks = uniqueTracks(subTracks);
            }
            break;
    }
    return tracks;
}
function uniqueTracks(tracks) {
    const map = new Map();
    for (const track of tracks) {
        map.set(track.id, track);
    }
    return [...map.values()];
}
async function llmFilter(model, description, tracks) {
    let prompt = "The following is a numbered list of music tracks, one track per line\n";
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        prompt += `${i}: ${track.name}\n`;
    }
    prompt += `Use the following TypeScript type to output the track names that match the description ${description}:
    type Matches = {
        trackNumbers: number[];
    };\n`;
    prompt += `Here is a JSON object of type Matches containing the track numbers of the tracks that match ${description}:\n`;
    const ret = await model.complete(prompt);
    return ret;
}
// the remainder is for testing
const testFilters = [
    "artist:elton john OR artist: bach",
    "genre:baroque AND description:animals",
    "genre:baroque OR description:animals",
    "genre:baroque OR description:animals OR artist:bach",
    "genre:baroque OR (description:animals OR artist:bach)",
    "genre:baroque (description :   animals OR artist: bach)",
    "genre:baroque artist:toscanini (description:animals OR artist:bach AND artist:swift)",
    "genre:baroque artist:toscanini year: 1941 (description:animals OR artist:bach AND artist:swift)",
    "genre:grunge artist:cobain year: 1992-1997 OR (description:animals AND artist:swift)",
    "genre:grunge artist:cobain year: 1992-1997 OR (description:animals AND artist:swift) OR (genre:baroque AND artist:bach)",
];
export function tests() {
    for (const filter of testFilters) {
        const result = parseFilter(filter);
        console.log(filter);
        if (result.diagnostics) {
            console.log(result.diagnostics);
        }
        else if (result.ast) {
            console.log(filterNodeToString(result.ast));
        }
    }
}
//# sourceMappingURL=trackFilter.js.map