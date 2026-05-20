import { useState, useEffect, useRef } from "@wordpress/element";
import { changeLightDarkMode, switcherIcons } from "../../utils/uitls";
import { useOutsideClick } from "../../hooks/useOutsideClick";

function LightDarkSwitcher({ setAdminifyColorMode }) {
    // const mode = frame_adminify_menu.light_dark_mode?.admin_ui_mode;
    const [mode, setMode] = useState(frame_adminify_menu.light_dark_mode?.admin_ui_mode);
    const [showDropdown, setShowDropdown] = useState(false);

    const ref = useRef(null);

    //  // Outside Click to hide dropdown
    useOutsideClick(ref, () => setShowDropdown(false));

    const setColorMode = (mode) => {
        setMode(mode);

        // Safely get iframe and check if AdminifyDarkMode is available
        const iframeElement = document.querySelector("#frame-adminify-app--iframe");
        const __iframe = iframeElement?.contentWindow;

        // Check if AdminifyDarkMode exists before using it
        if (!window.AdminifyDarkMode || !__iframe?.AdminifyDarkMode) {
            console.warn("AdminifyDarkMode not fully loaded yet");
            // Try again after a short delay
            setTimeout(() => setColorMode(mode), 500);
            return;
        }

        try {
            if (mode === "dark") {
                window.AdminifyDarkMode.enable({ brightness: 120 });
                __iframe.AdminifyDarkMode.enable({ brightness: 120 });
                setAdminifyColorMode( prev => ({...prev, admin_ui_mode: "dark" }) );
                changeLightDarkMode("dark");

                // Add body dark class 
                window.document.body.classList.add("adminify-dark-mode");
                __iframe.document.body.classList.add("adminify-dark-mode");
                // Remove body light class
                window.document.body.classList.remove("adminify-light-mode");
                __iframe.document.body.classList.remove("adminify-light-mode");
            } else if (mode === "light") {
                window.AdminifyDarkMode.disable();
                __iframe.AdminifyDarkMode.disable();
                setAdminifyColorMode( prev => ({...prev, admin_ui_mode: "light" }) );
                changeLightDarkMode("light");

                // Add body light class 
                window.document.body.classList.add("adminify-light-mode");
                __iframe.document.body.classList.add("adminify-light-mode");
                // Remove body light class
                window.document.body.classList.remove("adminify-dark-mode");
                __iframe.document.body.classList.remove("adminify-dark-mode");
            } else {
                const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (isDark) {
                    window.AdminifyDarkMode.enable({ brightness: 120 });
                    __iframe.AdminifyDarkMode.enable({ brightness: 120 });

                    // Add body dark class 
                    window.document.body.classList.add("adminify-dark-mode");
                    __iframe.document.body.classList.add("adminify-dark-mode");
                    // Remove body light class
                    window.document.body.classList.remove("adminify-light-mode");
                    __iframe.document.body.classList.remove("adminify-light-mode");
                } else {
                    window.AdminifyDarkMode.disable();
                    __iframe.AdminifyDarkMode.disable();

                    // Add body dark class 
                    window.document.body.classList.add("adminify-light-mode");
                    __iframe.document.body.classList.add("adminify-light-mode");
                    // Remove body light class
                    window.document.body.classList.remove("adminify-dark-mode");
                    __iframe.document.body.classList.remove("adminify-dark-mode");
                }
                setAdminifyColorMode( prev => ({...prev, admin_ui_mode: "system" }) );
                changeLightDarkMode("system");
                
            }
        } catch (error) {
            console.error("Error setting color mode:", error);
            // Fallback: just set the mode without dark mode library
            setAdminifyColorMode( prev => ({...prev, admin_ui_mode: "light" }) );
            changeLightDarkMode(mode);
        }
    };

    return (
        <div id="adminify-color-mode-wrapper">
            <div onClick={() => setShowDropdown(true)} className={`adminify-mode-icon`}>
                {switcherIcons[mode]}
            </div>
            <div
                ref={ref}
                className="light-dark-dropdown"
                {...(!!showDropdown
                    ? { style: { visibility: "visible", opacity: 1, transform: "none" } }
                    : {})}>
                <div className="light" onClick={() => setColorMode("light")}>
                    <svg viewBox="0 0 24 24" width="24" height="24" className="lightIcon">
                        <path
                            fill="var(--adminify-menu-text-color)"
                            d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"></path>
                    </svg>
                    <span>Light</span>
                </div>
                <div className="dark" onClick={() => setColorMode("dark")}>
                    <svg viewBox="0 0 24 24" width="24" height="24" className="darkIcon">
                        <path
                            fill="var(--adminify-menu-text-color)"
                            d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"></path>
                    </svg>
                    <span>Dark</span>
                </div>
                <div className="system" onClick={() => setColorMode("system")}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 22 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="systemIcon">
                        <path
                            d="M20 13V4.2C20 3.0799 20 2.51984 19.782 2.09202C19.5903 1.71569 19.2843 1.40973 18.908 1.21799C18.4802 1 17.9201 1 16.8 1H5.2C4.07989 1 3.51984 1 3.09202 1.21799C2.71569 1.40973 2.40973 1.71569 2.21799 2.09202C2 2.51984 2 3.0799 2 4.2V13M3.66667 17H18.3333C18.9533 17 19.2633 17 19.5176 16.9319C20.2078 16.7469 20.7469 16.2078 20.9319 15.5176C21 15.2633 21 14.9533 21 14.3333C21 14.0233 21 13.8683 20.9659 13.7412C20.8735 13.3961 20.6039 13.1265 20.2588 13.0341C20.1317 13 19.9767 13 19.6667 13H2.33333C2.02334 13 1.86835 13 1.74118 13.0341C1.39609 13.1265 1.12654 13.3961 1.03407 13.7412C1 13.8683 1 14.0233 1 14.3333C1 14.9533 1 15.2633 1.06815 15.5176C1.25308 16.2078 1.79218 16.7469 2.48236 16.9319C2.73669 17 3.04669 17 3.66667 17Z"
                            stroke="var(--adminify-menu-text-color)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span>System</span>
                </div>
            </div>
        </div>
    );
}

export default LightDarkSwitcher;
