// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { error } from "typechat";
import registerDebug from "debug";
const debugAgent = registerDebug("typeagent:typechatagent:correction");
// TODO: probably most (all?) of these can be integrated into TypeChat
export class TypeChatAgent {
    constructor(resultName, createTranslator, createPromptPreamble, createRequest, validate, correctionAttempt = TypeChatAgent.defaultCorrectionAttempt) {
        this.resultName = resultName;
        this.createTranslator = createTranslator;
        this.createPromptPreamble = createPromptPreamble;
        this.createRequest = createRequest;
        this.validate = validate;
        this.correctionAttempt = correctionAttempt;
    }
    get translator() {
        if (this._translator === undefined) {
            this._translator = this.createTranslator();
            this._translator.stripNulls = true;
        }
        return this._translator;
    }
    async run(input, config) {
        const promptPreamble = this.createPromptPreamble(input);
        let result = await this.translator.translate(this.createRequest(input), promptPreamble);
        let attempt = 0;
        const corrections = [];
        while (result.success) {
            if (!this.validate) {
                break;
            }
            let error;
            let message;
            try {
                error = this.validate(input, result.data, config);
            }
            catch (e) {
                message = e.message;
                error = e.message;
            }
            if (error === undefined) {
                break;
            }
            corrections.push({ data: result.data, correction: error });
            if (message !== undefined || attempt >= this.correctionAttempt) {
                return {
                    success: false,
                    message: message ??
                        `${this.resultName} error: correction failed after ${attempt} attempts`,
                    corrections,
                };
            }
            attempt++;
            debugAgent(`Attempting to correct ${this.resultName} (${attempt}): \n  ${Array.isArray(error) ? `${error.join("\n  ")}` : error}`);
            result = await this.correct(input, result.data, error, promptPreamble);
        }
        if (corrections.length > 0) {
            result.corrections = corrections;
        }
        return result;
    }
    createCorrectionPrompt(correction) {
        return (`The ${this.resultName} is incorrect for the following reason${Array.isArray(correction) && correction.length > 1 ? "s" : ""}:\n` +
            `"""\n${Array.isArray(correction) ? correction.join("\n") : correction}\n"""\n` +
            `The following is the revised result:\n`);
    }
    toPromptSections(prompt) {
        return typeof prompt === "string"
            ? [{ role: "user", content: prompt }]
            : prompt ?? [];
    }
    async followUp(request, result, followUpPrompt, promptPreamble) {
        const preamble = this.toPromptSections(promptPreamble);
        const followUpPromptSections = this.toPromptSections(followUpPrompt);
        const prompt = [
            ...preamble,
            {
                role: "user",
                content: this.translator.createRequestPrompt(request),
            },
            {
                role: "assistant",
                content: JSON.stringify(result, undefined, 2),
            },
            ...followUpPromptSections,
        ];
        return this.completeAndValidate(prompt);
    }
    stripNulls(obj) {
        let keysToDelete;
        for (const k in obj) {
            const value = obj[k];
            if (value === null) {
                (keysToDelete ??= []).push(k);
            }
            else {
                if (Array.isArray(value)) {
                    if (value.some((x) => x === null)) {
                        obj[k] = value.filter((x) => x !== null);
                    }
                }
                if (typeof value === "object") {
                    this.stripNulls(value);
                }
            }
        }
        if (keysToDelete) {
            for (const k of keysToDelete) {
                delete obj[k];
            }
        }
    }
    async completeAndValidate(prompt) {
        let attemptRepair = this.translator.attemptRepair;
        while (true) {
            const response = await this.translator.model.complete(prompt);
            if (!response.success) {
                return response;
            }
            const responseText = response.data;
            const startIndex = responseText.indexOf("{");
            const endIndex = responseText.lastIndexOf("}");
            if (!(startIndex >= 0 && endIndex > startIndex)) {
                return error(`Response is not JSON:\n${responseText}`);
            }
            const jsonText = responseText.slice(startIndex, endIndex + 1);
            let jsonObject;
            try {
                jsonObject = JSON.parse(jsonText);
            }
            catch (e) {
                return error(e instanceof SyntaxError ? e.message : "JSON parse error");
            }
            if (this.translator.stripNulls) {
                this.stripNulls(jsonObject);
            }
            const schemaValidation = this.translator.validator.validate(jsonObject);
            const validation = schemaValidation.success
                ? this.translator.validateInstance(schemaValidation.data)
                : schemaValidation;
            if (validation.success) {
                return validation;
            }
            if (!attemptRepair) {
                return error(`JSON validation failed: ${validation.message}\n${jsonText}`);
            }
            prompt.push({ role: "assistant", content: responseText });
            prompt.push({
                role: "user",
                content: this.translator.createRepairPrompt(validation.message),
            });
            attemptRepair = false;
        }
    }
    async correct(input, result, correction, promptPreamble) {
        return this.followUp(this.createRequest(input), result, this.createCorrectionPrompt(correction), promptPreamble ?? this.createPromptPreamble(input));
    }
}
TypeChatAgent.defaultCorrectionAttempt = 3;
export class SequentialTypeChatAgents {
    constructor(agent1, agent2) {
        this.agent1 = agent1;
        this.agent2 = agent2;
    }
    async run(input, config) {
        const result1 = await this.agent1.run(input, config);
        if (!result1.success) {
            return result1;
        }
        const result2 = await this.agent2.run([input, result1.data], config);
        if (result2.corrections) {
            // includes the data from agent1 in corrections
            result2.corrections.forEach((correction) => {
                correction.data = [result1.data, correction.data];
            });
        }
        if (!result2.success) {
            return result2;
        }
        const corrections = [];
        if (result1.corrections) {
            corrections.push(...result1.corrections);
        }
        if (result2.corrections) {
            corrections.push(...result2.corrections);
        }
        const result = {
            success: true,
            data: [result1.data, result2.data],
        };
        if (corrections.length !== 0) {
            result.corrections = corrections;
        }
        return result;
    }
    validate(input, result, config) {
        const error1 = this.agent1.validate?.(input, result[0], config);
        if (error1 !== undefined) {
            return error1;
        }
        const error2 = this.agent2.validate?.([input, result[0]], result[1], config);
        if (error2 !== undefined) {
            return error2;
        }
        return undefined;
    }
}
//# sourceMappingURL=typeChatAgent.js.map