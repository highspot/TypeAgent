// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../../../.env", import.meta.url) });
import { getPackageFilePath } from "../src/utils/getPackageFilePath.js";
import { getDefaultAppAgentProviders } from "../src/defaultAgentProviders.js";
import { createDispatcher } from "agent-dispatcher";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const repeat = 5;
const defaultAppAgentProviders = getDefaultAppAgentProviders(undefined);
const embeddingCacheDir = path.join(os.tmpdir(), ".typeagent", "cache");
export async function defineTranslateTest(name, dataFiles) {
    const inputs = (await Promise.all(dataFiles.map(async (f) => {
        return JSON.parse(await fs.promises.readFile(getPackageFilePath(f), "utf-8"));
    }))).flat();
    const inputsWithName = inputs.map((i) => [
        Array.isArray(i)
            ? i.map((i) => i.request).join("|")
            : i.request,
        i,
    ]);
    describe(`${name} action stability`, () => {
        let dispatchers = [];
        async function runOnDispatchers(fn) {
            const p = dispatchers.map(fn);
            // Make sure all promise finished before checking the result
            await Promise.allSettled(p);
            // Propagate any errors
            await Promise.all(p);
        }
        beforeAll(async () => {
            for (let i = 0; i < repeat; i++) {
                dispatchers.push(await createDispatcher("cli test translate", {
                    appAgentProviders: defaultAppAgentProviders,
                    agents: {
                        actions: false,
                        commands: ["dispatcher"],
                    },
                    execution: { history: false }, // don't generate chat history, the test manually imports them
                    explainer: { enabled: false },
                    cache: { enabled: false },
                    embeddingCacheDir, // Cache the embedding to avoid recomputation.
                    collectCommandResult: true,
                }));
            }
        });
        beforeEach(async () => {
            await runOnDispatchers(async (dispatcher) => {
                const result = await dispatcher.processCommand("@history clear");
                expect(result?.hasError).toBeFalsy();
            });
        });
        it.each(inputsWithName)(`${name} %p`, async (_, test) => {
            const steps = Array.isArray(test) ? test : [test];
            await runOnDispatchers(async (dispatcher) => {
                for (const step of steps) {
                    const { request, action, match, history, attachments } = step;
                    const result = await dispatcher.processCommand(request, undefined, attachments);
                    expect(result?.hasError).toBeFalsy();
                    const actions = result?.actions;
                    expect(actions).toBeDefined();
                    const expectedValues = Array.isArray(action)
                        ? action
                        : [action];
                    expect(actions).toHaveLength(expectedValues.length);
                    for (let i = 0; i < expectedValues.length; i++) {
                        const action = actions[i];
                        const expected = expectedValues[i];
                        if (typeof expected === "string") {
                            const actualFullActionName = `${action.translatorName}.${action.actionName}`;
                            if (match === "partial") {
                                expect(actualFullActionName).toContain(expected);
                            }
                            else {
                                expect(actualFullActionName).toBe(expected);
                            }
                        }
                        else {
                            if (match === "partial") {
                                expect(action).toMatchObject(expected);
                            }
                            else {
                                expect(action).toEqual(expected);
                            }
                        }
                    }
                    if (history !== undefined) {
                        const insertResult = await dispatcher.processCommand(`@history insert ${JSON.stringify({ user: request, assistant: history })}`);
                        expect(insertResult?.hasError).toBeFalsy();
                    }
                }
            });
        });
        afterAll(async () => {
            await runOnDispatchers((d) => d.close());
            dispatchers = [];
        });
    });
}
//# sourceMappingURL=translateTestCommon.js.map