import { HighspotToken, HighspotUser } from "./highspotApiSchema.js";
export declare class HighspotService {
    private loggedInUser;
    private accessToken;
    constructor();
    retrieveUser(): HighspotUser;
    storeUser(user: HighspotUser): void;
    getAccessToken(): Promise<HighspotToken>;
}
//# sourceMappingURL=service.d.ts.map