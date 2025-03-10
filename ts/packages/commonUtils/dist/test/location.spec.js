// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { exifGPSTagToLatLong } from "../src/location.js";
describe("Location Tests", () => {
    it("EXIF LatLong to LatLong", () => {
        const lat = {
            value: "47.6204",
            description: "47.6204",
            attributes: {},
        };
        const long = {
            value: "122.3491",
            description: "122.3491",
            attributes: {},
        };
        const latRef = {
            value: "N",
            description: "North Latitude",
            attributes: {},
        };
        const longRef = {
            value: "W",
            description: "West Longitude",
            attributes: {},
        };
        const ll = exifGPSTagToLatLong(lat, latRef, long, longRef);
        expect(ll.latitude == "47.6204");
        expect(ll.longitude == "-122.3491");
        const llu = exifGPSTagToLatLong(lat, latRef, undefined, longRef);
        expect(llu === undefined);
    });
});
//# sourceMappingURL=location.spec.js.map