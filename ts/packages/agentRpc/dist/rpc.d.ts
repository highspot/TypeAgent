import { RpcChannel } from "./common.js";
type RpcFuncType<N extends string, T extends Record<string, (...args: any) => any>> = {
    [K in keyof T as `${N}`]: <K extends string>(name: K, param: Parameters<T[K]>[0]) => ReturnType<T[K]>;
};
type RpcReturn<InvokeTargetFunctions extends {
    [key: string]: (param: any) => Promise<unknown>;
}, CallTargetFunctions extends {
    [key: string]: (param: any) => void;
}> = RpcFuncType<"invoke", InvokeTargetFunctions> & RpcFuncType<"send", CallTargetFunctions>;
export declare function createRpc<InvokeTargetFunctions extends {
    [key: string]: (param: any) => Promise<unknown>;
} = {}, CallTargetFunctions extends {
    [key: string]: (param: any) => void;
} = {}, InvokeHandlers extends {
    [key: string]: (param: any) => Promise<unknown>;
} = {}, CallHandlers extends {
    [key: string]: (param: any) => void;
} = {}>(channel: RpcChannel, invokeHandlers?: InvokeHandlers, callHandlers?: CallHandlers): RpcReturn<InvokeTargetFunctions, CallTargetFunctions>;
export {};
//# sourceMappingURL=rpc.d.ts.map