import { dashboardIcons } from "./icons";

// Navigation Menu
export const handleMenuItemClick = (e, href, refreshFrame = false) => {
    e.preventDefault();
    if (refreshFrame) {
        document.getElementById("frame-adminify-app--iframe").contentWindow.location.href = href;
        window.history.pushState({}, "", href);
    }
};

// URL Change
export const handleURLChange = (href) => {
    try {
        // Only pushState for same-origin URLs
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
            window.history.pushState({}, "", href);
        }
    } catch (e) {
        // Invalid URL or cross-origin - ignore
    }
};

// Logo out
export const handleLogout = () => {
    window.location.href = adminify_admin_bar_data?.logout_url;
    const url = new URL(adminify_admin_bar_data?.logout_url);
    window.location.href = `${url.origin}${url.pathname}`;
};

export const getLogoutURL = () => {
    const rawUrl = adminify_admin_bar_data?.logout_url;
    const solidURL = rawUrl.replace(/&amp;/g, "&");
    return solidURL;
};

// Get Logo
export const getLogo = (data) => {
    const imagePath = frame_adminify_menu.image_path;

    const logo = {
        full: "",
        mini: "",
        text: "",
        width: 120,
        height: 32,
        styles: {},
    };

    if (data?.admin_ui_mode === "dark") {
        // Dark Logo
        if (data?.admin_ui_logo_type === "image_logo") {
            if (data?.admin_ui_dark_mode.admin_ui_dark_logo?.url) {
                logo.full = data?.admin_ui_dark_mode.admin_ui_dark_logo?.url;
            } else {
                logo.full = `${imagePath}logos/logo-text-dark.svg`;
            }
            if (data?.admin_ui_dark_mode.mini_admin_ui_dark_logo?.url) {
                logo.mini = data?.admin_ui_dark_mode.mini_admin_ui_dark_logo?.url;
            } else {
                logo.mini = `${imagePath}logos/mini-logo-dark.svg`;
            }
            if (data?.admin_ui_dark_mode?.dark_logo_size?.width) {
                logo.width = data?.admin_ui_dark_mode?.dark_logo_size?.width;
            }
            if (data?.admin_ui_dark_mode?.dark_logo_size?.height) {
                logo.height = data?.admin_ui_dark_mode?.dark_logo_size?.height;
            }
        } else {
            logo.text = data?.admin_ui_dark_mode?.admin_ui_dark_logo_text;
            const logo_style = data?.admin_ui_dark_mode?.admin_ui_dark_logo_text_typo;
            logo.styles = getLogoStyles(logo_style);
            if (data?.admin_ui_dark_mode.mini_admin_ui_dark_logo?.url) {
                logo.mini = data?.admin_ui_dark_mode.mini_admin_ui_dark_logo?.url;
            } else {
                logo.mini = `${imagePath}logos/mini-logo-dark.svg`;
            }
        }
    } else {
        // Light Logo
        if (data?.admin_ui_logo_type === "image_logo") {
            if (data?.admin_ui_light_mode.admin_ui_light_logo?.url) {
                logo.full = data?.admin_ui_light_mode.admin_ui_light_logo?.url;
            } else {
                logo.full = `${imagePath}logos/logo-text-light.svg`;
            }
            if (data?.admin_ui_light_mode.mini_admin_ui_light_logo?.url) {
                logo.mini = data?.admin_ui_light_mode.mini_admin_ui_light_logo?.url;
            } else {
                logo.mini = `${imagePath}logos/mini-logo-light.svg`;
            }
            if (data?.admin_ui_light_mode?.light_logo_size?.width) {
                logo.width = data?.admin_ui_light_mode?.light_logo_size?.width;
            }
            if (data?.admin_ui_light_mode?.light_logo_size?.height) {
                logo.height = data?.admin_ui_light_mode?.light_logo_size?.height;
            }
        } else {
            logo.text = data?.admin_ui_light_mode?.admin_ui_light_logo_text;
            const logo_style = data?.admin_ui_light_mode?.admin_ui_light_logo_text_typo;
            logo.styles = getLogoStyles(logo_style);
            if (data?.admin_ui_light_mode.mini_admin_ui_light_logo?.url) {
                logo.mini = data?.admin_ui_light_mode.mini_admin_ui_light_logo?.url;
            } else {
                logo.mini = `${imagePath}logos/mini-logo-light.svg`;
            }
        }
    }
    return logo;
};

/**
 * Web-safe fonts that don't need to be loaded from Google
 */
