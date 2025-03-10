/// <reference types="node" resolution-mode="require"/>
import { SpotifyService } from "./service.js";
import { Storage } from "@typeagent/agent-sdk";
export interface MusicItemInfo {
    id: string;
    name: string;
    freq: number;
    timestamps: string[];
    albumName?: string;
    albumArtist?: string;
}
export interface SpotifyUserData {
    lastUpdated: number;
    tracks: Map<string, MusicItemInfo>;
    artists: Map<string, MusicItemInfo>;
    albums: Map<string, MusicItemInfo>;
    nameMap?: Map<string, MusicItemInfo>;
}
export declare function saveUserData(storage: Storage, userData: SpotifyUserData): Promise<void>;
export declare function mergeUserDataKind(existing: Map<string, MusicItemInfo>, newItems: MusicItemInfo[]): number;
export declare function addUserDataStrings(userData: SpotifyUserData): Map<string, MusicItemInfo>;
export type UserData = {
    data: SpotifyUserData;
    timeoutId?: NodeJS.Timeout;
};
export declare function initializeUserData(instanceStorage: Storage, service: SpotifyService): Promise<UserData>;
//# sourceMappingURL=userData.d.ts.map