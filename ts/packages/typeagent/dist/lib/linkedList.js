"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListEntry = exports.createLinkedList = exports.getTail = exports.allNodesReverse = exports.allNodes = exports.prependListNode = exports.isTail = exports.isHead = exports.appendListNode = exports.detachListNode = void 0;
const console_1 = require("console");
function detachListNode(node) {
    const next = node.next;
    const prev = node.prev;
    if (next) {
        next.prev = prev;
        node.next = undefined;
    }
    if (prev) {
        prev.next = next;
        node.prev = undefined;
    }
}
exports.detachListNode = detachListNode;
function appendListNode(node, appendNode) {
    (0, console_1.assert)(isSingleton(node));
    var next = node.next;
    if (next) {
        next.prev = appendNode;
        appendNode.next = next;
    }
    node.next = appendNode;
    appendNode.prev = node;
}
exports.appendListNode = appendListNode;
function isHead(node) {
    return node.prev === undefined;
}
exports.isHead = isHead;
function isTail(node) {
    return node.next === undefined;
}
exports.isTail = isTail;
function prependListNode(node, prependNode) {
    (0, console_1.assert)(isSingleton(prependNode));
    var prev = node.prev;
    if (prev) {
        prev.next = prependNode;
        prependNode.prev = prev;
    }
    prependNode.next = node;
    node.prev = prependNode;
}
exports.prependListNode = prependListNode;
function isSingleton(node) {
    return node.next === undefined && node.prev === undefined;
}
function* allNodes(node) {
    let nextNode = node;
    while (nextNode) {
        yield nextNode;
        nextNode = nextNode.next;
    }
}
exports.allNodes = allNodes;
function* allNodesReverse(node) {
    let prevNode = node;
    while (prevNode) {
        yield prevNode;
        prevNode = prevNode.prev;
    }
}
exports.allNodesReverse = allNodesReverse;
function getTail(node) {
    let last = node;
    if (last === undefined) {
        return undefined;
    }
    let next = last.next;
    while (next) {
        last = next;
        next = next.next;
    }
    return last;
}
exports.getTail = getTail;
function createLinkedList() {
    let head;
    let tail;
    let count = 0;
    return {
        get length() {
            return count;
        },
        get head() {
            return head;
        },
        get tail() {
            return tail;
        },
        pushHead,
        pushTail,
        popHead,
        popTail,
        insertAfter,
        removeNode,
        makeMRU,
        makeLRU,
        entries,
    };
    function pushHead(node) {
        if (head) {
            prependListNode(head, node);
            head = node;
        }
        else {
            initList(node);
        }
        ++count;
    }
    function pushTail(node) {
        if (tail) {
            appendListNode(tail, node);
            tail = node;
        }
        else {
            initList(node);
        }
        ++count;
    }
    function popHead() {
        if (head) {
            const curHead = head;
            removeNode(head);
            return curHead;
        }
        return undefined;
    }
    function popTail() {
        if (tail) {
            const curTail = tail;
            removeNode(tail);
            return curTail;
        }
        return undefined;
    }
    function makeMRU(node) {
        removeNode(node);
        pushHead(node);
    }
    function makeLRU(node) {
        removeNode(node);
        pushTail(node);
    }
    function removeNode(node) {
        if (node === head) {
            head = node.next;
        }
        if (node === tail) {
            tail = node.prev;
        }
        detachListNode(node);
        --count;
    }
    function insertAfter(node, nextNode) {
        appendListNode(node, nextNode);
        if (node === tail) {
            tail = nextNode;
        }
        ++count;
    }
    function initList(node) {
        head = tail = node;
    }
    function* entries() {
        return allNodes(head);
    }
}
exports.createLinkedList = createLinkedList;
function createListEntry(value) {
    return {
        next: undefined,
        prev: undefined,
        value: value,
    };
}
exports.createListEntry = createListEntry;
//# sourceMappingURL=linkedList.js.map