const WEB_SAFE_FONTS = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Times",
    "Courier New",
    "Courier",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Trebuchet MS",
    "Arial Black",
    "Impact",
    "Comic Sans MS",
    "system-ui",
    "sans-serif",
    "serif",
    "monospace",
];

/**
 * Convert font weight string to numeric value for Google Fonts
 * @param {string|number} weight - The font weight
 * @returns {string} - Numeric font weight
 */
function normalizeFontWeight(weight) {
    if (!weight) return "400";

    // If already a number or numeric string, return it
    if (!isNaN(weight)) return String(weight);

    // Map common weight names to numeric values
    const weightMap = {
        "thin": "100",
        "hairline": "100",
        "extra-light": "200",
        "extralight": "200",
        "ultra-light": "200",
        "light": "300",
        "normal": "400",
        "regular": "400",
        "medium": "500",
        "semi-bold": "600",
        "semibold": "600",
        "demi-bold": "600",
        "bold": "700",
        "extra-bold": "800",
        "extrabold": "800",
        "ultra-bold": "800",
        "black": "900",
        "heavy": "900",
    };

    return weightMap[String(weight).toLowerCase()] || "400";
}

/**
 * Load Google Font dynamically - uses local font URLs provided by PHP
 * PHP handles font download on page load, JS just creates link tags
 * @param {string} fontFamily - The font family name to load
 * @param {string} fontWeight - The font weight (optional)
 */
export function loadGoogleFont(fontFamily, fontWeight = "400") {
    if (!fontFamily || fontFamily === "") return;

    // Skip web-safe fonts
    if (WEB_SAFE_FONTS.some((f) => fontFamily.toLowerCase() === f.toLowerCase())) {
        return;
    }

    // Create a unique ID for this font
    const fontSlug = fontFamily.replace(/\s+/g, "-").toLowerCase();
    const fontId = `adminify-local-font-${fontSlug}`;

    // Check if font is already loaded
    if (document.getElementById(fontId)) return;

    // Get local font URL from PHP-provided config
    const localFontsConfig = window.WP_ADMINIFY_ADMIN?.local_fonts;
    if (localFontsConfig?.base_url) {
        const localFontUrl = `${localFontsConfig.base_url}/${fontSlug}/${fontSlug}.css`;

        // Create and append the link element
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = localFontUrl;
        document.head.appendChild(link);
    }
}

/**
 * Get Logo Styles
 */
export function getLogoStyles(logo_style) {
    // Load the Google Font if font-family is specified
    // The loadGoogleFont function will skip web-safe fonts automatically
    if (logo_style?.["font-family"]) {
        loadGoogleFont(logo_style["font-family"], logo_style?.["font-weight"] || "400");
    }

    return {
        fontFamily: logo_style?.["font-family"],
        fontWeight: logo_style?.["font-weight"],
        fontSize: logo_style?.["font-size"] ? logo_style?.["font-size"] + logo_style?.["unit"] : "",
        letterSpacing: logo_style?.["letter-spacing"],
        color: logo_style?.["color"],
    };
}

/**
 * Handle click
 * @param {css selector} el
 * @param {function} callback
 * @returns
 */
export function handleClick(el, callback) {
    return el.addEventListener("click", callback);
}

// Switcher icons
export const switcherIcons = {
    light: (
        <svg viewBox="0 0 24 24" width="20" height="24" className="lightIcon">
            <path
                fill="var(--adminify-menu-text-color)"
                d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"></path>
        </svg>
    ),
    dark: (
        <svg viewBox="0 0 24 24" width="20" height="24" className="darkIcon">
            <path
                fill="var(--adminify-menu-text-color)"
                d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"></path>
        </svg>
    ),
    system: (
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
    ),
};

// Set Light Dark Mode
export const changeLightDarkMode = (mode) => {
    jQuery.ajax({
        url: WPAdminify.ajax_url,
        type: "post",
        data: {
            action: "wp_adminify_color_mode",
            security: WPAdminify.security_nonce,
            key: "color_mode",
            value: mode,
        },
    });
};


/**
 * Retrieves the appropriate icon for a given menu item based on its properties.
 * - If the layout type is horizontal and the menu type is text-only, returns an empty string.
 * - Supports various icon formats: base64 data URIs, image file extensions, dashicons, and font awesome icons.
 * - Defaults to displaying the first character of the menu title if no icon is specified.
 *
 * @param {Object} menu - The menu item containing icon and title properties.
 * @param {boolean} getWidth - A flag indicating if width should be considered.
 * @returns {string} - The HTML string representing the menu icon.
 */
