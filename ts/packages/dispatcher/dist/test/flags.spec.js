// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { parseParams } from "../src/command/parameters.js";
describe("Flag parsing", () => {
    const typeFlags = {
        flags: {
            bool: { description: "testing", type: "boolean" },
            num: { description: "testing", type: "number" },
            str: { description: "testing", type: "string" },
            obj: { description: "testing", type: "json" },
        },
    };
    const o1 = { hello: "str", num: 11, bool: true };
    const o2 = { ...o1, obj: o1, arr: [o1, o1] };
    it("type", () => {
        const params = parseParams("", typeFlags);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const bool = flags.bool; // Use ! to make sure the type is correct
        const num = flags.num; // Use ! to make sure the type is correct
        const str = flags.str; // Use ! to make sure the type is correct
        const obj = flags.obj; // Use ! to make sure the type is correct
        expect(bool).toBe(undefined);
        expect(num).toBe(undefined);
        expect(str).toBe(undefined);
        expect(obj).toBe(undefined);
    });
    it("type - with flags", () => {
        const params = parseParams(`--bool --num 11 --str world --obj '${JSON.stringify(o2)}'`, typeFlags);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const bool = flags.bool;
        const num = flags.num;
        const str = flags.str;
        const obj = flags.obj;
        expect(bool).toBe(true);
        expect(num).toBe(11);
        expect(str).toBe("world");
        expect(obj).toStrictEqual(o2);
    });
    const multipleFlags = {
        flags: {
            num: { description: "testing", multiple: true, type: "number" },
            str: { description: "testing", multiple: true, type: "string" },
            obj: { description: "testing", multiple: true, type: "json" },
        },
    };
    it("multiple", () => {
        const params = parseParams("", multipleFlags);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const num = flags.num; // Use ! to make sure the type is correct
        const str = flags.str; // Use ! to make sure the type is correct
        const obj = flags.obj; // Use ! to make sure the type is correct
        expect(num).toBe(undefined);
        expect(str).toBe(undefined);
        expect(obj).toBe(undefined);
    });
    it("multiple - with flag input", () => {
        const params = parseParams(`--num 11 --str world --obj '${JSON.stringify(o1)}' --num 12 --str ! --obj '${JSON.stringify(o2)}'`, multipleFlags);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const num = flags.num;
        const str = flags.str;
        const obj = flags.obj; // Use ! to make sure the type is correct
        expect(num).toStrictEqual([11, 12]);
        expect(str).toStrictEqual(["world", "!"]);
        expect(obj).toStrictEqual([o1, o2]);
    });
    const typeWithDefaultFlags = {
        flags: {
            bool: { description: "testing", type: "boolean", default: false },
            num: { description: "testing", type: "number", default: 10 },
            str: { description: "testing", type: "string", default: "hello" },
            obj: { description: "testing", type: "json", default: o1 },
        },
    };
    it("type default", () => {
        const params = parseParams("", typeWithDefaultFlags);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const bool = flags.bool;
        const num = flags.num;
        const str = flags.str;
        const obj = flags.obj;
        expect(bool).toBe(typeWithDefaultFlags.flags.bool.default);
        expect(num).toBe(typeWithDefaultFlags.flags.num.default);
        expect(str).toBe(typeWithDefaultFlags.flags.str.default);
        expect(obj).toStrictEqual(typeWithDefaultFlags.flags.obj.default);
    });
    it("type default - with flag input", () => {
        const params = parseParams(`--bool --num 11 --str world --obj '${JSON.stringify(o2)}'`, typeWithDefaultFlags);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const bool = flags.bool;
        const num = flags.num;
        const str = flags.str;
        const obj = flags.obj;
        expect(bool).toBe(true);
        expect(num).toBe(11);
        expect(str).toBe("world");
        expect(obj).toStrictEqual(o2);
    });
    const defaultValueFlags = {
        flags: {
            bool: { description: "testing", default: false },
            num: { description: "testing", default: 10 },
            str: { description: "testing", default: "hello" },
            obj: { description: "testing", default: o1 },
            defStr: { description: "testing" },
        },
    };
    it("default", () => {
        const params = parseParams("", defaultValueFlags);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const bool = flags.bool;
        const num = flags.num;
        const str = flags.str;
        const obj = flags.obj;
        const defStr = flags.defStr; // Use ! to make sure the type is correct
        expect(bool).toBe(defaultValueFlags.flags.bool.default);
        expect(num).toBe(defaultValueFlags.flags.num.default);
        expect(str).toBe(defaultValueFlags.flags.str.default);
        expect(obj).toStrictEqual(defaultValueFlags.flags.obj.default);
        expect(defStr).toBe(undefined);
    });
    it("default - with flag input", () => {
        const params = parseParams(`--bool --num 11 --str world --defStr default --obj '${JSON.stringify(o2)}'`, defaultValueFlags);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const bool = flags.bool;
        const num = flags.num;
        const str = flags.str;
        const obj = flags.obj;
        const defStr = flags.defStr; // Use ! to make sure the type is correct
        expect(bool).toBe(true);
        expect(num).toBe(11);
        expect(str).toBe("world");
        expect(obj).toStrictEqual(o2);
        expect(defStr).toBe("default");
    });
    const defaultMultipleConfig = {
        flags: {
            num: { description: "testing", multiple: true, default: [10, 11] },
            str: {
                description: "testing",
                multiple: true,
                default: ["hello", "world"],
            },
            obj: { description: "testing", multiple: true, default: [o1, o1] },
        },
    };
    it("default multiple", () => {
        const params = parseParams("", defaultMultipleConfig);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const num = flags.num;
        const str = flags.str;
        const obj = flags.obj;
        expect(num).toStrictEqual(defaultMultipleConfig.flags.num.default);
        expect(str).toStrictEqual(defaultMultipleConfig.flags.str.default);
        expect(obj).toStrictEqual(defaultMultipleConfig.flags.obj.default);
    });
    it("default multiple - with flag input", () => {
        const params = parseParams(`--num 11 --str world --obj '${JSON.stringify(o1)}' --num 12 --str ! --obj '${JSON.stringify(o2)}'`, defaultMultipleConfig);
        const args = params.args;
        expect(args).toStrictEqual(undefined);
        const flags = params.flags;
        const num = flags.num;
        const str = flags.str;
        const obj = flags.obj;
        expect(num).toStrictEqual([11, 12]);
        expect(str).toStrictEqual(["world", "!"]);
        expect(obj).toStrictEqual([o1, o2]);
    });
    it("Invalid flag", () => {
        try {
            parseParams("--invalid", typeFlags);
        }
        catch (e) {
            expect(e.message).toStrictEqual("Invalid flag '--invalid'");
        }
    });
    it("Missing value", () => {
        try {
            parseParams("--num", typeFlags);
        }
        catch (e) {
            expect(e.message).toStrictEqual("Missing value for flag '--num'");
        }
    });
    it("Invalid value", () => {
        try {
            parseParams("--num abc", typeFlags);
        }
        catch (e) {
            expect(e.message).toStrictEqual("Invalid number value 'abc' for flag '--num'");
        }
    });
    it("Invalid alias", () => {
        try {
            parseParams("-n abc", typeFlags);
        }
        catch (e) {
            expect(e.message).toStrictEqual("Invalid flag '-n'");
        }
    });
    it("Duplicate flags", () => {
        try {
            parseParams("--num 10 --num 11", typeFlags);
        }
        catch (e) {
            expect(e.message).toStrictEqual("Duplicate flag '--num'");
        }
    });
});
//# sourceMappingURL=flags.spec.js.map