export type DesktopActions =
    | LaunchProgramAction
    | CloseProgramAction
    | TileWindowsAction
    | MaximizeWindowAction
    | MinimizeWindowAction
    | SwitchToWindowAction
    | SetVolumeAction
    | RestoreVolumeAction
    | MuteVolumeAction
    | SetWallpaperAction;
export type LaunchProgramAction = {
    actionName: "launchProgram";
    parameters: {
        name: KnownPrograms | string;
    };
};
export type CloseProgramAction = {
    actionName: "closeProgram";
    parameters: {
        name: KnownPrograms | string;
    };
};
export type MaximizeWindowAction = {
    actionName: "maximize";
    parameters: {
        name: KnownPrograms | string;
    };
};
export type MinimizeWindowAction = {
    actionName: "minimize";
    parameters: {
        name: KnownPrograms;
    };
};
export type SwitchToWindowAction = {
    actionName: "switchTo";
    parameters: {
        name: KnownPrograms;
    };
};
export type TileWindowsAction = {
    actionName: "tile";
    parameters: {
        leftWindow: KnownPrograms;
        rightWindow: KnownPrograms;
    };
};
export type SetVolumeAction = {
    actionName: "volume";
    parameters: {
        targetVolume: number;
    };
};
export type RestoreVolumeAction = {
    actionName: "restoreVolume";
};
export type MuteVolumeAction = {
    actionName: "mute";
    parameters: {
        on: boolean;
    };
};
export type SetWallpaperAction = {
    actionName: "setWallpaper";
    parameters: {
        filePath?: string;
        url?: string;
    };
};
export type KnownPrograms =
    | "chrome"
    | "word"
    | "excel"
    | "powerpoint"
    | "outlook"
    | "edge"
    | "visual studio"
    | "visual studio code"
    | "paint"
    | "notepad"
    | "calculator"
    | "file explorer"
    | "control panel"
    | "task manager"
    | "cmd"
    | "powershell"
    | "snipping tool"
    | "magnifier"
    | "paint 3d";
//# sourceMappingURL=actionsSchema.d.ts.map
