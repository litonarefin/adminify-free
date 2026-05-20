import { createRoot } from "@wordpress/element";
import App from "./App";

const root = createRoot(document.getElementById("wp-adminify--setup-wizard"));
root.render(<App />);
