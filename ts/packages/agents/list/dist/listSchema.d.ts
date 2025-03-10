export type ListAction = AddItemsAction | RemoveItemsAction | CreateListAction | GetListAction | ClearListAction;
export type AddItemsAction = {
    actionName: "addItems";
    parameters: {
        items: string[];
        listName: string;
    };
};
export type RemoveItemsAction = {
    actionName: "removeItems";
    parameters: {
        items: string[];
        listName: string;
    };
};
export type CreateListAction = {
    actionName: "createList";
    parameters: {
        listName: string;
    };
};
export type GetListAction = {
    actionName: "getList";
    parameters: {
        listName: string;
    };
};
export type ClearListAction = {
    actionName: "clearList";
    parameters: {
        listName: string;
    };
};
//# sourceMappingURL=listSchema.d.ts.map