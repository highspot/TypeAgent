/// <reference types="spotify-api" />
export interface ITrackCollection {
    getTrackCount(): number;
    getTracks(): SpotifyApi.TrackObjectFull[];
    getContext(): string | undefined;
    getPlaylist(): SpotifyApi.PlaylistObjectSimplified | undefined;
    copy(): ITrackCollection;
}
export declare class TrackCollection implements ITrackCollection {
    private readonly tracks;
    private readonly contextUri?;
    constructor(tracks: SpotifyApi.TrackObjectFull[], contextUri?: string | undefined);
    getTracks(): SpotifyApi.TrackObjectFull[];
    getContext(): string | undefined;
    getTrackCount(): number;
    getPlaylist(): SpotifyApi.PlaylistObjectSimplified | undefined;
    copy(): TrackCollection;
}
export declare class PlaylistTrackCollection extends TrackCollection {
    playlist: SpotifyApi.PlaylistObjectSimplified;
    constructor(playlist: SpotifyApi.PlaylistObjectSimplified, tracks: SpotifyApi.TrackObjectFull[]);
    getPlaylist(): SpotifyApi.PlaylistObjectSimplified;
    copy(): PlaylistTrackCollection;
}
export declare class AlbumTrackCollection extends TrackCollection {
    album: SpotifyApi.AlbumObjectFull;
    constructor(album: SpotifyApi.AlbumObjectFull);
    copy(): AlbumTrackCollection;
}
//# sourceMappingURL=trackCollections.d.ts.map