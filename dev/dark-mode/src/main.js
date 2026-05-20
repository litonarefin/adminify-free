import { removeDynamicTheme, run_createThemeAndWatchForUpdates } from "./inject/dynamic-theme";

export function run(config) {
    run_createThemeAndWatchForUpdates(config);
}

export function remove() {
    removeDynamicTheme();
}
