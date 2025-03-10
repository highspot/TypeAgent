export interface ListNode {
    next: ListNode | undefined;
    prev: ListNode | undefined;
}
export declare function detachListNode<T>(node: ListNode): void;
export declare function appendListNode(node: ListNode, appendNode: ListNode): void;
export declare function isHead(node: ListNode): boolean;
export declare function isTail(node: ListNode): boolean;
export declare function prependListNode(node: ListNode, prependNode: ListNode): void;
export declare function allNodes(node: ListNode | undefined): IterableIterator<ListNode>;
export declare function allNodesReverse(node: ListNode | undefined): IterableIterator<ListNode>;
export declare function getTail(node: ListNode): ListNode | undefined;
export interface LinkedList {
    readonly length: number;
    readonly head: ListNode | undefined;
    readonly tail: ListNode | undefined;
    pushHead(node: ListNode): void;
    pushTail(node: ListNode): void;
    popHead(): ListNode | undefined;
    popTail(): ListNode | undefined;
    insertAfter(node: ListNode, nextNode: ListNode): void;
    removeNode(node: ListNode): void;
    makeMRU(node: ListNode): void;
    makeLRU(node: ListNode): void;
    entries(): IterableIterator<ListNode>;
}
export declare function createLinkedList(): LinkedList;
export interface ListEntry<T> extends ListNode {
    value: T;
}
export declare function createListEntry<T>(value: T): ListEntry<T>;
//# sourceMappingURL=linkedList.d.ts.map