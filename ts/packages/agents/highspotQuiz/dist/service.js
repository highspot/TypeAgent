import { getOauthToken } from "./endpoints.js";
export class HighspotService {
    constructor() {
        this.loggedInUser = null;
        this.accessToken = null;
        this.getAccessToken();
    }
    retrieveUser() {
        if (this.loggedInUser === null) {
            throw new Error("Highspot Service: no loggedInUser");
        }
        return this.loggedInUser;
    }
    storeUser(user) {
        this.loggedInUser = user;
    }
    async getAccessToken() {
        if (this.accessToken !== null) {
            return this.accessToken;
        }
        this.accessToken = await getOauthToken();
        return this.accessToken;
    }
}
//# sourceMappingURL=service.js.map