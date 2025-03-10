// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function getAlbumString(album) {
    return `${album.name} by ${album.artists[0].name}`;
}
export function toTrackObjectFull(track, album) {
    return {
        ...track,
        album,
        external_ids: {},
        popularity: 0,
    };
}
//# sourceMappingURL=spotifyUtils.js.map
