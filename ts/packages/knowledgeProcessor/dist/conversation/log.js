// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function logSearchResponse(response, verbose = false) {
    console.log;
    logList([...response.allTopics()], "ul", "TOPICS");
    logEntities(response.getEntities(), verbose);
}
function logEntities(entities, verbose) {
    if (entities && entities.length > 0) {
        logTitle(`ENTITIES [${entities.length}]`);
        for (const entity of entities) {
            logEntity(entity, verbose);
            console.log();
        }
        console.log();
    }
}
function logEntity(entity, verbose) {
    if (entity) {
        console.log(entity.name.toUpperCase());
        logList(entity.type, "csv");
        if (verbose) {
            logList(entity.facets, "ul");
        }
    }
}
function logList(list, type = "ol", title) {
    if (list && list.length > 0) {
        if (title) {
            logTitle(`${title} [${list.length}]`);
        }
        switch (type) {
            default:
                for (let i = 0; i < list.length; ++i) {
                    console.log(list[i]);
                }
                break;
            case "ul":
                for (let i = 0; i < list.length; ++i) {
                    console.log("• " + list[i]);
                }
                break;
            case "csv":
            case "plain":
                const line = list.join(type === "plain" ? " " : ", ");
                console.log(line);
                break;
        }
    }
}
function logTitle(title) {
    console.log(title);
    console.log();
}
//# sourceMappingURL=log.js.map