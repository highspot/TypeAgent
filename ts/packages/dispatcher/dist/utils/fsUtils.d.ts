export declare function getYMDPrefix(): string;
export declare function getUniqueFileName(dirpath: string, prefix?: string, ext?: string): string;
export declare function lockInstanceDir(instanceDir: string): Promise<() => Promise<void>>;
export declare function ensureCacheDir(instanceDir: string): string;
export declare function ensureDirectory(dir: string): void;
//# sourceMappingURL=fsUtils.d.ts.map