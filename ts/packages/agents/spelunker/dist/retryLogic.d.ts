import { Result } from "typechat";
export declare function retryOn429<T>(translate: () => Promise<Result<T>>, retries?: number, defaultDelay?: number): Promise<T | undefined>;
//# sourceMappingURL=retryLogic.d.ts.map