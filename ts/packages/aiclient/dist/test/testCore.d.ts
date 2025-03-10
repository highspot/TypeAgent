/// <reference types="jest" />
export declare function hasEmbeddingModel(): boolean;
export declare function hasEmbeddingEndpoint(endpoint?: string | undefined): boolean;
export declare function hasApiSettings(key: string, endpoint?: string | undefined): boolean;
export declare function skipTest(name: string): void;
export declare function testIf(runIf: () => boolean, name: string, fn: jest.ProvidesCallback, testTimeout?: number | undefined): void;
//# sourceMappingURL=testCore.d.ts.map