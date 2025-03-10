import { DeepPartialUndefinedAndNull } from "common-utils";
export declare function cloneConfig<T>(config: T): T;
type ConfigObject = {
    [key: string]: ConfigObject | string | number | boolean | undefined;
};
type ConfigOptions = DeepPartialUndefinedAndNull<ConfigObject>;
export declare function mergeConfig(
    config: ConfigObject,
    options: ConfigOptions,
    strict?: boolean,
    flexKeys?: string[],
): {
    [x: string]: string | number | boolean | any | null | undefined;
};
export {};
//# sourceMappingURL=options.d.ts.map
