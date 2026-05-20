import { remove, run } from "./src/main";

window.AdminifyDarkMode = {
    enable: (config) => run(config),
    disable: () => remove(),
};
