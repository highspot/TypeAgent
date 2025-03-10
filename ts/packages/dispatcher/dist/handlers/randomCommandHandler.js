// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from "node:fs";
import { randomInt } from "crypto";
import { processCommandNoLock } from "../command/command.js";
import { openai } from "aiclient";
import { createTypeChat, promptLib } from "typeagent";
import { AppAgentEvent } from "@typeagent/agent-sdk";
import { displayStatus } from "@typeagent/agent-sdk/helpers/display";
import { DispatcherName } from "./common/interactiveIO.js";
const UserRequestSchema = `export type UserRequestList = {
    messages: UserRequest[];
}

export type UserRequest = {
    // A request a user would make of an intelligent conversational computational interface.
    message: string;
};`;
class RandomOfflineCommandHandler {
    constructor() {
        this.description =
            "Issues a random request from a dataset of pre-generated requests.";
    }
    async run(context) {
        displayStatus(`Selecting random request...`, context);
        if (this.list == undefined) {
            this.list = await this.getRequests();
        }
        const randomRequest = this.list[randomInt(0, this.list.length)];
        const systemContext = context.sessionContext.agentContext;
        systemContext.clientIO.notify(
            "randomCommandSelected",
            systemContext.requestId,
            {
                message: randomRequest,
            },
            DispatcherName,
        );
        systemContext.clientIO.notify(
            AppAgentEvent.Info,
            systemContext.requestId,
            randomRequest,
            DispatcherName,
        );
        await processCommandNoLock(randomRequest, systemContext);
    }
    async getRequests() {
        if (fs.existsSync("../dispatcher/data/requests.txt")) {
            const content = await fs.promises.readFile(
                "../dispatcher/data/requests.txt",
                "utf-8",
            );
            return content.split("\n");
        }
        return new Array();
    }
}
class RandomOnlineCommandHandler {
    constructor() {
        this.instructions = `You are an Siri/Alexa/Cortana prompt generator. You create user prompts that are both supported and unsupported.`;
        this.description = "Uses the LLM to generate random requests.";
    }
    async run(context) {
        displayStatus(`Generating random request using LLM...`, context);
        //
        // Create Model
        //
        let chatModel = this.createModel();
        //
        // Create Chat History
        //
        let maxContextLength = 8196; // characters
        let maxWindowLength = 30;
        let chatHistory = [];
        const chat = createTypeChat(
            chatModel,
            UserRequestSchema,
            "UserRequestList",
            this.instructions,
            chatHistory,
            maxContextLength,
            maxWindowLength,
            (data) => data.messages.toString(),
        );
        const response = await this.getTypeChatResponse(
            "Generate 10 random user requests.",
            chat,
        );
        if (response.success) {
            const message =
                response.data.messages[
                    randomInt(0, response.data.messages.length)
                ].message;
            const systemContext = context.sessionContext.agentContext;
            systemContext.clientIO.notify(
                "randomCommandSelected",
                systemContext.requestId,
                {
                    message: message,
                },
                DispatcherName,
            );
            await processCommandNoLock(message, systemContext);
        } else {
            throw new Error(response.message);
        }
    }
    async getTypeChatResponse(userInput, chat) {
        const chatResponse = await chat.translate(
            userInput,
            promptLib.dateTimePrompt(),
        );
        return chatResponse;
    }
    createModel() {
        let apiSettings;
        if (!apiSettings) {
            // Create default model
            apiSettings = openai.apiSettingsFromEnv();
        }
        let completionSettings = {
            temperature: 1.0,
            max_tokens: 1000, // Max response tokens
            response_format: { type: "json_object" }, // createChatModel will remove it if the model doesn't support it
        };
        const chatModel = openai.createChatModel(
            apiSettings,
            completionSettings,
            undefined,
            ["randomCommandHandler"],
        );
        return chatModel;
    }
}
export function getRandomCommandHandlers() {
    return {
        description: "Random request commands",
        defaultSubCommand: "offline",
        commands: {
            online: new RandomOnlineCommandHandler(),
            offline: new RandomOfflineCommandHandler(),
        },
    };
}
//# sourceMappingURL=randomCommandHandler.js.map
