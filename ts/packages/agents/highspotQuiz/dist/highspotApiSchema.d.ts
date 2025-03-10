export interface HighspotUser {
    id: string;
    name: string;
    surname: string;
    display_name: string;
    email: string;
    groups: string[];
    suspended: boolean;
    favorites: {
        spots: string[];
        properites: string[];
    };
}
export interface HighspotToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}
export interface HighspotItem {
    id: string;
    title: string;
    description: string;
    author: string;
    date_created: string;
    expires_at: string;
    available_at: string;
    internal: boolean;
    spot: string;
    can_download: boolean;
    content_name: string;
    content_type: string;
    mime_type: string;
    title_external: string;
    description_external: string;
    date_added: string;
    date_original_added: string;
    date_updated: string;
    language: string;
    lists: string[];
    imported_at: string;
    content_owners: {
        users: string[];
        groups: string[];
    };
}
export interface HighspotSpot {
    id: string;
    title: string;
    description: string;
    is_official: boolean;
}
export interface CollectionResponse<T> {
    counts_total: number;
    collection: T[];
}
export interface IdResponse {
    id: string;
}
//# sourceMappingURL=highspotApiSchema.d.ts.map