import React, { Fragment } from "react";
import TopSecondary from "./components/TopSecondary";
import Logo from "../Sidebar/components/Logo";
import MenuItems from "./components/MenuItems";

function Topbar({
    lightDarkMode,
    setAdminifyColorMode,
    adminifyColorMode,
    setFolded,
    setShowSearch,
    getWidth,
    setCollapse,
    collapse,
    setUrl,
    iframeFullReady,
    folded,
}) {
    const menuLayoutSettings = frame_adminify_menu.menu_layout_settings;

    return (
        <div
            className={`adminify-toolbar-wrapper ${
                menuLayoutSettings?.layout_type === "horizontal"
                    ? "adminify-horizontal-toolbar"
                    : ""
            } ${folded ? "adminify-toolbar-collapse" : ""}`}>
            <Logo lightDarkMode={lightDarkMode} adminifyColorMode={adminifyColorMode} folded={folded} getWidth={getWidth} />
            <div className="adminify-toolbar">
                <ul className="adminify-top-menu">
                    {menuLayoutSettings?.layout_type === "vertical" || getWidth ? (
                        <li className="adminify-top-menu-item adminify-hambuger">
                            <button
                                onClick={() => {
                                    getWidth ? setCollapse(!collapse) : setFolded((prev) => !prev);
                                }}
                                className="adminify-hambuger-menu"
                                id="collapse-button">
                                <svg
                                    width="11"
                                    height="8"
                                    viewBox="0 0 11 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M7 0H0V1H7V0Z"
                                        fill="var(--adminify-menu-text-color)"
                                    />
                                    <path
                                        d="M7 7H0V8H7V7Z"
                                        fill="var(--adminify-menu-text-color)"
                                    />
                                    <path
                                        d="M4.67 3.5H0V4.5H4.67V3.5Z"
                                        fill="var(--adminify-menu-text-color)"
                                    />
                                    <path
                                        d="M9.65 7.35L6.29 4L9.65 0.65L10.35 1.35L7.71 4L10.35 6.65L9.65 7.35Z"
                                        fill="var(--adminify-menu-text-color)"
                                    />
                                </svg>
                            </button>
                        </li>
                    ) : null}

                    {getWidth ? null : (
                        <Fragment>
                            {adminify_admin_bar_data?.data
                                ?.filter((item) => item.id !== "top-secondary")
                                ?.filter((item) => !!item?.menu_status)
                                ?.map((menu, i) => {
                                    const depthLevel = 0;

                                    return (
                                        <MenuItems
                                            setUrl={setUrl}
                                            items={menu}
                                            key={menu.key || i}
                                            depthLevel={depthLevel}
                                        />
                                    );
                                })}
                        </Fragment>
                    )}
                </ul>

                <TopSecondary
                    setUrl={setUrl}
                    setShowSearch={setShowSearch}
                    getWidth={getWidth}
                    iframeFullReady={iframeFullReady}
                    setAdminifyColorMode={setAdminifyColorMode}
                />
            </div>
        </div>
    );
}

export default Topbar;
