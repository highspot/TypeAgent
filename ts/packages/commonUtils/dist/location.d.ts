import { StringArrayTag, TypedTag, XmpTag } from "exifreader";
import { openai } from "aiclient";
import { AddressOutput } from "@azure-rest/maps-search";
/**
 * Point of interest
 */
export type PointOfInterest = {
    name?: string | undefined;
    categories?: string[] | undefined;
    freeFormAddress?: string | undefined;
    position?: LatLong | undefined;
    distance?: number | undefined;
};
/**
 * Reverse geocode lookup
 */
export type ReverseGeocodeAddressLookup = {
    address?: AddressOutput | undefined;
    confidence?: "High" | "Medium" | "Low" | undefined;
    type: any;
};
/**
 * Latitude, longitude coordinates
 */
export type LatLong = {
    latitude: Number | string | undefined;
    longitude: Number | string | undefined;
};
/**
 * Helper method to convert EXIF tags to Latlong type
 * @param exifLat - The exif latitude.
 * @param exifLatRef - The exif latitude reference.
 * @param exifLong  - The exif longitude
 * @param exifLongRef - The exif longitude reference.
 * @returns The LatLong represented by the EXIF tag or undefined when data is incomplete
 */
export declare function exifGPSTagToLatLong(exifLat: XmpTag | TypedTag<[[number, number], [number, number], [number, number]]> | undefined, exifLatRef: XmpTag | StringArrayTag | undefined, exifLong: XmpTag | TypedTag<[[number, number], [number, number], [number, number]]> | undefined, exifLongRef: XmpTag | StringArrayTag | undefined): LatLong | undefined;
/**
 * Gets the nearby POIs for the supplied coordinate and search radius. Will do a
 * progressive search of increasing radius until maxSearchRadius is reached or
 * a singular result is found.  Whichever occurs first.
 * @param position - the position at which to do a nearby search
 * @param settings - the API settings containing the endpoint to call
 * @param maxSearchRadius - the search radius
 * @param minResultCount - the minimum # of results to find before returning
 * or the search radius is reached.  Whichever occurs first
 * @returns A list of summarized nearby POIs
 */
export declare function findNearbyPointsOfInterest(position: LatLong | undefined, settings: openai.ApiSettings, maxSearchRadius?: number, minResultCount?: number): Promise<PointOfInterest[]>;
export declare function reverseGeocode(position: LatLong | undefined, settings: openai.ApiSettings): Promise<ReverseGeocodeAddressLookup[]>;
//# sourceMappingURL=location.d.ts.map