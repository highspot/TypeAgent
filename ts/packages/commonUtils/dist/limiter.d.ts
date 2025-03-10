export type Limiter = <T = void>(callback: () => Promise<T>) => Promise<T>;
export declare function createLimiter(limit: number): Limiter;
//# sourceMappingURL=limiter.d.ts.map