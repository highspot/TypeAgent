// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { toTrackObjectFull } from "./spotifyUtils.js";
export class TrackCollection {
    constructor(tracks, contextUri) {
        this.tracks = tracks;
        this.contextUri = contextUri;
    }
    getTracks() {
        return this.tracks;
    }
    getContext() {
        return this.contextUri;
    }
    getTrackCount() {
        return this.tracks.length;
    }
    getPlaylist() {
        return undefined;
    }
    copy() {
        return new TrackCollection(this.tracks, this.contextUri);
    }
}
export class PlaylistTrackCollection extends TrackCollection {
    constructor(playlist, tracks) {
        super(tracks, playlist.uri);
        this.playlist = playlist;
    }
    getPlaylist() {
        return this.playlist;
    }
    copy() {
        return new PlaylistTrackCollection(this.playlist, this.getTracks());
    }
}
export class AlbumTrackCollection extends TrackCollection {
    constructor(album) {
        super(album.tracks.items.map((albumItem) => toTrackObjectFull(albumItem, album)), album.uri);
        this.album = album;
    }
    copy() {
        return new AlbumTrackCollection(this.album);
    }
}
//# sourceMappingURL=trackCollections.js.map