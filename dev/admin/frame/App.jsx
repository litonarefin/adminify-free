import React, { useState, useEffect } from "react";

import Sidebar from "./Sidebar/Sidebar";
import Topbar from "./Topbar/Topbar";
import { getActiveMenu, handleURLChange, setDefaultURL, waitForElm } from "./utils/uitls";
import SearchForm from "./Topbar/components/SearchForm";
import HorizontalMenu from "./HorizontalMenu/HorizontalMenu";
import FrameGuard from './FrameGuard';

function App() {
    const [adminifyColorMode, setAdminifyColorMode] = useState(frame_adminify_menu.light_dark_mode);
    // Settings Data
    const lightDarkMode = frame_adminify_menu.light_dark_mode;
    const menuLayoutSettings = frame_adminify_menu.menu_layout_settings;

    // States
    const [folded, setFolded] = useState(document.body.classList.contains("folded"));
    const [url, setUrl] = useState(
        setDefaultURL(Object.values(frame_adminify_menu.menu)?.[0]?.url)
    );
    const [frameURL, setframeURL] = useState(url);
    const [iframeFullReady, setIframeFullReady] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [getWidth, setGetWidth] = useState(false);
    const [collapse, setCollapse] = useState(false);
    const [topbarHeight, setTopbarHeight] = useState("");

    const [iframeClickedActiveMenu, setIframeClickedActiveMenu] = useState({
        menu: [],
        submenu: "",
    });

    const handeLoadIframe = (e) => {
        // Hide progress bar and loading overlay - this fires reliably when iframe loads
        document.getElementById("Adminify-PreLoaderBar").style.display = "none";
        setIframeFullReady(true);
        setIframeLoading(false);

        // Wrap in try-catch to handle cross-origin iframe errors
        try {
            const url = e.target.contentWindow.location.href;
            handleURLChange(url);

            // Title
            const title = e.target.contentDocument.title;
            if (title) document.title = title;

            // Handle Hash Change
            e.target.contentWindow.addEventListener("hashchange", (e) => {
                handleURLChange(e.newURL);
            });

            /**
             * Anchor click with pre-loader
             */
            e.target.contentWindow.addEventListener("click", (e) => {
                // Check conditions immediately to prevent default before browser navigates
                if (
                    e.target.tagName === "A" &&
                    e.target.getAttribute("href") &&
                    e.target.getAttribute("href").charAt(0) !== "#" &&
                    !e.target.hasAttribute("role") &&
                    !e.defaultPrevented &&
                    e.target.getAttribute("target") !== "_blank" &&
                    e.target.getAttribute("href") !== "about:blank"
                ) {
                    // Capture URL and href immediately before they become stale
                    const url = e.target.getAttribute("href");
                    const href = e.target.href;

                    // Skip handling for javascript: protocol URLs - let browser execute them normally
                    if (typeof url === "string" && url.startsWith('javascript:')) {
                        return;
                    }

                    // Check if external link (different origin)
                    try {
                        const linkUrl = new URL(href);
                        if (linkUrl.origin !== window.location.origin) {
                            // External link - open in new tab
                            e.preventDefault();
                            window.open(href, "_blank");
                            return;
                        }
                    } catch (err) {
                        // Invalid URL - continue with normal handling
                    }

                    // Show loading overlay immediately when link is clicked
                    setIframeLoading(true);
                    document.getElementById("Adminify-PreLoaderBar").style.display = "block";

                    // Prevent default immediately for non-trash actions to avoid double navigation
                    if (!url?.includes("action=trash")) {
                        e.preventDefault();
                    }

                    // Plugin upload Overwrite not reload iframe
                    if (url?.includes("action=upload-plugin") && e.target.className.includes("update-from-upload-overwrite")) {
                        e.preventDefault();
                    }

                    // Use setTimeout for state updates
                    setTimeout(() => {
                        parent.postMessage({ link: href }, "*");

                        if (!url?.includes("action=trash")) {
                            handleURLChange(url);
                            setUrl(url);
                        }
                        setIframeClickedActiveMenu({
                            menu: getActiveMenu(frame_adminify_menu.menu, false, url),
                            submenu: getActiveMenu(frame_adminify_menu.menu, true, url),
                        });
                    }, 50);
                }
            });
        } catch (error) {
            // Cross-origin iframe - cannot access content
            console.log("Cross-origin iframe detected, cannot access content");
        }
    };

    useEffect(() => {
        let width = window.innerWidth;

        if (992 >= width) {
            let sidebarCls = document.querySelector(".frame-adminify-sidebar-wrap");
            let topbarCls = document.querySelector(".adminify-toolbar-wrapper");
            sidebarCls?.classList?.remove("adminify-sidebar-folded");
            topbarCls?.classList?.remove("adminify-toolbar-folded");
            setGetWidth(true);
        }

        const topbarHeight = document.querySelector(".adminify-toolbar-wrapper");
        setTopbarHeight(topbarHeight?.offsetHeight);
    }, []);

    const frameGuard = new FrameGuard();

    useEffect(() => {

        if ( frameGuard.isAllowed() ) {
            setframeURL(url);
        } else {
            parent.location.reload();
        }

        document.getElementById("Adminify-PreLoaderBar").style.display = "block";
        setIframeLoading(true);

        function iframeReady(el) {
            setIframeFullReady(true);
            setIframeLoading(false);
            document.getElementById("Adminify-PreLoaderBar").style.display = "none";

            // Safely remove listeners
            try {
                el.contentDocument?.removeEventListener("DOMContentLoaded", iframeReady);
                el.contentWindow?.removeEventListener("load", iframeReady);
            } catch (e) {
                // Cross-origin or inaccessible - ignore
            }
            el.removeEventListener("load", iframeReady);
        }

        waitForElm("#frame-adminify-app--iframe").then((elm) => {
            try {
                // Check if document is already loaded
                if (elm.contentDocument?.readyState === 'complete') {
                    iframeReady(elm);
                    return;
                }

                // Attach to contentDocument and contentWindow if same-origin
                elm.contentDocument?.addEventListener("DOMContentLoaded", () => iframeReady(elm));
                elm.contentWindow?.addEventListener("load", () => iframeReady(elm));
            } catch (e) {
                console.log('Cannot access contentDocument (cross-origin or error):', e.message);
            }

            // Always attach to iframe element itself - most reliable
            elm.addEventListener("load", () => iframeReady(elm));
        });

    }, [url]);

    return (
        <>
            <div className="adminify-progress" id="Adminify-PreLoaderBar">
                <div className="adminify-indeterminate" />
            </div>
            <Topbar
                lightDarkMode={lightDarkMode}
                setAdminifyColorMode={setAdminifyColorMode}
                adminifyColorMode={adminifyColorMode}
                setFolded={setFolded}
                setShowSearch={setShowSearch}
                getWidth={getWidth}
                setCollapse={setCollapse}
                collapse={collapse}
                setUrl={setUrl}
                iframeFullReady={iframeFullReady}
                folded={folded}
            />
            <div
                className={`adminify-frame-wrapper ${
                    menuLayoutSettings?.layout_type === "horizontal" &&
                    !!frame_adminify_menu?.is_pro
                        ? "adminify-horizontal-menu"
                        : "adminify-vertical-menu"
                } ${
                    folded && menuLayoutSettings?.layout_type === "vertical"
                        ? "adminify-folded"
                        : ""
                }`}>
                {menuLayoutSettings?.layout_type === "vertical" ||
                (menuLayoutSettings?.layout_type === "horizontal" &&
                    !frame_adminify_menu?.is_pro) ? (
                    <Sidebar
                        lightDarkMode={lightDarkMode}
                        folded={folded}
                        url={url}
                        iframeClickedActiveMenu={iframeClickedActiveMenu}
                        setUrl={setUrl}
                        getWidth={getWidth}
                        collapse={collapse}
                        setCollapse={setCollapse}
                        topbarHeight={topbarHeight}
                    />
                ) : null}
                <div
                    className="adminify-frame-content"
                    style={{ height: `calc(100vh - ${topbarHeight}px)` }}>
                    {menuLayoutSettings?.layout_type === "horizontal" &&
                    !!frame_adminify_menu?.is_pro ? (
                        <HorizontalMenu
                            setUrl={setUrl}
                            collapse={collapse}
                            setCollapse={setCollapse}
                            getWidth={getWidth}
                        />
                    ) : null}

                    {showSearch ? (
                        <SearchForm setShowSearch={setShowSearch} setUrl={setUrl} />
                    ) : null}

                    {/* Loading Overlay */}
                    <div className={`adminify-iframe-loading-overlay ${iframeLoading ? 'is-loading' : ''}`}>
                        <div className="adminify-loading-spinner"></div>
                    </div>

                    <iframe
                        onLoad={handeLoadIframe}
                        width={"100%"}
                        height={"100%"}
                        id="frame-adminify-app--iframe"
                        src={frameURL}
                        frameBorder="0"></iframe>
                </div>
            </div>
        </>
    );
}

export default App;
