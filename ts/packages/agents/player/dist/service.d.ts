import { TokenProvider } from "./tokenProvider.js";
export type User = {
    username?: string | undefined;
    id?: string | undefined;
};
export declare class SpotifyService {
    readonly tokenProvider: TokenProvider;
    private loggedInUser;
    constructor(tokenProvider: TokenProvider);
    retrieveUser(): User;
    storeUser(user: User): void;
    init(): Promise<void>;
}
//# sourceMappingURL=service.d.ts.map