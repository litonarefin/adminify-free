import { Fragment, useEffect, useRef, useState } from "@wordpress/element";
import { checkAdminUrl, getActiveMenu, getIcon, handleURLChange, normalizeCopyDeletePostsMenu } from "../utils/uitls";
import UserInfo from "./components/UserInfo";
import MenuSearch from "./components/MenuSearch";

function Sidebar({ setUrl, iframeClickedActiveMenu, folded, collapse, setCollapse, topbarHeight }) {
    // Settings Data
    const sidebarData = frame_adminify_menu.menu;
    const userInfo = frame_adminify_menu.user_info;
    let menuLayoutSettings = frame_adminify_menu.menu_layout_settings;
    const isPro = !!frame_adminify_menu.is_pro;
    const menuSearch = isPro && menuLayoutSettings?.menu_search ? !!Number(menuLayoutSettings?.menu_search) : false;
    const userInfoFields = menuLayoutSettings?.user_info_fields;

    if (
        menuLayoutSettings?.menu_hover_submenu === "classic" ||
        !menuLayoutSettings?.menu_hover_submenu
    ) {
        menuLayoutSettings = {
            ...menuLayoutSettings,
            menu_hover_submenu: "two_step",
        };
    }

    const [submenuHeight, setSubmenuHeight] = useState({});
    const [thirdLevelHeight, setThirdLevelHeight] = useState({});

    // States
    const [activeMenu, setActiveMenu] = useState(getActiveMenu(sidebarData) || []);
    const [activeSubmenu, setActiveSubmenu] = useState(getActiveMenu(sidebarData, true) || "");
    const [activeThirdLevel, setActiveThirdLevel] = useState("");

    const [showSubmenu, setShowSubmenu] = useState([]);
    const [showThirdLevel, setShowThirdLevel] = useState([]);
    const [searchText, setSearchText] = useState("");

    // For Two Step mode: track which 3rd level panel is showing
    const [twoStepThirdLevel, setTwoStepThirdLevel] = useState(null);

    const handleActiveMenu = (id) => {
        setActiveMenu([id]);
    };

    // Show Or Hide Submenu
    const handleShowSubmenu = (id) => {
        // Reset third level when changing submenu
        setShowThirdLevel([]);
        setTwoStepThirdLevel(null);

        if (
            menuLayoutSettings?.menu_hover_submenu === "toggle" ||
            menuLayoutSettings?.menu_hover_submenu === "accordion"
        ) {
            if (showSubmenu.includes(id)) {
                let index = showSubmenu.indexOf(id);
                let newMenu = [...showSubmenu];
                newMenu.splice(index, 1);
                setShowSubmenu(newMenu);
            } else {
                if (menuLayoutSettings?.menu_hover_submenu === "accordion") {
                    setShowSubmenu([id]);
                } else {
                    setShowSubmenu([...showSubmenu, id]);
                }
            }
        } else {
            setShowSubmenu([id]);
        }
    };

    // Show Or Hide Third Level Menu (for Elementor flyout items etc.)
    const handleShowThirdLevel = (id, e, submenuData, parentMenuKey) => {
        // For Two Step mode: show as separate panel
        if (menuLayoutSettings?.menu_hover_submenu === "two_step") {
            setTwoStepThirdLevel({
                key: id,
                title: submenuData?.title,
                children: submenuData?.children
            });
            return;
        }

        // For Accordion/Toggle modes: use height animation
        if (
            menuLayoutSettings?.menu_hover_submenu === "toggle" ||
            menuLayoutSettings?.menu_hover_submenu === "accordion"
        ) {
            const isClosing = showThirdLevel.includes(id);
            const thirdLevelEl = e?.currentTarget?.nextElementSibling;
            const thirdLevelScrollHeight = thirdLevelEl?.scrollHeight || thirdLevelHeight[id] || 0;

            if (isClosing) {
                // Closing: subtract third level height from parent submenu
                setShowThirdLevel(showThirdLevel.filter(item => item !== id));
                if (parentMenuKey && submenuHeight[parentMenuKey]) {
                    setSubmenuHeight({
                        ...submenuHeight,
                        [parentMenuKey]: submenuHeight[parentMenuKey] - thirdLevelScrollHeight,
                    });
                }
            } else {
                if (menuLayoutSettings?.menu_hover_submenu === "accordion") {
                    // Accordion: only one open at a time
                    // First, subtract any previously open third level heights
                    let newSubmenuHeight = { ...submenuHeight };
                    showThirdLevel.forEach(openId => {
                        if (thirdLevelHeight[openId] && parentMenuKey) {
                            newSubmenuHeight[parentMenuKey] = (newSubmenuHeight[parentMenuKey] || 0) - thirdLevelHeight[openId];
                        }
                    });
                    setShowThirdLevel([id]);

                    // Add new third level height
                    if (parentMenuKey) {
                        newSubmenuHeight[parentMenuKey] = (newSubmenuHeight[parentMenuKey] || submenuHeight[parentMenuKey] || 0) + thirdLevelScrollHeight;
                        setSubmenuHeight(newSubmenuHeight);
                    }
                } else {
                    // Toggle: multiple can be open
                    setShowThirdLevel([...showThirdLevel, id]);

                    // Add third level height to parent submenu
                    if (parentMenuKey && submenuHeight[parentMenuKey]) {
                        setSubmenuHeight({
                            ...submenuHeight,
                            [parentMenuKey]: submenuHeight[parentMenuKey] + thirdLevelScrollHeight,
                        });
                    }
                }

                // Store height for animation
                if (thirdLevelEl && !thirdLevelHeight.hasOwnProperty(id)) {
                    setThirdLevelHeight({
                        ...thirdLevelHeight,
                        [id]: thirdLevelScrollHeight,
                    });
                }
            }
        } else {
            // Default toggle behavior
            if (showThirdLevel.includes(id)) {
                setShowThirdLevel([]);
            } else {
                setShowThirdLevel([id]);
            }
        }
    };

    // Go back from third level panel (Two Step mode)
    const handleBackFromThirdLevel = () => {
        setTwoStepThirdLevel(null);
    };

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

    useEffect(() => {
        if (iframeClickedActiveMenu?.menu?.length > 0) {
            setActiveMenu([...iframeClickedActiveMenu?.menu]);
        }
        if (!!iframeClickedActiveMenu?.submenu) {
            setActiveSubmenu(iframeClickedActiveMenu?.submenu);
        }
    }, [iframeClickedActiveMenu]);

    // Filter menu items by search text
    const stripHtml = (html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const filterMenuBySearch = (menuData) => {
        if(!menuSearch) return menuData;

        if (!searchText.trim()) return menuData;
        const query = searchText.toLowerCase().trim();
        const filtered = {};
        Object.entries(menuData).forEach(([key, menu]) => {
            const menuTitle = stripHtml(menu?.title || "").toLowerCase();
            if (menuTitle.includes(query)) {
                filtered[key] = menu;
                return;
            }
            if (menu?.children && Object.keys(menu.children).length > 0) {
                const matchedChildren = {};
                Object.entries(menu.children).forEach(([childKey, child]) => {
                    const childTitle = stripHtml(child?.title || "").toLowerCase();
                    if (childTitle.includes(query)) {
                        matchedChildren[childKey] = child;
                    }
                });
                if (Object.keys(matchedChildren).length > 0) {
                    filtered[key] = { ...menu, children: matchedChildren };
                }
            }
        });
        return filtered;
    };

    const filteredSidebarData = filterMenuBySearch(sidebarData);

    // Helper function to check if menu mode is two_step
    const isTwoStepMode = menuLayoutSettings?.menu_hover_submenu === "two_step";
    const isAccordionOrToggle = menuLayoutSettings?.menu_hover_submenu === "accordion" ||
                                 menuLayoutSettings?.menu_hover_submenu === "toggle";

    return (
        <div
            ref={ref}
            data-menu-mode={menuLayoutSettings?.menu_hover_submenu}
            className={`frame-adminify-sidebar-wrap frame-adminify-menu-mode-${
                menuLayoutSettings?.menu_mode
            } ${
                folded
                    ? `adminify-sidebar-folded ${
                          menuLayoutSettings?.menu_mode === "rounded"
                              ? ""
                              : menuLayoutSettings?.icon_style === "rounded"
                              ? "adminify-icon-style-rounded"
                              : ""
                      }`
                    : ""
            } ${collapse ? "adminify-sidebar-collapse" : ""}`}>
            <div className="frame-adminify-admin-menu-wrapper">
                <div
                    className="frame-adminify-admin-main-menu"
                    style={{ height: `calc(100vh - ${topbarHeight + 20}px)` }}>
                    <ul className="frame-adminify-admin-menu">
                        {!!userInfoFields?.enable_user_info &&
                        userInfoFields?.enable_user_info != "0" &&
                        !folded ? (
                            <UserInfo
                                userInfo={{
                                    ...userInfo,
                                    ...userInfoFields,
                                    ...frame_adminify_menu.menu_layout_settings?.user_info_style,
                                }}
                            />
                        ) : null}

                        {/* Admin Menu Search  */}
                        { menuSearch ? (
                                <li className="frame-adminify-menu-item">
                                    <MenuSearch onSearch={setSearchText} />
                                </li>
                            ) : null }
                        
                    
                        {Object.values(filteredSidebarData).map((menu, index) => {
                            const menuStr = `<div class="frame-adminify-menu-item-wrap">${getIcon(
                                menu
                            )} <span class="frame-adminify-menu-item-name">${
                                normalizeCopyDeletePostsMenu(menu?.title)
                            }</span></div>`;

                            if (menu?.children.length === 0) {
                                // Menu Without Submenu, Refresh the Frame
                                return (
                                    <Fragment key={menu?.key}>
                                        {!!menu?.title ? (
                                            <li
                                                className={`frame-adminify-menu-item ${
                                                    activeMenu.includes(menu?.key)
                                                        ? "frame-adminify--menu-active"
                                                        : ""
                                                }`}
                                                id={menu?.name || menu?.key}
                                            >
                                                <a
                                                    href={menu?.url}
                                                    {...(!checkAdminUrl(menu?.url) || menu?.external_link
                                                        ? { target: "_blank" }
                                                        : {})}
                                                    onClick={(e) => {
                                                        // Allow Ctrl+Click or Cmd+Click to open in new tab
                                                        if (e.ctrlKey || e.metaKey) {
                                                            return;
                                                        }

                                                        if(menu?.external_link) {
                                                            e.preventDefault();
                                                            window.open(menu?.url, "_blank");
                                                            return;
                                                        }

                                                        if (!!checkAdminUrl(menu?.url)) {
                                                            e.preventDefault();
                                                            handleURLChange(menu?.url);
                                                            setUrl(menu?.url);
                                                            handleActiveMenu(menu?.key);
                                                        }
                                                    }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: menuStr,
                                                    }}
                                                />
                                            </li>
                                        ) : null}

                                        {!!menu?.separator && menu?.separator != "0" ? (
                                            <li className="frame-adminify-menu-item">
                                                <hr className="frame-adminify-menu-separator" />
                                            </li>
                                        ) : null}
                                    </Fragment>
                                );
                            } else {
                                return (
                                    // Menu With Submenu, Do not Refresh the Frame
                                    <Fragment key={menu?.key}>
                                        <li
                                            className={`frame-adminify-menu-item frame-adminify-has-submenu${
                                                showSubmenu?.includes(menu?.key)
                                                    ? " frame-adminify--menu-show"
                                                    : ""
                                            }${
                                                activeMenu.includes(menu?.key)
                                                    ? ` frame-adminify--menu-active`
                                                    : ""
                                            }`}
                                            id={menu?.name || menu?.key}
                                        >
                                            <a
                                                href={menu?.url ? menu?.url : "#"}
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        menuStr +
                                                        '<span class="dashicons dashicons-arrow-right-alt2"></span>',
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleShowSubmenu(menu?.key);
                                                    if (
                                                        menuLayoutSettings?.menu_hover_submenu !==
                                                            "two_step" &&
                                                        !submenuHeight.hasOwnProperty(menu?.key)
                                                    ) {
                                                        setSubmenuHeight({
                                                            ...submenuHeight,
                                                            [menu?.key]:
                                                                e.currentTarget.nextElementSibling
                                                                    ?.scrollHeight,
                                                        });
                                                    }
                                                }}
                                            />

                                            <div
                                                className={`frame-adminify-submenu-wrapper${
                                                    twoStepThirdLevel && showSubmenu?.includes(menu?.key) ? " frame-adminify-third-level-active" : ""
                                                }`}
                                                {...(menuLayoutSettings?.menu_hover_submenu !==
                                                "two_step"
                                                    ? {
                                                          style: showSubmenu?.includes(menu?.key)
                                                              ? {
                                                                    height: submenuHeight?.[
                                                                        menu?.key
                                                                    ],
                                                                }
                                                              : { height: "0px" },
                                                      }
                                                    : {})}>

                                                {/* Two Step Mode: Third Level Panel - Always in DOM for slide animation */}
                                                {isTwoStepMode && (
                                                    <div className={`frame-adminify-third-level-panel-container${
                                                        twoStepThirdLevel && showSubmenu?.includes(menu?.key) ? " frame-adminify-third-level-visible" : ""
                                                    }`}>
                                                        {twoStepThirdLevel && (
                                                            <ul className="frame-adminify-submenu frame-adminify-third-level-panel">
                                                                <li className="frame-adminify-submenu-item frame-adminify-two-step">
                                                                    <div
                                                                        className="frame-adminify-two-step-title"
                                                                        onClick={handleBackFromThirdLevel}>
                                                                        <span className="frame-adminify-arrow dashicons dashicons-arrow-left-alt2" />
                                                                        <h2
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: twoStepThirdLevel.title,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </li>
                                                                {twoStepThirdLevel.children && Object.values(twoStepThirdLevel.children).map((thirdLevel) => (
                                                                    <li
                                                                        key={thirdLevel?.key}
                                                                        className={`frame-adminify-submenu-item frame-adminify-third-level-item ${
                                                                            thirdLevel?.key === activeThirdLevel
                                                                                ? "frame-adminify--third-level-active"
                                                                                : ""
                                                                        }`}>
                                                                        <a
                                                                            href={thirdLevel?.url}
                                                                            {...(!checkAdminUrl(thirdLevel?.url) || thirdLevel?.external_link ? { target: "_blank" } : {})}
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: thirdLevel?.title,
                                                                            }}
                                                                            onClick={(e) => {
                                                                                // Allow Ctrl+Click or Cmd+Click to open in new tab
                                                                                if (e.ctrlKey || e.metaKey) {
                                                                                    return;
                                                                                }

                                                                                if (thirdLevel?.external_link) {
                                                                                    e.preventDefault();
                                                                                    window.open(thirdLevel?.url, "_blank");
                                                                                    return;
                                                                                }
                                                                                if (!!checkAdminUrl(thirdLevel?.url)) {
                                                                                    e.preventDefault();
                                                                                    handleActiveMenu(menu?.key);
                                                                                    setActiveSubmenu(twoStepThirdLevel.key);
                                                                                    setActiveThirdLevel(thirdLevel?.key);
                                                                                    handleURLChange(thirdLevel?.url);
                                                                                    setUrl(thirdLevel?.url);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Regular Submenu - slides left when third level is active */}
                                                <ul className={`frame-adminify-submenu${
                                                    isTwoStepMode && twoStepThirdLevel ? " frame-adminify-submenu-slide-left" : ""
                                                }`}>
                                                    {menuLayoutSettings?.menu_hover_submenu ===
                                                    "two_step" ? (
                                                        <li className="frame-adminify-submenu-item frame-adminify-two-step">
                                                            <div
                                                                className="frame-adminify-two-step-title"
                                                                onClick={() => {
                                                                    setShowSubmenu([]);
                                                                    setTwoStepThirdLevel(null);
                                                                }}>
                                                                <span className="frame-adminify-arrow dashicons dashicons-arrow-left-alt2" />
                                                                <h2
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: menu?.title,
                                                                    }}
                                                                />
                                                            </div>
                                                        </li>
                                                    ) : null}

                                                    {Object.values(menu?.children).map(
                                                        (submenu) => {
                                                            // Check if submenu has 3rd level children (e.g., Elementor flyout)
                                                            const hasThirdLevel = submenu?.has_flyout_children && submenu?.children && Object.keys(submenu.children).length > 0;

                                                            // Menu With Submenu, Refresh the Frame
                                                            return (
                                                                <li
                                                                    key={submenu?.key}
                                                                    className={`frame-adminify-submenu-item ${
                                                                        submenu?.key ===
                                                                        activeSubmenu
                                                                            ? "frame-adminify--submenu-active"
                                                                            : ""
                                                                    }${
                                                                        hasThirdLevel
                                                                            ? " frame-adminify-has-third-level"
                                                                            : ""
                                                                    }${
                                                                        showThirdLevel.includes(submenu?.key)
                                                                            ? " frame-adminify--third-level-show"
                                                                            : ""
                                                                    }`}>
                                                                    <a
                                                                        href={submenu?.url}
                                                                        {...(!checkAdminUrl(submenu?.url) || submenu?.external_link?  { target: "_blank" }: {})}
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: hasThirdLevel
                                                                                ? submenu?.title + '<span class="dashicons dashicons-arrow-right-alt2 frame-adminify-third-level-arrow"></span>'
                                                                                : submenu?.title,
                                                                        }}
                                                                        onClick={(e) => {
                                                                            // Allow Ctrl+Click or Cmd+Click to open in new tab
                                                                            if (e.ctrlKey || e.metaKey) {
                                                                                return;
                                                                            }

                                                                            // If has 3rd level, handle based on menu mode
                                                                            if (hasThirdLevel) {
                                                                                e.preventDefault();
                                                                                handleShowThirdLevel(submenu?.key, e, submenu, menu?.key);
                                                                                return;
                                                                            }

                                                                            if(submenu?.external_link) {
                                                                                e.preventDefault();
                                                                                window.open(submenu?.url, "_blank");
                                                                                return;
                                                                            }
                                                                            if (
                                                                                !!checkAdminUrl(
                                                                                    submenu?.url
                                                                                )
                                                                            ) {
                                                                                e.preventDefault();
                                                                                // Main Menu Active
                                                                                handleActiveMenu(
                                                                                    menu?.key
                                                                                );
                                                                                // SubMenu Active
                                                                                handleURLChange(
                                                                                    submenu?.url
                                                                                );
                                                                                setUrl(
                                                                                    submenu?.url
                                                                                );
                                                                                setActiveSubmenu(
                                                                                    submenu?.key
                                                                                );
                                                                            }
                                                                        }}
                                                                    />

                                                                    {/* Third Level Menu for Accordion/Toggle modes */}
                                                                    {hasThirdLevel && isAccordionOrToggle && (
                                                                        <div
                                                                            className={`frame-adminify-third-level-wrapper`}
                                                                            style={showThirdLevel.includes(submenu?.key)
                                                                                ? { height: thirdLevelHeight?.[submenu?.key] || 'auto' }
                                                                                : { height: "0px" }
                                                                            }>
                                                                            <ul className="frame-adminify-third-level-menu">
                                                                                {Object.values(submenu.children).map((thirdLevel) => (
                                                                                    <li
                                                                                        key={thirdLevel?.key}
                                                                                        className={`frame-adminify-third-level-item ${
                                                                                            thirdLevel?.key === activeThirdLevel
                                                                                                ? "frame-adminify--third-level-active"
                                                                                                : ""
                                                                                        }${
                                                                                            thirdLevel?.is_flyout_child
                                                                                                ? " frame-adminify-flyout-child"
                                                                                                : ""
                                                                                        }`}>
                                                                                        <a
                                                                                            href={thirdLevel?.url}
                                                                                            {...(!checkAdminUrl(thirdLevel?.url) || thirdLevel?.external_link ? { target: "_blank" } : {})}
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: thirdLevel?.title,
                                                                                            }}
                                                                                            onClick={(e) => {
                                                                                                // Allow Ctrl+Click or Cmd+Click to open in new tab
                                                                                                if (e.ctrlKey || e.metaKey) {
                                                                                                    return;
                                                                                                }

                                                                                                if (thirdLevel?.external_link) {
                                                                                                    e.preventDefault();
                                                                                                    window.open(thirdLevel?.url, "_blank");
                                                                                                    return;
                                                                                                }
                                                                                                if (!!checkAdminUrl(thirdLevel?.url)) {
                                                                                                    e.preventDefault();
                                                                                                    handleActiveMenu(menu?.key);
                                                                                                    setActiveSubmenu(submenu?.key);
                                                                                                    setActiveThirdLevel(thirdLevel?.key);
                                                                                                    handleURLChange(thirdLevel?.url);
                                                                                                    setUrl(thirdLevel?.url);
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
                                                        }
                                                    )}
                                                </ul>
                                            </div>
                                        </li>
                                        {!!menu?.separator && menu?.separator != "0" ? (
                                            <li className="frame-adminify-menu-item ">
                                                <hr className="frame-adminify-menu-separator" />
                                            </li>
                                        ) : null}
                                    </Fragment>
                                );
                            }
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
