import { DeepPartialUndefined, DeepPartialUndefinedAndNull } from "common-utils";
export declare function cloneConfig<T>(config: T): T;
type ConfigObject = {
    [key: string]: ConfigObject | string | number | boolean;
};
type ConfigSettings = DeepPartialUndefined<ConfigObject>;
type ConfigOptions = DeepPartialUndefinedAndNull<ConfigObject> | null;
type ConfigChanged = ConfigSettings | undefined;
/**
 * Merge options into config.
 *
 * @param config Config to merge into
 * @param options Options to change the config with
 * @param overwrite whether to overwrite the config even if the type mismatch. If an array is given, then those keys that the nested object will be overwritten when new types.
 * @param prefix Prefix for error message (for nested object)
 * @returns
 */
export declare function mergeConfig(config: ConfigSettings, options: ConfigOptions, overwrite?: readonly string[] | boolean, defaultConfig?: ConfigObject, prefix?: string): ConfigChanged;
export declare function sanitizeConfig(config: ConfigObject, settings: unknown, override?: readonly string[] | boolean, prefix?: string): boolean | undefined;
export declare function isEmptySettings(settings: ConfigSettings): boolean;
export {};
//# sourceMappingURL=options.d.ts.map