/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!***************************!*\
  !*** ./src/site/index.ts ***!
  \***************************/

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function updateGroceryList(items) {
    const list = document.getElementById("list-content");
    list.innerHTML = ""; // Clear the current list
    items.forEach((item) => {
        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(item));
        list.appendChild(listItem);
    });
}
async function loadLists() {
    const response = await fetch("/lists");
    const lists = await response.json();
    const listNames = document.getElementById("list-names");
    listNames.innerHTML = ""; // Clear the current list names
    lists.forEach((list) => {
        const listItem = document.createElement("li");
        listItem.textContent = list;
        listItem.addEventListener("click", () => {
            loadListContents(list);
            highlightSelectedList(listItem);
        });
        listNames.appendChild(listItem);
    });
    if (lists.length > 0) {
        const currentListTitle = document.getElementById("list-title")?.textContent;
        if (!currentListTitle) {
            loadListContents(lists[0]);
            highlightSelectedList(listNames.children[0]);
        }
    }
}
async function loadListContents(listName) {
    const response = await fetch(`/lists/${listName}`);
    const items = await response.json();
    const listTitle = document.getElementById("list-title");
    listTitle.textContent = listName;
    updateGroceryList(items);
}
function highlightSelectedList(selectedItem) {
    const listItems = document.querySelectorAll(".sidebar ul li");
    listItems.forEach((item) => {
        item.classList.remove("selected");
    });
    selectedItem.classList.add("selected");
}
function handleUpdateListsEvent(changes) {
    const { listsAdded, listsRemoved, listsEdited } = changes;
    const listNames = document.getElementById("list-names");
    // Handle lists added
    listsAdded.forEach((list) => {
        const listItem = document.createElement("li");
        listItem.textContent = list;
        listItem.addEventListener("click", () => {
            loadListContents(list);
            highlightSelectedList(listItem);
        });
        listNames.appendChild(listItem);
    });
    // Handle lists removed
    listsRemoved.forEach((list) => {
        const listItem = Array.from(listNames.children).find((item) => item.textContent === list);
        if (listItem) {
            listNames.removeChild(listItem);
        }
    });
    // Handle lists edited
    listsEdited.forEach((editedList) => {
        const { name, itemsAdded, itemsRemoved, itemsEdited } = editedList;
        if (document.getElementById("list-title")
            .textContent === name) {
            const list = document.getElementById("list-content");
            // Handle items added
            itemsAdded.forEach((item) => {
                const listItem = document.createElement("li");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                listItem.appendChild(checkbox);
                listItem.appendChild(document.createTextNode(item));
                list.appendChild(listItem);
            });
            // Handle items removed
            itemsRemoved.forEach((item) => {
                const listItem = Array.from(list.children).find((li) => li.textContent === item);
                if (listItem) {
                    list.removeChild(listItem);
                }
            });
            // Handle items edited (for simplicity, we'll just update the text content)
            itemsEdited.forEach((item) => {
                const listItem = Array.from(list.children).find((li) => li.textContent === item);
                if (listItem) {
                    listItem.textContent = item;
                }
            });
        }
    });
    // Determine the active list
    if (listsEdited.length > 0) {
        const lastEditedList = listsEdited[listsEdited.length - 1].name;
        const listItem = Array.from(listNames.children).find((item) => item.textContent === lastEditedList);
        loadListContents(lastEditedList);
        highlightSelectedList(listItem);
    }
    else if (listsAdded.length > 0) {
        const lastAddedList = listsAdded[listsAdded.length - 1];
        const listItem = Array.from(listNames.children).find((item) => item.textContent === lastAddedList);
        loadListContents(lastAddedList);
        highlightSelectedList(listItem);
    }
    else if (listsRemoved.length > 0) {
        const remainingLists = Array.from(listNames.children).map((item) => item.textContent);
        if (remainingLists.length > 0) {
            const firstRemainingList = remainingLists[0];
            const listItem = Array.from(listNames.children).find((item) => item.textContent === firstRemainingList);
            loadListContents(firstRemainingList);
            highlightSelectedList(listItem);
        }
    }
}
// Initial load of lists
loadLists();
// Set up Server-Sent Events
const eventSource = new EventSource("/events");
eventSource.addEventListener("addList", (event) => {
    const newList = JSON.parse(event.data);
    const listNames = document.getElementById("list-names");
    const listItem = document.createElement("li");
    listItem.textContent = newList;
    listItem.addEventListener("click", () => {
        loadListContents(newList);
        highlightSelectedList(listItem);
    });
    listNames.appendChild(listItem);
});
eventSource.addEventListener("addItem", (event) => {
    const { listName, newItem } = JSON.parse(event.data);
    if (document.getElementById("list-title")
        .textContent === listName) {
        const list = document.getElementById("list-content");
        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(newItem));
        list.appendChild(listItem);
    }
});
eventSource.addEventListener("removeItem", (event) => {
    const { listName, itemToRemove } = JSON.parse(event.data);
    if (document.getElementById("list-title")
        .textContent === listName) {
        const list = document.getElementById("list-content");
        const items = Array.from(list.children);
        items.forEach((item) => {
            if (item.textContent === itemToRemove) {
                list.removeChild(item);
            }
        });
    }
});
eventSource.addEventListener("markOrdered", (event) => {
    const { listName, itemToMark } = JSON.parse(event.data);
    if (document.getElementById("list-title")
        .textContent === listName) {
        const list = document.getElementById("list-content");
        const items = Array.from(list.children);
        items.forEach((item) => {
            if (item.textContent === itemToMark) {
                const checkbox = item.querySelector('input[type="checkbox"]');
                checkbox.checked = true;
            }
        });
    }
});
eventSource.addEventListener("updateLists", (event) => {
    const changes = JSON.parse(event.data);
    handleUpdateListsEvent(changes);
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUNsQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUMvQix3QkFBd0IsQ0FDUCxDQUFDO2dCQUN0QixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUM1QixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxXQUFXLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDbEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9saXN0LXZpc3VhbGl6YXRpb24vLi9zcmMvc2l0ZS9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuZnVuY3Rpb24gdXBkYXRlR3JvY2VyeUxpc3QoaXRlbXM6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdC1jb250ZW50XCIpIGFzIEhUTUxVTGlzdEVsZW1lbnQ7XG4gICAgbGlzdC5pbm5lckhUTUwgPSBcIlwiOyAvLyBDbGVhciB0aGUgY3VycmVudCBsaXN0XG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCBsaXN0SXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgIGNoZWNrYm94LnR5cGUgPSBcImNoZWNrYm94XCI7XG4gICAgICAgIGxpc3RJdGVtLmFwcGVuZENoaWxkKGNoZWNrYm94KTtcbiAgICAgICAgbGlzdEl0ZW0uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaXRlbSkpO1xuICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGxpc3RJdGVtKTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZExpc3RzKCkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvbGlzdHNcIik7XG4gICAgY29uc3QgbGlzdHMgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgY29uc3QgbGlzdE5hbWVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0LW5hbWVzXCIpIGFzIEhUTUxVTGlzdEVsZW1lbnQ7XG4gICAgbGlzdE5hbWVzLmlubmVySFRNTCA9IFwiXCI7IC8vIENsZWFyIHRoZSBjdXJyZW50IGxpc3QgbmFtZXNcbiAgICBsaXN0cy5mb3JFYWNoKChsaXN0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgIGxpc3RJdGVtLnRleHRDb250ZW50ID0gbGlzdDtcbiAgICAgICAgbGlzdEl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIGxvYWRMaXN0Q29udGVudHMobGlzdCk7XG4gICAgICAgICAgICBoaWdobGlnaHRTZWxlY3RlZExpc3QobGlzdEl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgICAgbGlzdE5hbWVzLmFwcGVuZENoaWxkKGxpc3RJdGVtKTtcbiAgICB9KTtcbiAgICBpZiAobGlzdHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBjdXJyZW50TGlzdFRpdGxlID1cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdC10aXRsZVwiKT8udGV4dENvbnRlbnQ7XG4gICAgICAgIGlmICghY3VycmVudExpc3RUaXRsZSkge1xuICAgICAgICAgICAgbG9hZExpc3RDb250ZW50cyhsaXN0c1swXSk7XG4gICAgICAgICAgICBoaWdobGlnaHRTZWxlY3RlZExpc3QobGlzdE5hbWVzLmNoaWxkcmVuWzBdIGFzIEhUTUxMSUVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkTGlzdENvbnRlbnRzKGxpc3ROYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAvbGlzdHMvJHtsaXN0TmFtZX1gKTtcbiAgICBjb25zdCBpdGVtcyA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBjb25zdCBsaXN0VGl0bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgXCJsaXN0LXRpdGxlXCIsXG4gICAgKSBhcyBIVE1MSGVhZGluZ0VsZW1lbnQ7XG4gICAgbGlzdFRpdGxlLnRleHRDb250ZW50ID0gbGlzdE5hbWU7XG4gICAgdXBkYXRlR3JvY2VyeUxpc3QoaXRlbXMpO1xufVxuXG5mdW5jdGlvbiBoaWdobGlnaHRTZWxlY3RlZExpc3Qoc2VsZWN0ZWRJdGVtOiBIVE1MTElFbGVtZW50KSB7XG4gICAgY29uc3QgbGlzdEl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaWRlYmFyIHVsIGxpXCIpO1xuICAgIGxpc3RJdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xuICAgIH0pO1xuICAgIHNlbGVjdGVkSXRlbS5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVVwZGF0ZUxpc3RzRXZlbnQoY2hhbmdlczogYW55KSB7XG4gICAgY29uc3QgeyBsaXN0c0FkZGVkLCBsaXN0c1JlbW92ZWQsIGxpc3RzRWRpdGVkIH0gPSBjaGFuZ2VzO1xuICAgIGNvbnN0IGxpc3ROYW1lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdC1uYW1lc1wiKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xuXG4gICAgLy8gSGFuZGxlIGxpc3RzIGFkZGVkXG4gICAgbGlzdHNBZGRlZC5mb3JFYWNoKChsaXN0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgIGxpc3RJdGVtLnRleHRDb250ZW50ID0gbGlzdDtcbiAgICAgICAgbGlzdEl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIGxvYWRMaXN0Q29udGVudHMobGlzdCk7XG4gICAgICAgICAgICBoaWdobGlnaHRTZWxlY3RlZExpc3QobGlzdEl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgICAgbGlzdE5hbWVzLmFwcGVuZENoaWxkKGxpc3RJdGVtKTtcbiAgICB9KTtcblxuICAgIC8vIEhhbmRsZSBsaXN0cyByZW1vdmVkXG4gICAgbGlzdHNSZW1vdmVkLmZvckVhY2goKGxpc3Q6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBsaXN0SXRlbSA9IEFycmF5LmZyb20obGlzdE5hbWVzLmNoaWxkcmVuKS5maW5kKFxuICAgICAgICAgICAgKGl0ZW0pID0+IGl0ZW0udGV4dENvbnRlbnQgPT09IGxpc3QsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChsaXN0SXRlbSkge1xuICAgICAgICAgICAgbGlzdE5hbWVzLnJlbW92ZUNoaWxkKGxpc3RJdGVtKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSGFuZGxlIGxpc3RzIGVkaXRlZFxuICAgIGxpc3RzRWRpdGVkLmZvckVhY2goKGVkaXRlZExpc3Q6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCB7IG5hbWUsIGl0ZW1zQWRkZWQsIGl0ZW1zUmVtb3ZlZCwgaXRlbXNFZGl0ZWQgfSA9IGVkaXRlZExpc3Q7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3QtdGl0bGVcIikgYXMgSFRNTEhlYWRpbmdFbGVtZW50KVxuICAgICAgICAgICAgICAgIC50ZXh0Q29udGVudCA9PT0gbmFtZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgICAgICAgICBcImxpc3QtY29udGVudFwiLFxuICAgICAgICAgICAgKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xuXG4gICAgICAgICAgICAvLyBIYW5kbGUgaXRlbXMgYWRkZWRcbiAgICAgICAgICAgIGl0ZW1zQWRkZWQuZm9yRWFjaCgoaXRlbTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICAgICAgY2hlY2tib3gudHlwZSA9IFwiY2hlY2tib3hcIjtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5hcHBlbmRDaGlsZChjaGVja2JveCk7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaXRlbSkpO1xuICAgICAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBpdGVtcyByZW1vdmVkXG4gICAgICAgICAgICBpdGVtc1JlbW92ZWQuZm9yRWFjaCgoaXRlbTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdEl0ZW0gPSBBcnJheS5mcm9tKGxpc3QuY2hpbGRyZW4pLmZpbmQoXG4gICAgICAgICAgICAgICAgICAgIChsaSkgPT4gbGkudGV4dENvbnRlbnQgPT09IGl0ZW0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5yZW1vdmVDaGlsZChsaXN0SXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBpdGVtcyBlZGl0ZWQgKGZvciBzaW1wbGljaXR5LCB3ZSdsbCBqdXN0IHVwZGF0ZSB0aGUgdGV4dCBjb250ZW50KVxuICAgICAgICAgICAgaXRlbXNFZGl0ZWQuZm9yRWFjaCgoaXRlbTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdEl0ZW0gPSBBcnJheS5mcm9tKGxpc3QuY2hpbGRyZW4pLmZpbmQoXG4gICAgICAgICAgICAgICAgICAgIChsaSkgPT4gbGkudGV4dENvbnRlbnQgPT09IGl0ZW0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW0udGV4dENvbnRlbnQgPSBpdGVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIGFjdGl2ZSBsaXN0XG4gICAgaWYgKGxpc3RzRWRpdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbGFzdEVkaXRlZExpc3QgPSBsaXN0c0VkaXRlZFtsaXN0c0VkaXRlZC5sZW5ndGggLSAxXS5uYW1lO1xuICAgICAgICBjb25zdCBsaXN0SXRlbSA9IEFycmF5LmZyb20obGlzdE5hbWVzLmNoaWxkcmVuKS5maW5kKFxuICAgICAgICAgICAgKGl0ZW0pID0+IGl0ZW0udGV4dENvbnRlbnQgPT09IGxhc3RFZGl0ZWRMaXN0LFxuICAgICAgICApIGFzIEhUTUxMSUVsZW1lbnQ7XG4gICAgICAgIGxvYWRMaXN0Q29udGVudHMobGFzdEVkaXRlZExpc3QpO1xuICAgICAgICBoaWdobGlnaHRTZWxlY3RlZExpc3QobGlzdEl0ZW0pO1xuICAgIH0gZWxzZSBpZiAobGlzdHNBZGRlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxhc3RBZGRlZExpc3QgPSBsaXN0c0FkZGVkW2xpc3RzQWRkZWQubGVuZ3RoIC0gMV07XG4gICAgICAgIGNvbnN0IGxpc3RJdGVtID0gQXJyYXkuZnJvbShsaXN0TmFtZXMuY2hpbGRyZW4pLmZpbmQoXG4gICAgICAgICAgICAoaXRlbSkgPT4gaXRlbS50ZXh0Q29udGVudCA9PT0gbGFzdEFkZGVkTGlzdCxcbiAgICAgICAgKSBhcyBIVE1MTElFbGVtZW50O1xuICAgICAgICBsb2FkTGlzdENvbnRlbnRzKGxhc3RBZGRlZExpc3QpO1xuICAgICAgICBoaWdobGlnaHRTZWxlY3RlZExpc3QobGlzdEl0ZW0pO1xuICAgIH0gZWxzZSBpZiAobGlzdHNSZW1vdmVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nTGlzdHMgPSBBcnJheS5mcm9tKGxpc3ROYW1lcy5jaGlsZHJlbikubWFwKFxuICAgICAgICAgICAgKGl0ZW0pID0+IGl0ZW0udGV4dENvbnRlbnQsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChyZW1haW5pbmdMaXN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBmaXJzdFJlbWFpbmluZ0xpc3QgPSByZW1haW5pbmdMaXN0c1swXTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RJdGVtID0gQXJyYXkuZnJvbShsaXN0TmFtZXMuY2hpbGRyZW4pLmZpbmQoXG4gICAgICAgICAgICAgICAgKGl0ZW0pID0+IGl0ZW0udGV4dENvbnRlbnQgPT09IGZpcnN0UmVtYWluaW5nTGlzdCxcbiAgICAgICAgICAgICkgYXMgSFRNTExJRWxlbWVudDtcbiAgICAgICAgICAgIGxvYWRMaXN0Q29udGVudHMoZmlyc3RSZW1haW5pbmdMaXN0ISk7XG4gICAgICAgICAgICBoaWdobGlnaHRTZWxlY3RlZExpc3QobGlzdEl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBJbml0aWFsIGxvYWQgb2YgbGlzdHNcbmxvYWRMaXN0cygpO1xuXG4vLyBTZXQgdXAgU2VydmVyLVNlbnQgRXZlbnRzXG5jb25zdCBldmVudFNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZShcIi9ldmVudHNcIik7XG5cbmV2ZW50U291cmNlLmFkZEV2ZW50TGlzdGVuZXIoXCJhZGRMaXN0XCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IG5ld0xpc3QgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuICAgIGNvbnN0IGxpc3ROYW1lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdC1uYW1lc1wiKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xuICAgIGNvbnN0IGxpc3RJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgIGxpc3RJdGVtLnRleHRDb250ZW50ID0gbmV3TGlzdDtcbiAgICBsaXN0SXRlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBsb2FkTGlzdENvbnRlbnRzKG5ld0xpc3QpO1xuICAgICAgICBoaWdobGlnaHRTZWxlY3RlZExpc3QobGlzdEl0ZW0pO1xuICAgIH0pO1xuICAgIGxpc3ROYW1lcy5hcHBlbmRDaGlsZChsaXN0SXRlbSk7XG59KTtcblxuZXZlbnRTb3VyY2UuYWRkRXZlbnRMaXN0ZW5lcihcImFkZEl0ZW1cIiwgKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgeyBsaXN0TmFtZSwgbmV3SXRlbSB9ID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICBpZiAoXG4gICAgICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3QtdGl0bGVcIikgYXMgSFRNTEhlYWRpbmdFbGVtZW50KVxuICAgICAgICAgICAgLnRleHRDb250ZW50ID09PSBsaXN0TmFtZVxuICAgICkge1xuICAgICAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgICBcImxpc3QtY29udGVudFwiLFxuICAgICAgICApIGFzIEhUTUxVTGlzdEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGxpc3RJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgY2hlY2tib3gudHlwZSA9IFwiY2hlY2tib3hcIjtcbiAgICAgICAgbGlzdEl0ZW0uYXBwZW5kQ2hpbGQoY2hlY2tib3gpO1xuICAgICAgICBsaXN0SXRlbS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuZXdJdGVtKSk7XG4gICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pO1xuICAgIH1cbn0pO1xuXG5ldmVudFNvdXJjZS5hZGRFdmVudExpc3RlbmVyKFwicmVtb3ZlSXRlbVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGxpc3ROYW1lLCBpdGVtVG9SZW1vdmUgfSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG4gICAgaWYgKFxuICAgICAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0LXRpdGxlXCIpIGFzIEhUTUxIZWFkaW5nRWxlbWVudClcbiAgICAgICAgICAgIC50ZXh0Q29udGVudCA9PT0gbGlzdE5hbWVcbiAgICApIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAgICAgXCJsaXN0LWNvbnRlbnRcIixcbiAgICAgICAgKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xuICAgICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmZyb20obGlzdC5jaGlsZHJlbik7XG4gICAgICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtLnRleHRDb250ZW50ID09PSBpdGVtVG9SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICBsaXN0LnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuZXZlbnRTb3VyY2UuYWRkRXZlbnRMaXN0ZW5lcihcIm1hcmtPcmRlcmVkXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHsgbGlzdE5hbWUsIGl0ZW1Ub01hcmsgfSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG4gICAgaWYgKFxuICAgICAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0LXRpdGxlXCIpIGFzIEhUTUxIZWFkaW5nRWxlbWVudClcbiAgICAgICAgICAgIC50ZXh0Q29udGVudCA9PT0gbGlzdE5hbWVcbiAgICApIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAgICAgXCJsaXN0LWNvbnRlbnRcIixcbiAgICAgICAgKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xuICAgICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmZyb20obGlzdC5jaGlsZHJlbik7XG4gICAgICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtLnRleHRDb250ZW50ID09PSBpdGVtVG9NYXJrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nLFxuICAgICAgICAgICAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbmV2ZW50U291cmNlLmFkZEV2ZW50TGlzdGVuZXIoXCJ1cGRhdGVMaXN0c1wiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBjaGFuZ2VzID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICBoYW5kbGVVcGRhdGVMaXN0c0V2ZW50KGNoYW5nZXMpO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=