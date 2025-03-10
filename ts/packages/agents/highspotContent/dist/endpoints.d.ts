import { HighspotService } from "./service.js";
import { CollectionResponse, HighspotItem, HighspotSpot, HighspotToken, HighspotUser, IdResponse } from "./highspotApiSchema.js";
export declare function getCurrentUser(service: HighspotService): Promise<HighspotUser | undefined>;
export declare function getItem(service: HighspotService, itemId: string): Promise<HighspotItem | undefined>;
export declare function deleteItem(service: HighspotService, itemId: string): Promise<HighspotItem | undefined>;
export declare function getOauthToken(): Promise<HighspotToken>;
export declare function getSpotItems(service: HighspotService, spotId: string): Promise<CollectionResponse<HighspotItem> | undefined>;
export declare function deleteSpot(service: HighspotService, spotId: string): Promise<HighspotSpot | undefined>;
export declare function getAllSpots(service: HighspotService): Promise<CollectionResponse<HighspotSpot> | undefined>;
export declare function getAllItems(service: HighspotService): Promise<CollectionResponse<HighspotItem> | undefined>;
export declare function createSpot(service: HighspotService, title: string): Promise<IdResponse | undefined>;
//# sourceMappingURL=endpoints.d.ts.map