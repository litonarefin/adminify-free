import { createRoot } from "@wordpress/element";
import App from "./App";

const root = createRoot(document.getElementById("frame-adminify-app"));
root.render(<App />);
