import { FileSystem, ObjectDeserializer, ObjectSerializer } from "./objectFolder";
export interface ObjectPage<T = any> {
    readonly size: number;
    readonly isDirty: boolean;
    getAt(pos: number): T;
    indexOf(value: T): number;
    put(values: T | T[]): void;
    removeAt(pos: number): void;
    save(): Promise<void>;
}
export type ObjectPageSettings = {
    cacheSize?: number | undefined;
    serializer?: ObjectSerializer | undefined;
    deserializer?: ObjectDeserializer | undefined;
    safeWrites?: boolean | undefined | undefined;
};
export declare function createObjectPage<T = any>(filePath: string, compareFn: (x: T, y: T) => number, settings?: ObjectPageSettings | undefined, fSys?: FileSystem | undefined): Promise<ObjectPage<T>>;
export interface HashObjectFolder<T = any> {
    get(key: string): Promise<T | undefined>;
    put(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    save(): Promise<void>;
}
export declare function createHashObjectFolder<T = any>(folderPath: string, clean?: boolean, numBuckets?: number, pageSettings?: ObjectPageSettings | undefined, fSys?: FileSystem): Promise<HashObjectFolder<T>>;
//# sourceMappingURL=objectPage.d.ts.map