export function getIcon(menu, getWidth) {
    const menuLayoutSettings = frame_adminify_menu.menu_layout_settings;

    // Check if icon rendering is skipped for text-only horizontal menu type
    if (
        menuLayoutSettings?.horz_menu_type === "text_only" &&
        menuLayoutSettings?.layout_type === "horizontal" &&
        getWidth === false
    ) {
        return "";
    }

    const { icon, title } = menu || {};
    // Determine the icon type and return corresponding HTML
    if (/data:image/g.test(icon)) {
        // Handle base64 data URIs
        return `<span class="frame-adminify-menu-image" style="mask-image: url(${icon})"></span>`;
    } else if (/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(icon)) {
        // Handle image file extensions
        return `<span class="frame-adminify-menu-image">
            <img src="${icon}" alt="menu icon" />
        </span>`;
    } else if (/dashicons/g.test(icon)) {
        // Handle dashicons
        return dashboardIcons?.[icon]
            ? `<span class="frame-adminify-menu-icon">${dashboardIcons[icon]}</span>`
            : `<span class="frame-adminify-menu-icon dashicons ${icon}"></span>`;
    } else if (/fa-/g.test(menu?.icon)) {
        // Handle FontAwesome icons (fa-)
        return `<span class="frame-adminify-menu-icon fas ${menu.icon}"></span>`;
    } else if (/icon-/g.test(menu?.icon)) {
        // Handle Simple Line Icons (icon-)
        return `<span class="frame-adminify-menu-icon ${menu.icon}"></span>`;
    }

    // Default: Display the first character of the menu title
    return `<span class="frame-adminify-menu-icon-symbol">${title?.charAt(0) || ''}</span>`;
}


// get Active Menu
export const getActiveMenu = (menus, isSub, isURL) => {
    const url = isURL ? isURL : window.location.href;
    let menuId = "";
    let submenuId = "";

    for (const menuKey in menus) {
        if (Object.hasOwnProperty.call(menus, menuKey)) {
            const menu = menus[menuKey];
            if (menu?.children?.length === 0 && menu?.url === url) {
                // Active menu without Submenu
                menuId = menu?.key;
            } else {
                // Active Menu With Submenu
                for (const submenuKey in menu?.children) {
                    if (Object.hasOwnProperty.call(menu?.children, submenuKey)) {
                        const submenu = menu?.children[submenuKey];
                        const clean_url = url.substring(0, url.indexOf("#"));
                        if (submenu?.url === url || submenu?.url === clean_url) {
                            menuId = menu?.key;
                            submenuId = submenu?.key;
                        }
                    }
                }
            }
        }
    }

    if (!!isSub) {
        return submenuId;
    }
    return [menuId];
};

// Set Default URL
export const setDefaultURL = (href) => {
    const existing_href = window.location.href;

    const url = new URL(existing_href);
    if (!href.includes(url.origin) || url.pathname.length > 10) {
        window.history.pushState({}, "", existing_href);
        return existing_href;
    } else {
        window.history.pushState({}, "", href);
        return href;
    }
};

// Decode URL
export function replaceAmpInUrl(fullUrl) {
    const url = new URL(fullUrl);

    const queryString = url.search;
    const decodedQueryString = decodeURIComponent(queryString).replace(/&amp;/g, "&");

    url.search = decodedQueryString;

    return url.toString();
}

