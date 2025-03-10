// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function getFileExtensionForMimeType(mime) {
    switch (mime.toLowerCase()) {
        case "image/png":
            return ".png";
        case "image/jpeg":
            return ".jpeg";
        case "image/gif":
            return ".gif";
    }
    throw "Unsupported MIME type";
}
export function getMimeTypeFromFileExtension(fileExtension) {
    switch (fileExtension.toLowerCase()) {
        case ".css":
            return "text/css";
        case ".htm":
        case ".html":
            return "text/html";
        case ".js":
            return "text/javascript";
        case ".json":
        case ".map":
            return "application/json";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".gif":
            return "image/gif";
    }
    throw "Unsupported file extension.";
}
export function isImageMimeTypeSupported(mime) {
    switch (mime.toLowerCase()) {
        case "image/png":
        case "image/jpg":
        case "image/jpeg":
            return true;
        default:
            return false;
    }
}
export function isImageFileType(fileExtension) {
    if (fileExtension.startsWith(".")) {
        fileExtension = fileExtension.substring(1);
    }
    const imageFileTypes = new Set(["png", "jpg", "jpeg"]);
    return imageFileTypes.has(fileExtension.toLowerCase());
}
//# sourceMappingURL=mimeTypes.js.map