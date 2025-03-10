export type MarkdownAction = CreateDocumentAction | OpenDocumentAction | UpdateDocumentAction;
export type CreateDocumentAction = {
    actionName: "createDocument";
    parameters: {
        name: string;
    };
};
export type OpenDocumentAction = {
    actionName: "openDocument";
    parameters: {
        name: string;
    };
};
export type UpdateDocumentAction = {
    actionName: "updateDocument";
    parameters: {
        originalRequest: string;
    };
};
//# sourceMappingURL=markdownActionSchema.d.ts.map