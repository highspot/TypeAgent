type MessageHandler<T> = (message: Partial<T>) => void;
type DisconnectHandler = () => void;
export type SharedRpcChannel<T = any> = {
    on(event: "message", cb: MessageHandler<T>): void;
    on(event: "disconnect", cb: DisconnectHandler): void;
    off(event: "message", cb: MessageHandler<T>): void;
    off(event: "disconnect", cb: DisconnectHandler): void;
    send(message: T, cb?: (err: Error | null) => void): void;
};
export type RpcChannel<T = any> = SharedRpcChannel<T> & {
    once(event: "message", cb: MessageHandler<T>): void;
    once(event: "disconnect", cb: DisconnectHandler): void;
};
export type ChannelProvider = {
    createChannel(name: string): RpcChannel;
    deleteChannel(name: string): void;
};
export type GenericChannelProvider = ChannelProvider & {
    message(message: any): void;
    disconnect(): void;
};
export type GenericChannel = {
    channel: RpcChannel;
    message: (message: any) => void;
    disconnect: () => void;
};
type GenericSendFunc = (message: any, cb?: (err: Error | null) => void) => void;
export declare function createGenericChannel(sendFunc: GenericSendFunc): GenericChannel;
export declare function createGenericChannelProvider(sendFunc: GenericSendFunc): GenericChannelProvider;
export declare function createChannelProvider(sharedChannel: SharedRpcChannel): ChannelProvider;
export {};
//# sourceMappingURL=common.d.ts.map