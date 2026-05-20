import { useEffect } from "@wordpress/element";
import { waitForElm } from "../utils/uitls";

export function useOutsideClick(ref, callback = () => {}) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                return callback();
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        waitForElm("#frame-adminify-app--iframe").then((elm) => {
            elm.contentWindow.addEventListener("mousedown", handleClickOutside);
            // elm.contentWindow.onload = (event) => {};
        });
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
            waitForElm("#frame-adminify-app--iframe").then((elm) => {
                elm.contentWindow.addEventListener("mousedown", handleClickOutside);
                // elm.contentWindow.onload = (event) => {};
            });
        };
    }, [ref]);
}
