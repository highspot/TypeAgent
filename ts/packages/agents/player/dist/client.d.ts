/// <reference types="spotify-api" />
import { PlayerAction } from "./agent/playerSchema.js";
import { ITrackCollection, TrackCollection } from "./trackCollections.js";
import { SpotifyService } from "./service.js";
import { UserData } from "./userData.js";
import { ActionIO, Storage, ActionResult, TypeAgentAction } from "@typeagent/agent-sdk";
export interface IClientContext {
    service: SpotifyService;
    deviceId?: string | undefined;
    currentTrackList?: ITrackCollection;
    lastTrackStartIndex?: number;
    lastTrackEndIndex?: number;
    trackListMap: Map<string, ITrackCollection>;
    trackListCount: number;
    userData?: UserData | undefined;
}
export declare function loadHistoryFile(instanceStorage: Storage, historyPath: string, context: IClientContext): Promise<void>;
export declare function getClientContext(instanceStorage?: Storage): Promise<IClientContext>;
export declare function searchTracks(queryString: string, context: IClientContext): Promise<TrackCollection | undefined>;
export declare function searchAlbum(albumName: string, context: IClientContext): Promise<SpotifyApi.AlbumObjectSimplified | undefined>;
export declare function getUserDataStrings(clientContext: IClientContext): string[];
export declare function handleCall(action: TypeAgentAction<PlayerAction>, clientContext: IClientContext, actionIO: ActionIO): Promise<ActionResult>;
//# sourceMappingURL=client.d.ts.map