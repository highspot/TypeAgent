// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import registerDebug from "debug";
const debugConfig = registerDebug("typeagent:dispatcher:schema:config");
function collectActionConfigs(actionConfigs, manifest, schemaName, emojiChar, transient, schemaDefaultEnabled, actionDefaultEnabled) {
    transient = manifest.transient ?? transient; // inherit from parent if not specified
    schemaDefaultEnabled =
        manifest.schemaDefaultEnabled ??
            manifest.defaultEnabled ??
            schemaDefaultEnabled; // inherit from parent if not specified
    actionDefaultEnabled =
        manifest.actionDefaultEnabled ??
            manifest.defaultEnabled ??
            actionDefaultEnabled; // inherit from parent if not specified
    if (manifest.schema) {
        debugConfig(`Adding schema '${schemaName}'`);
        actionConfigs[schemaName] = {
            schemaName,
            emojiChar,
            ...manifest.schema,
            transient,
            schemaDefaultEnabled,
            actionDefaultEnabled,
        };
    }
    const subManifests = manifest.subActionManifests;
    if (subManifests) {
        for (const [subName, subManifest] of Object.entries(subManifests)) {
            if (!isValidSubSchemaName(subName)) {
                throw new Error(`Invalid sub-schema name: ${subName}`);
            }
            collectActionConfigs(actionConfigs, subManifest, `${schemaName}.${subName}`, emojiChar, transient, // propagate default transient
            schemaDefaultEnabled, // propagate default schemaDefaultEnabled
            actionDefaultEnabled);
        }
    }
}
function isValidSubSchemaName(schemaNamePart) {
    // . is use as a sub-schema separator
    // | is used in the cache as as multiple schema name separator
    // , is used in the cache as a separator between schema name and its hash
    return !/[.|,]/.test(schemaNamePart);
}
export function convertToActionConfig(name, config, actionConfigs = {}) {
    if (!isValidSubSchemaName(name)) {
        throw new Error(`Invalid schema name: ${name}`);
    }
    const emojiChar = config.emojiChar;
    collectActionConfigs(actionConfigs, config, name, emojiChar, false, // transient default to false if not specified
    true, // translationDefaultEnable default to true if not specified
    true);
    return actionConfigs;
}
//# sourceMappingURL=actionConfig.js.map