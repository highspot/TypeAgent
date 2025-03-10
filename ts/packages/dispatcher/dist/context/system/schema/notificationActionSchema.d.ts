export type NotificationAction = ShowNotificationsAction | ShowNotificationSummaryAction | ClearNotificationsAction;
export type ShowNotificationsAction = {
    actionName: "showNotifications";
    parameters: {
        filter: NotificationFilter;
    };
};
export type NotificationFilter = "all" | "unread";
export type ShowNotificationSummaryAction = {
    actionName: "showNotificationSummary";
};
export type ClearNotificationsAction = {
    actionName: "clearNotifications";
};
//# sourceMappingURL=notificationActionSchema.d.ts.map