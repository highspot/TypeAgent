// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { getToggleCommandHandlers, getToggleHandlerTable, } from "../../../command/handlerUtils.js";
import { changeContextConfig, } from "../../commandHandlerContext.js";
import { getAppAgentName } from "../../../translation/agentTranslators.js";
import { getServiceHostCommandHandlers } from "./serviceHost/serviceHostCommandHandler.js";
import { simpleStarRegex } from "common-utils";
import { openai as ai, getChatModelNames } from "aiclient";
import chalk from "chalk";
import { displayResult, displayWarn, } from "@typeagent/agent-sdk/helpers/display";
import { alwaysEnabledAgents } from "../../appAgentManager.js";
import { getCacheFactory } from "../../../utils/cacheFactory.js";
import { resolveCommand } from "../../../command/command.js";
import child_process from "node:child_process";
import { fileURLToPath } from "node:url";
const AgentToggleDescription = [
    "agent schemas",
    "agent actions",
    "agent commands",
    "agents",
];
const penLauncherPath = new URL("../../../../../../../dotnet/penLauncher/bin/Debug/net9.0/penLauncher.exe", import.meta.url);
function getAgentToggleOptions(toggle, options, schemaNames) {
    switch (toggle) {
        case 0 /* AgentToggle.Schema */:
            for (const name of alwaysEnabledAgents.schemas) {
                delete options[name];
            }
            return { schemas: options };
        case 1 /* AgentToggle.Action */:
            for (const name of alwaysEnabledAgents.actions) {
                delete options[name];
            }
            return { actions: options };
        case 2 /* AgentToggle.Command */:
            for (const name of alwaysEnabledAgents.commands) {
                delete options[name];
            }
            return { commands: options };
        case 3 /* AgentToggle.Agent */:
            const schemaOptions = Object.fromEntries(schemaNames.map((name) => [
                name,
                options[getAppAgentName(name)],
            ]));
            const actionOptions = { ...schemaOptions };
            for (const name of alwaysEnabledAgents.schemas) {
                delete schemaOptions[name];
            }
            for (const name of alwaysEnabledAgents.actions) {
                delete actionOptions[name];
            }
            for (const name of alwaysEnabledAgents.commands) {
                delete options[name];
            }
            return {
                schemas: schemaOptions,
                actions: actionOptions,
                commands: options,
            };
    }
}
function setAgentToggleOption(existingNames, existingNameType, options, nameOrPattern, enable) {
    for (const name of nameOrPattern) {
        if (name.includes("*")) {
            const regExp = simpleStarRegex(name);
            const matchedNames = existingNames.filter((name) => regExp.test(name));
            if (matchedNames.length === 0) {
                throw new Error(`Invalid ${existingNameType} name pattern '${name}'`);
            }
            for (const name of matchedNames) {
                if (options[name] === !enable) {
                    throw new Error(`Conflicting setting for ${existingNameType} name '${name}'`);
                }
                options[name] = enable;
            }
        }
        else {
            if (!existingNames.includes(name)) {
                throw new Error(`Invalid ${existingNameType} name '${name}'`);
            }
            if (options[name] === !enable) {
                throw new Error(`Conflicting setting for ${existingNameType} name '${name}'`);
            }
            options[name] = enable;
        }
    }
}
function getDefaultStr(changes, kind, name) {
    if (changes === undefined) {
        return "";
    }
    const change = changes[kind]?.[name];
    if (change === undefined) {
        return undefined;
    }
    return change === null ? " (default)" : "";
}
function setStatus(status, kind, name, enable, active, changes) {
    if (enable === null) {
        return;
    }
    const defaultStr = getDefaultStr(changes, kind, name);
    if (defaultStr === undefined) {
        return;
    }
    if (status[name] === undefined) {
        status[name] = {};
        const appAgentName = getAppAgentName(name);
        if (appAgentName !== name && status[appAgentName] === undefined) {
            // Make sure we have a row for the app agent name even if it doesn't have any status for grouping
            status[appAgentName] = {};
        }
    }
    const statusChar = enable === undefined ? "❔" : enable ? (active ? "✅" : "💤") : "❌";
    status[name][kind] = `${statusChar}${defaultStr}`;
}
function showAgentStatus(toggle, context, changes) {
    const systemContext = context.sessionContext.agentContext;
    const agents = systemContext.agents;
    const status = {};
    const showSchema = toggle === 0 /* AgentToggle.Schema */ || toggle === 3 /* AgentToggle.Agent */;
    const showAction = toggle === 1 /* AgentToggle.Action */ || toggle === 3 /* AgentToggle.Agent */;
    const showCommand = toggle === 2 /* AgentToggle.Command */ || toggle === 3 /* AgentToggle.Agent */;
    if (showSchema || showAction) {
        for (const name of agents.getSchemaNames()) {
            if (showSchema) {
                const state = agents.isSchemaEnabled(name);
                const active = agents.isSchemaActive(name);
                setStatus(status, "schemas", name, state, active, changes);
            }
            if (showAction) {
                const state = agents.isActionEnabled(name);
                const active = agents.isActionActive(name);
                setStatus(status, "actions", name, state, active, changes);
            }
        }
    }
    if (showCommand) {
        for (const name of agents.getAppAgentNames()) {
            const state = agents.getCommandEnabledState(name);
            setStatus(status, "commands", name, state, true, changes);
        }
    }
    const entries = Object.entries(status).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0) {
        displayWarn(changes ? "No changes" : "No agents", context);
        return;
    }
    const getRow = (emoji, displayName, schemas, actions, commands) => {
        const displayEntry = [emoji, displayName];
        if (showSchema) {
            displayEntry.push(schemas ?? "");
        }
        if (showAction) {
            displayEntry.push(actions ?? "");
        }
        if (showCommand) {
            displayEntry.push(commands ?? "");
        }
        return displayEntry;
    };
    const table = [
        getRow("", "Agent", "Schemas", "Actions", "Commands"),
    ];
    for (const [name, { schemas, actions, commands }] of entries) {
        const isAppAgentName = getAppAgentName(name) === name;
        const displayName = isAppAgentName ? name : `  ${name}`;
        const emoji = isAppAgentName ? agents.getEmojis()[name] : "";
        table.push(getRow(emoji, displayName, schemas, actions, commands));
    }
    displayResult(table, context);
}
class AgentToggleCommandHandler {
    constructor(toggle) {
        this.toggle = toggle;
        this.description = `Toggle ${AgentToggleDescription[this.toggle]}`;
        this.parameters = {
            flags: {
                reset: {
                    description: "reset to default",
                    char: "r",
                    type: "boolean",
                    default: false,
                },
                off: {
                    description: "disable pattern",
                    multiple: true,
                    char: "x",
                },
            },
            args: {
                agentNames: {
                    description: "enable pattern",
                    multiple: true,
                    optional: true,
                },
            },
        };
    }
    async run(context, params) {
        const systemContext = context.sessionContext.agentContext;
        const agents = systemContext.agents;
        const options = {};
        const schemaNames = agents.getSchemaNames();
        let existingNames;
        let existingNameType;
        if (this.toggle == 2 /* AgentToggle.Command */ ||
            this.toggle === 3 /* AgentToggle.Agent */) {
            existingNames = agents.getAppAgentNames();
            existingNameType = "agent";
        }
        else {
            existingNames = schemaNames;
            existingNameType = "schema";
        }
        let hasParams = false;
        if (params.flags.reset) {
            hasParams = true;
            for (const name of existingNames) {
                options[name] = null; // default value
            }
        }
        if (params.flags.off) {
            hasParams = true;
            setAgentToggleOption(existingNames, existingNameType, options, params.flags.off, false);
        }
        if (params.args.agentNames) {
            hasParams = true;
            setAgentToggleOption(existingNames, existingNameType, options, params.args.agentNames, true);
        }
        if (!hasParams) {
            showAgentStatus(this.toggle, context);
            return;
        }
        const changed = await changeContextConfig(getAgentToggleOptions(this.toggle, options, schemaNames), context);
        if (changed === undefined) {
            displayWarn("No change", context);
        }
        else {
            showAgentStatus(this.toggle, context, changed);
        }
    }
    async getCompletion(context, params, names) {
        const completions = [];
        for (const name of names) {
            if (name === "agentNames" || name === "--off") {
                const existingNames = this.toggle === 2 /* AgentToggle.Command */ ||
                    this.toggle === 3 /* AgentToggle.Agent */
                    ? context.agentContext.agents.getAppAgentNames()
                    : context.agentContext.agents.getSchemaNames();
                completions.push(...existingNames);
            }
        }
        return completions;
    }
}
class ExplainerCommandHandler {
    constructor() {
        this.description = "Set explainer";
        this.parameters = {
            args: {
                explainerName: {
                    description: "name of the explainer",
                },
            },
        };
    }
    async run(context, params) {
        const current = context.sessionContext.agentContext.session.getConfig().explainer
            .name;
        if (current === params.args.explainerName) {
            displayWarn(`Explainer is already set to ${params.args.explainerName}`, context);
            return;
        }
        const changed = await changeContextConfig({ explainer: { name: params.args.explainerName } }, context);
        if (changed?.explainer?.name === params.args.explainerName) {
            displayResult(`Explainer is set to ${params.args.explainerName}`, context);
        }
        else {
            displayWarn(`Explainer is unchanged`, context);
        }
    }
    async getCompletion(context, params, names) {
        const completions = [];
        for (const name of names) {
            if (name === "explainerName") {
                completions.push(...getCacheFactory().getExplainerNames());
            }
        }
        return completions;
    }
}
function getConfigModel(kind, model) {
    const settings = ai.getChatModelSettings(model);
    return `Current ${chalk.cyan(kind)} model: ${model ? model : "(default)"}\nURL:${settings.endpoint}`;
}
class ConfigModelSetCommandHandler {
    constructor(kind) {
        this.kind = kind;
        this.description = "Set model";
        this.parameters = {
            flags: {
                reset: {
                    description: "Reset to default model",
                    char: "r",
                    type: "boolean",
                    default: false,
                },
            },
            args: {
                model: {
                    description: "Model name",
                    optional: true,
                },
            },
        };
    }
    async run(context, params) {
        const reset = params.flags.reset;
        const model = params.args.model;
        if (reset || model === "") {
            if (model !== undefined && model !== "") {
                throw new Error("Model name is not allowed with reset option");
            }
            const config = {};
            config[this.kind] = { model: "" };
            await changeContextConfig(config, context);
            displayResult(`Reset to default model for ${this.kind}`, context);
            return;
        }
        if (model === undefined) {
            const config = context.sessionContext.agentContext.session.getConfig();
            displayResult(getConfigModel(this.kind, config[this.kind].model), context);
            return;
        }
        const modelNames = await getChatModelNames();
        if (!modelNames.includes(model)) {
            throw new Error(`Invalid model name: ${model}\nValid model names: ${modelNames.join(", ")}`);
        }
        else {
            displayResult(`Model for ${this.kind} is set to ${model}`, context);
        }
        const config = {};
        config[this.kind] = { model };
        await changeContextConfig(config, context);
    }
    async getCompletion(context, params, names) {
        if (params.args?.model === undefined) {
            return getChatModelNames();
        }
        return [];
    }
}
class ConfigTranslationNumberOfInitialActionsCommandHandler {
    constructor() {
        this.description = "Set number of actions to use for initial translation";
        this.parameters = {
            args: {
                count: {
                    description: "Number of actions",
                    type: "number",
                },
            },
        };
    }
    async run(context, params) {
        const count = params.args.count;
        if (count < 0) {
            throw new Error("Count must be positive integer");
        }
        await changeContextConfig({
            translation: {
                schema: {
                    optimize: {
                        numInitialActions: count,
                    },
                },
            },
        }, context);
        displayResult(`Number of actions to use for initial translation is set to ${count}`, context);
    }
}
class FixedSchemaCommandHandler {
    constructor() {
        this.description = "Set a fixed schema disable switching";
        this.parameters = {
            args: {
                schemaName: {
                    description: "name of the schema",
                },
            },
        };
    }
    async run(context, params) {
        const schemaName = params.args.schemaName;
        const systemContext = context.sessionContext.agentContext;
        if (!systemContext.agents.isActionActive(schemaName)) {
            throw new Error(`Schema '${schemaName}' is not active.`);
        }
        await changeContextConfig({
            translation: {
                switch: {
                    embedding: false,
                    inline: false,
                    search: false,
                },
            },
        }, context);
        context.sessionContext.agentContext.lastActionSchemaName = schemaName;
        displayResult(`Switching schema disabled. Schema is fixed set to '${schemaName}'`, context);
    }
    async getCompletion(context, params, names) {
        const completions = [];
        const systemContext = context.agentContext;
        for (const name of names) {
            if (name === "schemaName") {
                return systemContext.agents.getActiveSchemas();
            }
        }
        return completions;
    }
}
class HistoryLimitCommandHandler {
    constructor() {
        this.description = "Set the limit of chat history usage in translation";
        this.parameters = {
            args: {
                limit: {
                    description: "Number of actions",
                    type: "number",
                },
            },
        };
    }
    async run(context, params) {
        const limit = params.args.limit;
        if (limit < 0) {
            throw new Error("Limit must be positive integer");
        }
        await changeContextConfig({
            translation: {
                history: {
                    limit: limit,
                },
            },
        }, context);
        displayResult(`Chat history used in translation limit is set to ${limit}`, context);
    }
}
const configTranslationCommandHandlers = {
    description: "Translation configuration",
    defaultSubCommand: "on",
    commands: {
        ...getToggleCommandHandlers("translation", async (context, enable) => {
            await changeContextConfig({ translation: { enabled: enable } }, context);
        }),
        model: new ConfigModelSetCommandHandler("translation"),
        multi: {
            description: "multiple actions",
            commands: {
                ...getToggleCommandHandlers("multiple action translation", async (context, enable) => {
                    await changeContextConfig({ translation: { multiple: { enabled: enable } } }, context);
                }),
                result: getToggleHandlerTable("result id in multiple action", async (context, enable) => {
                    await changeContextConfig({ translation: { multiple: { result: enable } } }, context);
                }),
                pending: getToggleHandlerTable("pending request in multiple action", async (context, enable) => {
                    await changeContextConfig({ translation: { multiple: { pending: enable } } }, context);
                }),
            },
        },
        switch: {
            description: "auto switch schemas",
            commands: {
                ...getToggleCommandHandlers("switch schema", async (context, enable) => {
                    await changeContextConfig({
                        translation: {
                            switch: {
                                embedding: enable,
                                inline: enable,
                                search: enable,
                            },
                        },
                    }, context);
                }),
                fix: new FixedSchemaCommandHandler(),
                inline: getToggleHandlerTable("inject inline switch", async (context, enable) => {
                    await changeContextConfig({
                        translation: {
                            switch: {
                                inline: enable,
                            },
                        },
                    }, context);
                }),
                search: getToggleHandlerTable("search switch", async (context, enable) => {
                    await changeContextConfig({
                        translation: {
                            switch: {
                                search: enable,
                            },
                        },
                    }, context);
                }),
                embedding: getToggleHandlerTable("Use embedding for initial pick of schema", async (context, enable) => {
                    await changeContextConfig({
                        translation: {
                            switch: {
                                embedding: enable,
                            },
                        },
                    }, context);
                }),
            },
        },
        history: {
            description: "Configure chat history usage in translation",
            commands: {
                ...getToggleCommandHandlers("history", async (context, enable) => {
                    await changeContextConfig({ translation: { history: { enabled: enable } } }, context);
                }),
                limit: new HistoryLimitCommandHandler(),
            },
        },
        stream: getToggleHandlerTable("streaming translation", async (context, enable) => {
            await changeContextConfig({ translation: { stream: enable } }, context);
        }),
        schema: {
            description: "Action schema configuration",
            commands: {
                generation: {
                    description: "Generated action schema",
                    commands: {
                        ...getToggleCommandHandlers("generated action schema", async (context, enable) => {
                            await changeContextConfig({
                                translation: {
                                    schema: {
                                        generation: {
                                            enabled: enable,
                                        },
                                    },
                                },
                            }, context);
                        }),
                        json: getToggleHandlerTable("use generate json schema if model supports it", async (context, enable) => {
                            await changeContextConfig({
                                translation: {
                                    schema: {
                                        generation: {
                                            jsonSchema: enable,
                                        },
                                    },
                                },
                            }, context);
                        }),
                        jsonFunc: getToggleHandlerTable("use generate json schema function if model supports it", async (context, enable) => {
                            await changeContextConfig({
                                translation: {
                                    schema: {
                                        generation: {
                                            jsonSchemaFunction: enable,
                                        },
                                    },
                                },
                            }, context);
                        }),
                    },
                },
                optimize: {
                    description: "Optimize schema",
                    commands: {
                        ...getToggleCommandHandlers("schema optimization", async (context, enable) => {
                            await changeContextConfig({
                                translation: {
                                    schema: {
                                        optimize: {
                                            enabled: enable,
                                        },
                                    },
                                },
                            }, context);
                        }),
                        actions: new ConfigTranslationNumberOfInitialActionsCommandHandler(),
                    },
                },
            },
        },
    },
};
async function checkRequestHandler(appAgentName, systemContext, throwIfFailed = true) {
    const result = await resolveCommand(`${appAgentName} request`, systemContext);
    if (result.descriptor === undefined) {
        if (throwIfFailed) {
            throw new Error(`AppAgent '${appAgentName}' doesn't have request command handler`);
        }
        return false;
    }
    const args = result.descriptor.parameters?.args;
    if (args === undefined) {
        if (throwIfFailed) {
            throw new Error(`AppAgent '${appAgentName}' request command handler doesn't accept any parameter for natural language requests`);
        }
        return false;
    }
    const entries = Object.entries(args);
    if (entries.length !== 1 || entries[0][1].implicitQuotes !== true) {
        if (throwIfFailed) {
            throw new Error(`AppAgent '${appAgentName}' request command handler doesn't accept parameters resembling natural language requests`);
        }
        return false;
    }
    return true;
}
class ConfigRequestCommandHandler {
    constructor() {
        this.description = "Set the agent that handle natural language requests";
        this.parameters = {
            args: {
                appAgentName: {
                    description: "name of the agent",
                },
            },
        };
    }
    async run(context, params) {
        const appAgentName = params.args.appAgentName;
        const systemContext = context.sessionContext.agentContext;
        const current = systemContext.session.getConfig().request;
        if (current === appAgentName) {
            displayWarn(`Natural langue request handling agent is already set to '${appAgentName}'`, context);
            return;
        }
        await checkRequestHandler(appAgentName, systemContext);
        await changeContextConfig({ request: appAgentName }, context);
        displayResult(`Natural langue request handling agent is set to '${appAgentName}'`, context);
    }
    async getCompletion(context, params, names) {
        const completions = [];
        const systemContext = context.agentContext;
        for (const name of names) {
            if (name === "appAgentName") {
                for (const appAgentName of systemContext.agents.getAppAgentNames()) {
                    if (await checkRequestHandler(appAgentName, systemContext, false)) {
                        completions.push(appAgentName);
                    }
                }
            }
        }
        return completions;
    }
}
export function getConfigCommandHandlers() {
    return {
        description: "Configuration commands",
        commands: {
            schema: new AgentToggleCommandHandler(0 /* AgentToggle.Schema */),
            action: new AgentToggleCommandHandler(1 /* AgentToggle.Action */),
            command: new AgentToggleCommandHandler(2 /* AgentToggle.Command */),
            agent: new AgentToggleCommandHandler(3 /* AgentToggle.Agent */),
            request: new ConfigRequestCommandHandler(),
            translation: configTranslationCommandHandlers,
            explainer: {
                description: "Explainer configuration",
                defaultSubCommand: "on",
                commands: {
                    ...getToggleCommandHandlers("explanation", async (context, enable) => {
                        await changeContextConfig({ explainer: { enabled: enable } }, context);
                    }),
                    async: getToggleHandlerTable("asynchronous explanation", async (context, enable) => {
                        context.sessionContext.agentContext.explanationAsynchronousMode =
                            enable;
                    }),
                    name: new ExplainerCommandHandler(),
                    model: new ConfigModelSetCommandHandler("explainer"),
                    filter: {
                        description: "Toggle explanation filter",
                        defaultSubCommand: "on",
                        commands: {
                            ...getToggleCommandHandlers("all explanation filters", async (context, enable) => {
                                await changeContextConfig({
                                    explainer: {
                                        filter: {
                                            multiple: enable,
                                            reference: {
                                                value: enable,
                                                list: enable,
                                                translate: enable,
                                            },
                                        },
                                    },
                                }, context);
                            }),
                            multiple: getToggleHandlerTable("explanation filter multiple actions", async (context, enable) => {
                                await changeContextConfig({
                                    explainer: {
                                        filter: {
                                            multiple: enable,
                                        },
                                    },
                                }, context);
                            }),
                            reference: {
                                description: "Toggle reference filter",
                                defaultSubCommand: "on",
                                commands: {
                                    ...getToggleCommandHandlers("all explanation reference filters", async (context, enable) => {
                                        await changeContextConfig({
                                            explainer: {
                                                filter: {
                                                    reference: {
                                                        value: enable,
                                                        list: enable,
                                                        translate: enable,
                                                    },
                                                },
                                            },
                                        }, context);
                                    }),
                                    value: getToggleHandlerTable("explainer filter reference by value in the request", async (context, enable) => {
                                        await changeContextConfig({
                                            explainer: {
                                                filter: {
                                                    reference: {
                                                        value: enable,
                                                    },
                                                },
                                            },
                                        }, context);
                                    }),
                                    list: getToggleHandlerTable("explainer filter reference using word lists", async (context, enable) => {
                                        await changeContextConfig({
                                            explainer: {
                                                filter: {
                                                    reference: {
                                                        list: enable,
                                                    },
                                                },
                                            },
                                        }, context);
                                    }),
                                    translate: getToggleHandlerTable("explainer filter reference by translate without context", async (context, enable) => {
                                        await changeContextConfig({
                                            explainer: {
                                                filter: {
                                                    reference: {
                                                        translate: enable,
                                                    },
                                                },
                                            },
                                        }, context);
                                    }),
                                },
                            },
                        },
                    },
                },
            },
            serviceHost: getServiceHostCommandHandlers(),
            dev: getToggleHandlerTable("development mode", async (context, enable) => {
                context.sessionContext.agentContext.developerMode = enable;
            }),
            log: {
                description: "Toggle logging",
                commands: {
                    db: getToggleHandlerTable("logging", async (context, enable) => {
                        context.sessionContext.agentContext.dblogging =
                            false;
                    }),
                },
            },
            pen: {
                description: "Toggles click note pen handler.",
                defaultSubCommand: "on",
                commands: getToggleCommandHandlers("Surface Pen Click Handler", async (isContext, enable) => {
                    if (enable) {
                        spawnPenLauncherProcess("--register");
                    }
                    else {
                        spawnPenLauncherProcess("--unregister");
                    }
                }),
            },
        },
    };
}
async function spawnPenLauncherProcess(args) {
    return new Promise((resolve, reject) => {
        const child = child_process.spawn(fileURLToPath(penLauncherPath), [
            args,
        ]);
        child.on("error", (err) => {
            reject(err);
        });
        child.on("spawn", () => {
            resolve(child);
        });
    });
}
//# sourceMappingURL=configCommandHandlers.js.map