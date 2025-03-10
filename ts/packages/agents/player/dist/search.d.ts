/// <reference types="spotify-api" />
import { IClientContext } from "./client.js";
import { Entity } from "@typeagent/agent-sdk";
export type SpotifyQuery = {
    track?: string[] | undefined;
    album?: string[] | undefined;
    artist?: string[] | undefined;
    genre?: string[] | undefined;
    query?: string[] | undefined;
};
export declare function toQueryString(query: SpotifyQuery): string;
export declare function searchArtists(artistName: string, context: IClientContext): Promise<SpotifyApi.SearchResponse | undefined>;
export declare function equivalentNames(a: string, b: string): boolean;
export declare function resolveArtists(artistNames: string[], context: IClientContext, artistEntities?: (Entity | undefined)[]): Promise<SpotifyApi.ArtistObjectFull[] | undefined>;
export declare function findArtistTracksWithGenre(artistName: string, genre: string, context: IClientContext, artistEntity: Entity | undefined): Promise<SpotifyApi.TrackObjectFull[]>;
export declare function findArtistTopTracks(artistName: string, context: IClientContext, artistEntity: Entity | undefined): Promise<SpotifyApi.TrackObjectFull[]>;
export declare function findAlbums(albumName: string, artistNames: string[] | undefined, context: IClientContext, albumEntity: Entity | undefined, artistEntities: (Entity | undefined)[] | undefined): Promise<SpotifyApi.AlbumObjectFull[]>;
export declare function findTracksWithGenre(context: IClientContext, genre: string, quantity?: number): Promise<SpotifyApi.TrackObjectFull[]>;
export declare function getTrackFromEntity(trackName: string, context: IClientContext, trackEntity: Entity | undefined): Promise<SpotifyApi.SingleTrackResponse | undefined>;
export declare function findTracks(context: IClientContext, trackName: string, artistNames: string[] | undefined, trackEntity: Entity | undefined, artistEntities: (Entity | undefined)[] | undefined, quantity?: number): Promise<SpotifyApi.TrackObjectFull[]>;
//# sourceMappingURL=search.d.ts.map