export const isSubdomain = (url) => {
    if( /(?:(http(s?))?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(url)){
        return true;
    }

    return false;
}

export const getPath = (url) => {
    if (/(http(s?)):\/\//i.test(url)) {   
        
        if(isSubdomain(url)) return url;
        
        const decodedURL = sanitizeURL(url);

        const urlObj = new URL(decodedURL);

        return `${urlObj?.pathname}${urlObj?.search}`;
    }

    return url;
};

// Recommended approach
function sanitizeURL(url) {
  // Decode HTML entities
  const textArea = document.createElement('textarea');
  textArea.innerHTML = url;
  const decoded = textArea.value;
  
  // Validate and return
  try {
    new URL(decoded);
    return decoded;
  } catch {
    // If still invalid, try to fix common issues
    return decoded.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
  }
}

/**
 *
 * @param {CSS} selector
 * @returns exits DOM
 */
export function waitForElm(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

export const checkAdminUrl = (url = "") => {
    const admin_url = adminify_admin_bar_data?.admin_url;
    return url.includes(admin_url);
};

/**
 * Normalize Menu Title
 * @param {*} title 
 * @returns string
 */
export function normalizeCopyDeletePostsMenu(title) {
    if (!title || typeof title !== 'string') return title;

    const temp = document.createElement('div');
    temp.innerHTML = title;

    // Check if there's direct text + span together (like "Plugins <span>...</span>")
    const hasDirectText = Array.from(temp.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
    );
    const hasSpan = temp.querySelector('span') !== null;

    // If both direct text and span exist, return original
    if (hasDirectText && hasSpan) {
        return title;
    }

    // If only a span with text inside, extract the text
    if (temp.children.length === 1 && temp.children[0].tagName === 'SPAN') {
        const span = temp.children[0];
        if (span.children.length === 0) {
            return span.textContent;
        }
    }

    return title;
}

export function checkJsVoid(href = "") {
    if (!href) return false;
    if( href.includes("avascript:void") ) return true;
    return false;
}

/**
 * Trigger click on original WordPress admin bar element for javascript:void links
 * This enables compatibility with plugins that use javascript:void(0) hrefs
 * @param {string} itemId - The menu item ID (e.g., 'wpdn-add-note')
 * @returns {boolean} - Returns true if click was triggered successfully
 */
export function triggerJsVoidClick(itemId) {
    if (!itemId) return false;

    const iframe = document.getElementById("frame-adminify-app--iframe");
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;

    // Try to find and click the element inside the iframe first
    if (iframeDoc) {
        const iframeElement = iframeDoc.querySelector(`#wp-admin-bar-${itemId} a`);

        if (iframeElement) {
            // Click the element inside iframe
            iframeElement.click();

            // Handle AJAX-based actions: wait for completion, refresh iframe, scroll to new content
            handleJsVoidAjaxAction(iframe, itemId);
            return true;
        }
    }

    // Fallback: Find the original WordPress admin bar element in parent
    const originalElement = document.querySelector(`#wp-admin-bar-${itemId} a`);

    if (originalElement) {
        originalElement.click();
        return true;
    }

    return false;
}

/**
 * Handle javascript:void AJAX actions generically
 * Waits for AJAX to complete, refreshes iframe, and scrolls to new content
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @param {string} itemId - The menu item ID for context
 */
function handleJsVoidAjaxAction(iframe, itemId) {
    const iframeWindow = iframe?.contentWindow;

    if (!iframeWindow || !iframeWindow.jQuery) return;

    // Use jQuery's ajaxStop to detect when all AJAX requests complete
    iframeWindow.jQuery(document).one('ajaxStop', function() {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            // Store scroll target info before refresh
            const scrollTarget = getScrollTargetSelector(itemId, iframeWindow.document);

            // Refresh the iframe
            iframe.contentWindow.location.reload();

            // After iframe loads, scroll to the new content
            iframe.onload = function() {
                setTimeout(() => {
                    scrollToNewContent(iframe, scrollTarget);
                }, 300);
            };
        }, 100);
    });
}

/**
 * Get selector for scroll target based on plugin/action type
 * @param {string} itemId - The menu item ID
 * @param {Document} doc - The document to search in
 * @returns {object} - Scroll target info
 */
function getScrollTargetSelector(itemId, doc) {
    // Map of known plugins and their new content selectors
    const pluginSelectors = {
        'wpdn-add-note': {
            container: '#postbox-container-1 #normal-sortables',
            itemPrefix: 'note_',
            findLatest: true
        },
        // add more plugin support...
    };

    const config = pluginSelectors[itemId];

    if (config && config.findLatest) {
        // Find the latest item ID before refresh
        const container = doc.querySelector(config.container);
        if (container) {
            const items = container.querySelectorAll(`[id^="${config.itemPrefix}"]`);
            if (items.length > 0) {
                // Get the highest ID (newest item)
                let maxId = 0;
                items.forEach(item => {
                    const id = parseInt(item.id.replace(config.itemPrefix, ''), 10);
                    if (id > maxId) maxId = id;
                });
                return { selector: `#${config.itemPrefix}${maxId}`, isNew: true, prefix: config.itemPrefix };
            }
        }
    }

    return { selector: null, itemId };
}

/**
 * Scroll to newly added content in iframe after refresh
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @param {object} scrollTarget - The scroll target info
 */
