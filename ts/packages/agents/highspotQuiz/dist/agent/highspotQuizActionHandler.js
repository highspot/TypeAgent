// Copyright (c) Highspot Inc.
import { AppAgentEvent, } from "@typeagent/agent-sdk";
import { createActionResultFromTextDisplay, } from "@typeagent/agent-sdk/helpers/action";
import { HighspotService } from "../service.js";
import chalk from "chalk";
import { generateQuiz } from "../quiz.js";
export function instantiate() {
    return {
        initializeAgentContext: initializeHighspotQuizContext,
        updateAgentContext: updateHighspotQuizContext,
        executeAction: executeHighspotQuizAction,
    };
}
async function initializeHighspotQuizContext() {
    return {
        highspot: undefined,
    };
}
async function executeHighspotQuizAction(action, context) {
    if (context.sessionContext.agentContext.highspot) {
        let result = await handleHighspotContentAction(action, context.sessionContext.agentContext);
        return result;
    }
}
async function enableHighspot(context) {
    const clientContext = new HighspotService();
    context.agentContext.highspot = clientContext;
    return clientContext.getAccessToken();
}
async function updateHighspotQuizContext(enable, context) {
    if (enable) {
        const accessToken = await enableHighspot(context);
        context.notify(AppAgentEvent.Info, chalk.blue(`Highspot integration enabled. Using token: ${accessToken}.`));
    }
    else {
        chalk.red("Highspot integration disabled.");
        context.agentContext.highspot = undefined;
    }
}
async function handleHighspotContentAction(action, context) {
    let result = undefined;
    let displayText = undefined;
    console.log(`Triggered: ${action.actionName}`);
    if (!context.highspot) {
        throw new Error("Highspot Service: no highspot");
    }
    switch (action.actionName) {
        case "generateQuiz":
            const numQuestions = action.parameters.num_questions;
            const title = action.parameters.quizTitle;
            const itemName = action.parameters.item;
            const quiz = await generateQuiz(numQuestions, title, itemName, context.highspot);
            context.quizes.push(quiz);
            displayText = `Quiz generated: ${title} with ${numQuestions} questions`;
            result = createActionResultFromTextDisplay(displayText);
            break;
    }
    return result;
}
//# sourceMappingURL=highspotQuizActionHandler.js.map