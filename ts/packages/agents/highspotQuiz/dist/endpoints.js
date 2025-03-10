// Copyright (c) Highspot Inc.
import axios from "axios";
import { translateAxiosError } from "./utils.js";
function getUrlWithParams(urlString, queryParams) {
    const params = new URLSearchParams(queryParams);
    const url = new URL(urlString);
    url.search = params.toString();
    return url.toString();
}
async function callRestAPI(service, restUrl, params) {
    const token = await service.getAccessToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    };
    const url = getUrlWithParams(restUrl, params);
    try {
        const highspotResult = await axios.get(url, config);
        return highspotResult.data;
    }
    catch (e) {
        translateAxiosError(e, url);
    }
    return undefined;
}
async function postRestAPI(service, restUrl, data) {
    const token = await service.getAccessToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    };
    try {
        const highspotResult = await axios.post(restUrl, data, config);
        return highspotResult.data;
    }
    catch (e) {
        translateAxiosError(e, restUrl);
    }
    return undefined;
}
async function deleteRestAPI(service, restUrl) {
    const token = await service.getAccessToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    };
    try {
        const highspotResult = await axios.delete(restUrl, config);
        return highspotResult.data;
    }
    catch (e) {
        translateAxiosError(e, restUrl);
    }
    return undefined;
}
export async function getCurrentUser(service) {
    const userURL = "https://api.latest.highspot.com/v1.0/me";
    const result = await callRestAPI(service, userURL, {});
    return result;
}
export async function getItem(service, itemId) {
    const itemURL = `https://api.latest.highspot.com/v1.0/items/${itemId}`;
    const result = await callRestAPI(service, itemURL, {});
    return result;
}
export async function getItemContent(service, itemId) {
    const itemURL = `https://api.latest.highspot.com/v1.0/items/${itemId}/content`;
    const result = await callRestAPI(service, itemURL, {});
    return result;
}
export async function deleteItem(service, itemId) {
    const itemURL = `https://api.latest.highspot.com/v1.0/items/${itemId}`;
    const result = await deleteRestAPI(service, itemURL);
    return result;
}
export async function getOauthToken() {
    const oauthURL = "https://api.latest.highspot.com/v1.0/auth/oauth2/token";
    const clientId = process.env.HIGHSPOT_APP_CLI;
    const clientSecret = process.env.HIGHSPOT_APP_SEC;
    if (!clientId || !clientSecret) {
        throw new Error("Missing HIGHSPOT_APP_CLI or HIGHSPOT_APP_SEC in environment variables.");
    }
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials}`,
        },
    };
    const data = new URLSearchParams();
    data.append("grant_type", "client_credentials");
    const tokenResult = await axios.post(oauthURL, data.toString(), config);
    return tokenResult.data;
}
export async function getSpotItems(service, spotId) {
    const spotItemsURL = `https://api.latest.highspot.com/v1.0/items`;
    const result = await callRestAPI(service, spotItemsURL, {
        spot: spotId,
    });
    return result;
}
export async function deleteSpot(service, spotId) {
    const spotURL = `https://api.latest.highspot.com/v1.0/spots/${spotId}`;
    const result = await deleteRestAPI(service, spotURL);
    return result;
}
export async function getAllSpots(service) {
    const allSpotsURL = "https://api.latest.highspot.com/v1.0/spots";
    const result = await callRestAPI(service, allSpotsURL, {});
    return result;
}
export async function getAllItems(service) {
    const allItemsURL = "https://api.latest.highspot.com/v1.0/items";
    const result = await callRestAPI(service, allItemsURL, {});
    return result;
}
export async function createSpot(service, title) {
    const spotURL = "https://api.latest.highspot.com/v1.0/spots";
    const result = await postRestAPI(service, spotURL, {
        title: title,
    });
    return result;
}
//# sourceMappingURL=endpoints.js.map