function scrollToNewContent(iframe, scrollTarget) {
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!iframeDoc) return;

    if (scrollTarget.isNew && scrollTarget.prefix) {
        // Find the newest item (highest ID) after refresh
        const items = iframeDoc.querySelectorAll(`[id^="${scrollTarget.prefix}"]`);
        let newestElement = null;
        let maxId = 0;

        items.forEach(item => {
            const id = parseInt(item.id.replace(scrollTarget.prefix, ''), 10);
            if (id > maxId) {
                maxId = id;
                newestElement = item;
            }
        });

        if (newestElement) {
            newestElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            newestElement.style.transition = 'box-shadow 0.3s ease';
            newestElement.style.boxShadow = '0 0 10px 3px rgba(0, 123, 255, 0.5)';
            setTimeout(() => {
                newestElement.style.boxShadow = '';
            }, 2000);
            return;
        }
    }

    // Fallback: scroll to specific selector if provided
    if (scrollTarget.selector) {
        const element = iframeDoc.querySelector(scrollTarget.selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

/**
 * Check if a string is an image URL
 * @param {string} str - The string to check
 * @returns {boolean} - True if string is an image URL
 */
export function isImageUrl(str) {
    if (!str || typeof str !== 'string') return false;

    // Check for base64 data URI
    if (/^data:image\//i.test(str)) return true;

    // Check for image file extensions
    if (/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)(\?.*)?$/i.test(str)) return true;

    // Check for URL patterns that look like images
    if (/^(https?:)?\/\/.+\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)(\?.*)?$/i.test(str)) return true;

    return false;
}

/**
 * Generate icon HTML based on icon type
 * @param {string} icon - Icon class name or image URL
 * @returns {string} - HTML string for the icon
 */
function generateIconHTML(icon) {
    if (!icon) return '';

    // Check if icon is an image URL
    if (isImageUrl(icon)) {
        return `<img width="20" height="20" src="${icon}" alt="menu icon" style="width: 20px; height: 20px; object-fit: contain;" />`;
    }

    // Otherwise treat as icon class
    return `<span class="${icon}"></span>`;
}

/**
 * Generate TopBar Menu DOM HTML
 * @param {Object} options - Menu options
 * @param {string|null} options.icon - Icon class name or image URL
 * @param {string} options.title - Menu title (can contain HTML)
 * @returns {string} - Generated HTML string
 */
export function generateTopBarMenuDOM({ icon = null, title = "" }) {
    const safeTitle = title || "";
    const trimmedTitle = safeTitle.trim();

    // Generate icon HTML from icon property
    const iconHTML = generateIconHTML(icon);
    const hasIconProperty = iconHTML !== '';

    // Check if title is a complete block-level element (div) from plugins like Yoast
    // These should be rendered as-is to preserve plugin CSS styling
    const isCompleteBlockElement = /^<div\b[^>]*>[\s\S]*<\/div>$/i.test(trimmedTitle);

    // Check if title contains inline HTML elements (span, img, etc.) mixed with text
    const hasInlineHTMLInTitle = /<(span|img|svg|i|a)\b/i.test(safeTitle);

    // Generate title HTML
    let titleHTML;
    if (isCompleteBlockElement) {
        // Plugin HTML like Yoast - render as-is to preserve their CSS classes
        titleHTML = trimmedTitle;
    } else if (hasInlineHTMLInTitle) {
        // Mixed content like "<span class='ab-icon'></span><span>Text</span>"
        let cleanedTitle = safeTitle.replaceAll('&nbsp;', '');

        // If icon property exists, remove ab-icon and img tags from title to avoid duplicates
        if (hasIconProperty) {
            // Remove ab-icon spans
            cleanedTitle = cleanedTitle.replace(/<span[^>]*class=["'][^"']*ab-icon[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '');
            // Remove img tags
            cleanedTitle = cleanedTitle.replace(/<img[^>]*>/gi, '');
        }

        titleHTML = `<div class="adminify-top-menu-item-has-icon" style="display: inline-flex; align-items: center; flex-wrap: wrap; gap: 8px;">${cleanedTitle}</div>`;
    } else {
        titleHTML = `<span>${safeTitle}</span>`;
    }

    return `${iconHTML}${titleHTML}`;
}


// Check if URL has different origin than current page
export const isExternalUrl = (url) => {
    if (!url) return false;
    try {
        const linkUrl = new URL(url, window.location.origin);
        return linkUrl.origin !== window.location.origin;
    } catch (e) {
        return false;
    }
};