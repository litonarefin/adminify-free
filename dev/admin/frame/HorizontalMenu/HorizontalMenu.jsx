import { Fragment, useEffect, useRef, useState } from "@wordpress/element";
import { checkAdminUrl, getActiveMenu, getIcon, handleURLChange, normalizeCopyDeletePostsMenu } from "../utils/uitls";

function HorizontalMenu({ setUrl, collapse, setCollapse, getWidth }) {
    const menus = frame_adminify_menu.menu;
    const menuLayoutSettings = frame_adminify_menu.menu_layout_settings;

    // Settings Data
    const [activeMenu, setActiveMenu] = useState(getActiveMenu(menus) || []);
    const [activeSubmenu, setActiveSubmenu] = useState(getActiveMenu(menus, true) || "");
    const [activeThirdLevel, setActiveThirdLevel] = useState("");

    const ref = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setCollapse(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        document
            .querySelector("#frame-adminify-app--iframe")
            .contentWindow.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
            document
                .querySelector("#frame-adminify-app--iframe")
                .contentWindow.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);

    return (
        <div
            ref={ref}
            className={`adminify-horizontal-menu-wrapper ${
                collapse ? "adminify-horizontal-sidebar-collapse" : ""
            } ${
                menuLayoutSettings?.horz_menu_type === "icons_only"
                    ? "adminify-horizontal-menu-icons-only"
                    : ""
            } ${
                menuLayoutSettings.horz_bubble_icon_hide > "0"
                    ? "adminify-horizontal-menu-bubble"
                    : ""
            }`}
        >
            <ul>
                {Object.values(menus).map((menu, i) => {
                    const menuStr = `<div class="frame-adminify-menu-item-wrap">${getIcon(
                        menu,
                        getWidth
                    )} ${
                        menuLayoutSettings?.horz_menu_type === "icons_only" && getWidth === false
                            ? ""
                            : `<span class="frame-adminify-menu-item-name">${normalizeCopyDeletePostsMenu(menu?.title)}</span>`
                    }
                    </div> ${
                        menuLayoutSettings?.horz_dropdown_icon > 0 || getWidth
                            ? menu?.children.length === 0
                                ? ""
                                : `<span class="frame-adminify-submenu-arrow">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                        >
                            <path d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8l256 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z" />
                        </svg>
                    </span>`
                            : ""
                    }`;

                    if (menu?.children.length === 0) {
                        // Menu Without Submenu, Refresh the Frame
                        return (
                            <Fragment key={menu?.key || i}>
                                {!menu?.title ? null : (
                                    <li
                                        className={`frame-adminify-menu-item${
                                            activeMenu.includes(menu?.key)
                                                ? " frame-adminify--menu-active"
                                                : ""
                                        }`}
                                        id={menu?.name || menu?.key}
                                    >
                                        <a
                                            href={menu?.url}
                                            dangerouslySetInnerHTML={{
                                                __html: menuStr,
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleURLChange(menu?.url);
                                                setUrl(menu?.url);
                                                setActiveMenu([menu?.key]);
                                            }}
                                        />
                                    </li>
                                )}
                            </Fragment>
                        );
                    } else {
                        return (
                            // Menu With Submenu, Do not Refresh the Frame
                            <li
                                key={menu?.key}
                                className={`frame-adminify-menu-item frame-adminify-has-submenu${
                                    activeMenu.includes(menu?.key)
                                        ? " frame-adminify--menu-active"
                                        : ""
                                }`}
                                id={menu?.name || menu?.key}
                            >
                                <a
                                    href={menu?.url ? menu?.url : "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: menuStr,
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (
                                            !!menuLayoutSettings?.horz_toplinks &&
                                            menuLayoutSettings?.horz_toplinks != "0"
                                        ) {
                                            setUrl(menu?.url);
                                            handleURLChange(menu?.url);
                                            setActiveMenu([menu?.key]);
                                            setActiveSubmenu(
                                                Object.values(menu?.children)?.[0]?.key ===
                                                    menu?.key
                                                    ? Object.values(menu?.children)?.[0]?.key
                                                    : ""
                                            );
                                        }
                                    }}
                                />
                                <div className="frame-adminify-submenu-wrapper">
                                    <ul className="frame-adminify-submenu">
                                        {Object.values(menu?.children).map((submenu, i) => {
                                            // Check if submenu has 3rd level children (e.g., Elementor flyout)
                                            const hasThirdLevel = submenu?.has_flyout_children && submenu?.children && Object.keys(submenu.children).length > 0;

                                            // Menu With Submenu, Refresh the Frame
                                            return (
                                                <li
                                                    key={submenu?.key || i}
                                                    className={`frame-adminify-submenu-item${
                                                        activeSubmenu === submenu?.key
                                                            ? " frame-adminify-submenu-active"
                                                            : ""
                                                    }${
                                                        hasThirdLevel
                                                            ? " frame-adminify-has-third-level"
                                                            : ""
                                                    }`}
                                                    id={submenu?.name || submenu?.key}
                                                >
                                                    <a
                                                        href={submenu?.url}
                                                        dangerouslySetInnerHTML={{
                                                            __html: hasThirdLevel
                                                                ? submenu?.title + '<span class="frame-adminify-third-level-arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg></span>'
                                                                : submenu?.title,
                                                        }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleURLChange(submenu?.url);
                                                            setUrl(submenu?.url);
                                                            setActiveMenu(menu?.key);
                                                            setActiveSubmenu(submenu?.key);
                                                        }}
                                                    />

                                                    {/* Third Level Flyout */}
                                                    {hasThirdLevel && (
                                                        <div className="frame-adminify-third-level-wrapper">
                                                            <ul className="frame-adminify-third-level-menu">
                                                                {Object.values(submenu.children).map((thirdLevel) => (
                                                                    <li
                                                                        key={thirdLevel?.key}
                                                                        className={`frame-adminify-third-level-item${
                                                                            thirdLevel?.key === activeThirdLevel
                                                                                ? " frame-adminify--third-level-active"
                                                                                : ""
                                                                        }`}
                                                                         id={thirdLevel?.name || thirdLevel?.key}
                                                                    >
                                                                        <a
                                                                            href={thirdLevel?.url}
                                                                            {...(!checkAdminUrl(thirdLevel?.url) || thirdLevel?.external_link ? { target: "_blank" } : {})}
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: thirdLevel?.title,
                                                                            }}
                                                                            onClick={(e) => {
                                                                                if (thirdLevel?.external_link) {
                                                                                    e.preventDefault();
                                                                                    window.open(thirdLevel?.url, "_blank");
                                                                                    return;
                                                                                }
                                                                                if (!!checkAdminUrl(thirdLevel?.url)) {
                                                                                    e.preventDefault();
                                                                                    handleURLChange(thirdLevel?.url);
                                                                                    setUrl(thirdLevel?.url);
                                                                                    setActiveMenu(menu?.key);
                                                                                    setActiveSubmenu(submenu?.key);
                                                                                    setActiveThirdLevel(thirdLevel?.key);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
}

export default HorizontalMenu;
