import { Storage } from "@typeagent/agent-sdk";
import ExifReader from "exifreader";
import { PromptSection } from "typechat";
import { PointOfInterest, ReverseGeocodeAddressLookup } from "./location.js";
export declare class CachedImageWithDetails {
    exifTags: ExifReader.Tags;
    storageLocation: string;
    image: string;
    constructor(exifTags: ExifReader.Tags, storageLocation: string, image: string);
}
export type ImagePromptDetails = {
    promptSection?: PromptSection | undefined;
    nearbyPOI?: PointOfInterest[] | undefined;
    reverseGeocode?: ReverseGeocodeAddressLookup[] | undefined;
};
export declare function getImageElement(imgData: string): string;
export declare function extractRelevantExifTags(exifTags: ExifReader.Tags): string;
export declare function extractAllExifTags(exifTags: ExifReader.Tags): string;
/**
 * Downloads the supplied uri and saves it to local session storage
 * @param uri The uri of the image to download
 * @param fileName The name of the file to save the image locally as (including relative path)
 */
export declare function downloadImage(uri: string, fileName: string, storage: Storage): Promise<boolean>;
/**
 * Adds the supplied image to the suppled prompt section.
 * @param role - The role of this prompt section.
 * @param image - The image to adding to the prompt section.
 * @param includeFileName - Flag indicating if the file name should be included in the prompt.
 * @param includePartialExifTags - Flag indicating if EXIF tags should be included.
 * @param includeAllExifTags - Flag to indicate of all EXIF tags should be included.  Supercedes previous parameter.
 * @param includePOI  - Flag indicating if POI should be located and appended to the prompt.
 * @param includeGeocodedAddress - Flag indicating if the image location should be geocoded if it's available.
 * @returns - A prompt section representing the supplied image and related details as requested.
 */
export declare function addImagePromptContent(role: "system" | "user" | "assistant", image: CachedImageWithDetails, includeFileName?: boolean, includePartialExifTags?: boolean, includeAllExifTags?: boolean, includePOI?: boolean, includeGeocodedAddress?: boolean): Promise<ImagePromptDetails>;
/**
 * Tries to get the date the image was taken.
 * It attempts to use the filename and falls back to Exif tags.
 *
 * @param path The path to the image file whose taken date is to be ascertained
 * @returns either the date.  If the date is undeterimined returns 1/1/1900 00:00:00
 */
export declare function getDateTakenFuzzy(filePath: string): Date;
//# sourceMappingURL=image.d.ts.map