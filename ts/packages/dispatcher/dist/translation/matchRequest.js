// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { validateWildcardMatch } from "../execute/actionHandlers.js";
import registerDebug from "debug";
import { confirmTranslation } from "./confirmTranslation.js";
const debugConstValidation = registerDebug("typeagent:const:validation");
async function getValidatedMatch(matches, context) {
    for (const match of matches) {
        if (match.wildcardCharCount === 0) {
            return match;
        }
        if (await validateWildcardMatch(match, context)) {
            debugConstValidation(`Wildcard match accepted: ${match.match.actions}`);
            return match;
        }
        debugConstValidation(`Wildcard match rejected: ${match.match.actions}`);
    }
    return undefined;
}
export async function matchRequest(request, context, history) {
    const systemContext = context.sessionContext.agentContext;
    const constructionStore = systemContext.agentCache.constructionStore;
    if (constructionStore.isEnabled()) {
        const startTime = performance.now();
        const config = systemContext.session.getConfig();
        const activeSchemaNames = systemContext.agents.getActiveSchemas();
        const matches = constructionStore.match(request, {
            wildcard: config.cache.matchWildcard,
            rejectReferences: config.explainer.filter.reference.list,
            namespaceKeys: systemContext.agentCache.getNamespaceKeys(activeSchemaNames),
            history,
        });
        const elapsedMs = performance.now() - startTime;
        const match = await getValidatedMatch(matches, systemContext);
        if (match !== undefined) {
            const { requestAction, replacedAction } = await confirmTranslation(elapsedMs, "\uD83D\uDEA7" /* unicodeChar.constructionSign */, match.match, context);
            if (requestAction) {
                if (!systemContext.batchMode) {
                    systemContext.logger?.logEvent("match", {
                        elapsedMs,
                        request,
                        actions: requestAction.actions,
                        replacedAction,
                        developerMode: systemContext.developerMode,
                        translators: activeSchemaNames,
                        explainerName: systemContext.agentCache.explainerName,
                        matchWildcard: config.cache.matchWildcard,
                        allMatches: matches.map((m) => {
                            const { construction: _, match, ...rest } = m;
                            return { action: match.actions, ...rest };
                        }),
                        history,
                    });
                }
                return {
                    requestAction,
                    elapsedMs,
                    fromUser: replacedAction !== undefined,
                    fromCache: true,
                };
            }
            return requestAction;
        }
    }
    return undefined;
}
//# sourceMappingURL=matchRequest.js.map