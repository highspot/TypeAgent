/**
 * Retrieve a setting from environment variables
 * @param env environment variables
 * @param key setting key
 * @param keySuffix additional suffix to add to key
 * @param defaultValue default value of setting
 * @returns
 */
export declare function getEnvSetting(env: Record<string, string | undefined>, key: string, keySuffix?: string, defaultValue?: string, requireSuffix?: boolean): string;
/**
 * Returns true if the given environment setting/key is available
 * @param key
 * @param keySuffix
 * @returns true if available, false otherwise
 */
export declare function hasEnvSettings(env: Record<string, string | undefined>, key: string, keySuffix?: string | undefined): boolean;
export declare function getIntFromEnv(env: Record<string, string | undefined>, envName: string, endpointName?: string): number | undefined;
//# sourceMappingURL=common.d.ts.map