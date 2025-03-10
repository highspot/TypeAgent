/// <reference types="node" />
export type ServerEvent = {
    id?: string;
    event?: string;
    data: string;
};
export declare function readServerEventStream(response: Response): AsyncIterableIterator<ServerEvent>;
export declare function readMessages(textStream: AsyncIterableIterator<string>): AsyncIterableIterator<string>;
//# sourceMappingURL=serverEvents.d.ts.map