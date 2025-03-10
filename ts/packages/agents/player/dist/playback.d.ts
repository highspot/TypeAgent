/// <reference types="spotify-api" />
import { IClientContext } from "./client.js";
import { ActionResultSuccess } from "@typeagent/agent-sdk";
export declare function chalkStatus(status: SpotifyApi.CurrentPlaybackResponse): string;
export declare function htmlStatus(context: IClientContext): Promise<ActionResultSuccess>;
export declare function printStatus(context: IClientContext): Promise<void>;
export declare function selectDevice(keyword: string, context: IClientContext): Promise<{
    html: string;
    text: string;
} | undefined>;
export declare function listAvailableDevices(context: IClientContext): Promise<{
    html: string;
    lit: string;
} | undefined>;
//# sourceMappingURL=playback.d.ts.map