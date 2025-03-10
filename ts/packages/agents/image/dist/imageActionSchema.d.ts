export type ImageAction = FindImageAction | CreateImageAction;
export type FindImageAction = {
    actionName: "findImageAction";
    parameters: {
        originalRequest: string;
        searchTerm: string;
        numImages: number;
    };
};
export type CreateImageAction = {
    actionName: "createImageAction";
    parameters: {
        originalRequest: string;
        caption: string;
        numImages: number;
    };
};
//# sourceMappingURL=imageActionSchema.d.ts.map