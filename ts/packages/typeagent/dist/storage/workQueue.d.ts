import { Path } from "../objStream";
export interface WorkQueue {
    onError?: (err: any) => void;
    count(): Promise<number>;
    addTask(obj: any): Promise<void>;
    drain(concurrency: number, processor: (item: Path, index: number, total: number) => Promise<void>, maxItems?: number, pauseMs?: number): Promise<number>;
    drainTask(concurrency: number, processor: (task: any, index: number, total: number) => Promise<void>, maxItems?: number, pauseMs?: number): Promise<number>;
    requeue(): Promise<boolean>;
    requeueErrors(): Promise<boolean>;
}
export declare function createWorkQueueFolder(rootPath: string, queueFolderName?: string, workItemFilter?: (queuePath: string, workItems: Path[]) => Promise<Path[]>): Promise<WorkQueue>;
//# sourceMappingURL=workQueue.d.ts.map