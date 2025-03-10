// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { NotifyCommands } from "../../interactiveIO.js";
import { DispatcherName } from "../../dispatcher/dispatcherUtils.js";
class NotifyInfoCommandHandler {
    constructor() {
        this.description = "Shows the number of notifications available";
    }
    async run(context) {
        const systemContext = context.sessionContext.agentContext;
        systemContext.clientIO.notify("showNotifications", systemContext.requestId, NotifyCommands.ShowSummary, DispatcherName);
    }
}
class NotifyClearCommandHandler {
    constructor() {
        this.description = "Clears notifications";
    }
    async run(context) {
        const systemContext = context.sessionContext.agentContext;
        systemContext.clientIO.notify("showNotifications", systemContext.requestId, NotifyCommands.Clear, DispatcherName);
    }
}
class NotifyShowUnreadCommandHandler {
    constructor() {
        this.description = "Shows unread notifications";
    }
    async run(context) {
        const systemContext = context.sessionContext.agentContext;
        systemContext.clientIO.notify("showNotifications", systemContext.requestId, NotifyCommands.ShowUnread, DispatcherName);
    }
}
class NotifyShowAllCommandHandler {
    constructor() {
        this.description = "Shows all notifications";
    }
    async run(context) {
        const systemContext = context.sessionContext.agentContext;
        systemContext.clientIO.notify("showNotifications", systemContext.requestId, NotifyCommands.ShowAll, DispatcherName);
    }
}
export function getNotifyCommandHandlers() {
    return {
        description: "Notify commands",
        defaultSubCommand: "info",
        commands: {
            info: new NotifyInfoCommandHandler(),
            clear: new NotifyClearCommandHandler(),
            show: {
                description: "Show notifications",
                defaultSubCommand: "unread",
                commands: {
                    unread: new NotifyShowUnreadCommandHandler(),
                    all: new NotifyShowAllCommandHandler(),
                },
            },
        },
    };
}
//# sourceMappingURL=notifyCommandHandler.js.map