export type PlayerAction = PlayRandomAction | PlayTrackAction | PlayFromCurrentTrackListAction | PlayAlbumAction | PlayArtistAction | PlayGenreAction | StatusAction | PauseAction | ResumeAction | NextAction | PreviousAction | ShuffleAction | ListDevicesAction | SelectDeviceAction | SetVolumeAction | ChangeVolumeAction | SearchTracksAction | ListPlaylistsAction | GetPlaylistAction | GetAlbumAction | GetFavoritesAction | FilterTracksAction | CreatePlaylistAction | DeletePlaylistAction | GetQueueAction;
export interface PlayRandomAction {
    actionName: "playRandom";
    parameters?: {
        quantity?: number;
    };
}
export interface PlayTrackAction {
    actionName: "playTrack";
    parameters: {
        trackName: string;
        albumName?: string;
        artists?: string[];
    };
}
export interface PlayAlbumAction {
    actionName: "playAlbum";
    parameters: {
        albumName: string;
        artists?: string[];
        trackNumber?: number[];
    };
}
export interface PlayFromCurrentTrackListAction {
    actionName: "playFromCurrentTrackList";
    parameters: {
        trackNumber: number;
    };
}
export interface PlayArtistAction {
    actionName: "playArtist";
    parameters: {
        artist: string;
        genre?: string;
        quantity?: number;
    };
}
export interface PlayGenreAction {
    actionName: "playGenre";
    parameters: {
        genre: string;
        quantity?: number;
    };
}
export interface StatusAction {
    actionName: "status";
}
export interface PauseAction {
    actionName: "pause";
}
export interface ResumeAction {
    actionName: "resume";
}
export interface NextAction {
    actionName: "next";
}
export interface PreviousAction {
    actionName: "previous";
}
export interface ShuffleAction {
    actionName: "shuffle";
    parameters: {
        on: boolean;
    };
}
export interface ListDevicesAction {
    actionName: "listDevices";
}
export interface SelectDeviceAction {
    actionName: "selectDevice";
    parameters: {
        keyword: string;
    };
}
export interface SetVolumeAction {
    actionName: "setVolume";
    parameters: {
        newVolumeLevel: number;
    };
}
export interface ChangeVolumeAction {
    actionName: "changeVolume";
    parameters: {
        volumeChangePercentage: number;
    };
}
export interface SearchTracksAction {
    actionName: "searchTracks";
    parameters: {
        query: string;
    };
}
export interface ListPlaylistsAction {
    actionName: "listPlaylists";
}
export interface GetPlaylistAction {
    actionName: "getPlaylist";
    parameters: {
        name: string;
    };
}
export interface GetAlbumAction {
    actionName: "getAlbum";
}
export interface GetFavoritesAction {
    actionName: "getFavorites";
    parameters?: {
        count?: number;
    };
}
export interface FilterTracksAction {
    actionName: "filterTracks";
    parameters: {
        trackListEntityId: string;
        filterType: "genre" | "artist" | "name";
        filterValue: string;
        negate?: boolean;
    };
}
export interface CreatePlaylistAction {
    actionName: "createPlaylist";
    parameters: {
        name: string;
        trackListEntityId: string;
    };
}
export interface DeletePlaylistAction {
    actionName: "deletePlaylist";
    parameters: {
        name: string;
    };
}
export interface GetQueueAction {
    actionName: "getQueue";
}
//# sourceMappingURL=playerSchema.d.ts.map