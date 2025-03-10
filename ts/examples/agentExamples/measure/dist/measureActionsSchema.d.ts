export type MeasurementAction = PutMeasurementAction | GetMeasurementAction | RemoveMeasurementAction;
export type PutMeasurementAction = {
    actionName: "putMeasurement";
    parameters: {
        items: Measurement[];
    };
};
export type GetMeasurementAction = {
    actionName: "getMeasurement";
    parameters: {
        filter: MeasurementFilter;
    };
};
export type RemoveMeasurementAction = {
    actionName: "removeMeasurement";
    parameters: {
        ids: string[];
    };
};
export type MeasurementDateTime = string;
export type MeasurementFilter = {
    types?: string[] | undefined;
    valueRange?: MeasurementRange;
    timeRange?: MeasurementTimeRange;
};
export type MeasurementTimeRange = {
    start?: MeasurementDateTime;
    end?: MeasurementDateTime;
};
export type MeasurementRange = {
    start?: number;
    end?: number;
    units: MeasurementUnits;
};
export type MeasurementUnits = "mg" | "kg" | "grams" | "pounds" | "cm" | "meters" | "km" | "inches" | "feet" | "miles" | "liter" | "ml" | "cup" | "ounce" | "per-day" | "per-week" | "times-day" | "times-week" | string;
export type MeasurementQuantity = {
    value: number;
    units: MeasurementUnits;
};
export type Measurement = {
    id?: number | "new" | undefined;
    type: string;
    when?: MeasurementDateTime;
    value: MeasurementQuantity;
};
//# sourceMappingURL=measureActionsSchema.d.ts.map