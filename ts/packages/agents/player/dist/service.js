// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export class SpotifyService {
    constructor(tokenProvider) {
        this.tokenProvider = tokenProvider;
        this.loggedInUser = null;
    }
    retrieveUser() {
        if (this.loggedInUser === null) {
            throw new Error("SpotifyService: no loggedInUser");
        }
        return this.loggedInUser;
    }
    storeUser(user) {
        this.loggedInUser = user;
    }
    async init() {
        await this.tokenProvider.getClientCredentials();
    }
}
//# sourceMappingURL=service.js.map