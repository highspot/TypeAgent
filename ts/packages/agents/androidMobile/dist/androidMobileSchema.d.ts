export type AndroidMobileAction = SendSMSAction | CallPhoneNumberAction | SetAlarmAction | SearchNearbyAction | AutomatePhoneUIAction;
export type SendSMSAction = {
    actionName: "sendSMS";
    parameters: {
        originalRequest: string;
        phoneNumber: string;
        message: string;
    };
};
export type CallPhoneNumberAction = {
    actionName: "callPhoneNumber";
    parameters: {
        originalRequest: string;
        phoneNumber: string;
    };
};
export type SetAlarmAction = {
    actionName: "setAlarm";
    parameters: {
        originalRequest: string;
        time: string;
    };
};
export type SearchNearbyAction = {
    actionName: "searchNearby";
    parameters: {
        originalRequest: string;
        searchTerm: string;
    };
};
export type AutomatePhoneUIAction = {
    actionName: "automateUI";
    parameters: {
        originalRequest: string;
    };
};
//# sourceMappingURL=androidMobileSchema.d.ts.map