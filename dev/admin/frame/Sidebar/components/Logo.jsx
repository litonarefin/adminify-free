import { useState, useEffect, Fragment } from "react";
import { getLogo, getLogoStyles, handleClick } from "../../utils/uitls";

function Logo({ lightDarkMode, folded, adminifyColorMode }) {
    const imagePath = frame_adminify_menu.image_path;
    const [logo, setLogo] = useState(getLogo(lightDarkMode));

    useEffect(() => {
        if (
            !!adminify_admin_bar_data.light_dark_switcher &&
            adminify_admin_bar_data.light_dark_switcher !== "0"
        ) {
            const lightBtn = document.querySelector(
                "#adminify-color-mode-wrapper .light-dark-dropdown .light"
            );
            const darkBtn = document.querySelector(
                "#adminify-color-mode-wrapper .light-dark-dropdown .dark"
            );
            const systemBtn = document.querySelector(
                "#adminify-color-mode-wrapper .light-dark-getWidthdropdown .system"
            );

            if (!lightBtn || !darkBtn || !systemBtn) return;

            const getLightLogo = () => {
                const logo_style =
                    lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo_text_typo;
                setLogo({
                    full: lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo?.url
                        ? lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo?.url
                        : `${imagePath}logos/logo-text-light.svg`,
                    mini: lightDarkMode?.admin_ui_light_mode?.mini_admin_ui_light_logo?.url
                        ? lightDarkMode?.admin_ui_light_mode?.mini_admin_ui_light_logo?.url
                        : `${imagePath}logos/mini-logo-light.svg`,
                    width: lightDarkMode?.admin_ui_light_mode?.light_logo_size?.width || 120,
                    height: lightDarkMode?.admin_ui_light_mode?.light_logo_size?.height || 32,
                    text: lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo_text,
                    styles: getLogoStyles(logo_style),
                });
            };

            const getDarkLogo = () => {
                const logo_style = lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo_text_typo;
                setLogo({
                    full: lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo?.url
                        ? lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo?.url
                        : `${imagePath}logos/logo-text-dark.svg`,
                    mini: lightDarkMode?.admin_ui_dark_mode?.mini_admin_ui_dark_logo?.url
                        ? lightDarkMode?.admin_ui_dark_mode?.mini_admin_ui_dark_logo?.url
                        : `${imagePath}logos/mini-logo-dark.svg`,
                    width: lightDarkMode?.admin_ui_dark_mode?.dark_logo_size?.width || 120,
                    height: lightDarkMode?.admin_ui_dark_mode?.dark_logo_size?.height || 32,
                    text: lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo_text,
                    styles: getLogoStyles(logo_style),
                });
            };

            handleClick(lightBtn, getLightLogo);

            handleClick(darkBtn, getDarkLogo);

            handleClick(systemBtn, () => {
                const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (!!isDark) {
                    getDarkLogo();
                } else {
                    getLightLogo();
                }
            });
        }
    }, []);

    useEffect(() => {
        if(adminifyColorMode?.admin_ui_mode === 'dark'){
            const logo_style = lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo_text_typo;
            setLogo({
                full: lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo?.url
                    ? lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo?.url
                    : `${imagePath}logos/logo-text-dark.svg`,
                mini: lightDarkMode?.admin_ui_dark_mode?.mini_admin_ui_dark_logo?.url
                    ? lightDarkMode?.admin_ui_dark_mode?.mini_admin_ui_dark_logo?.url
                    : `${imagePath}logos/mini-logo-dark.svg`,
                width: lightDarkMode?.admin_ui_dark_mode?.dark_logo_size?.width || 120,
                height: lightDarkMode?.admin_ui_dark_mode?.dark_logo_size?.height || 32,
                text: lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo_text,
                styles: getLogoStyles(logo_style),
            });
        } else if(adminifyColorMode?.admin_ui_mode === 'light'){
            const logo_style = lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo_text_typo;
            setLogo({
                full: lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo?.url
                    ? lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo?.url
                    : `${imagePath}logos/logo-text-light.svg`,
                mini: lightDarkMode?.admin_ui_light_mode?.mini_admin_ui_light_logo?.url
                    ? lightDarkMode?.admin_ui_light_mode?.mini_admin_ui_light_logo?.url
                    : `${imagePath}logos/mini-logo-light.svg`,
                width: lightDarkMode?.admin_ui_light_mode?.light_logo_size?.width || 120,
                height: lightDarkMode?.admin_ui_light_mode?.light_logo_size?.height || 32,
                text: lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo_text,
                styles: getLogoStyles(logo_style),
            });
        } else if(adminifyColorMode?.admin_ui_mode === 'system'){
            // Handle system mode - check if system prefers dark mode
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (isDark) {
                const logo_style = lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo_text_typo;
                setLogo({
                    full: lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo?.url
                        ? lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo?.url
                        : `${imagePath}logos/logo-text-dark.svg`,
                    mini: lightDarkMode?.admin_ui_dark_mode?.mini_admin_ui_dark_logo?.url
                        ? lightDarkMode?.admin_ui_dark_mode?.mini_admin_ui_dark_logo?.url
                        : `${imagePath}logos/mini-logo-dark.svg`,
                    width: lightDarkMode?.admin_ui_dark_mode?.dark_logo_size?.width || 120,
                    height: lightDarkMode?.admin_ui_dark_mode?.dark_logo_size?.height || 32,
                    text: lightDarkMode?.admin_ui_dark_mode?.admin_ui_dark_logo_text,
                    styles: getLogoStyles(logo_style),
                });
            } else {
                const logo_style = lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo_text_typo;
                setLogo({
                    full: lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo?.url
                        ? lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo?.url
                        : `${imagePath}logos/logo-text-light.svg`,
                    mini: lightDarkMode?.admin_ui_light_mode?.mini_admin_ui_light_logo?.url
                        ? lightDarkMode?.admin_ui_light_mode?.mini_admin_ui_light_logo?.url
                        : `${imagePath}logos/mini-logo-light.svg`,
                    width: lightDarkMode?.admin_ui_light_mode?.light_logo_size?.width || 120,
                    height: lightDarkMode?.admin_ui_light_mode?.light_logo_size?.height || 32,
                    text: lightDarkMode?.admin_ui_light_mode?.admin_ui_light_logo_text,
                    styles: getLogoStyles(logo_style),
                });
            }
        }
    }, [adminifyColorMode, lightDarkMode, imagePath])

    return (
        <div className="frame-adminify-logo">
            <a
                href={
                    !!adminify_admin_bar_data?.admin_url ? adminify_admin_bar_data?.admin_url : "#"
                }>
                {lightDarkMode?.admin_ui_logo_type === "image_logo" ? (
                    <Fragment>
                        <img
                            className="adminify-mini-logo"
                            src={logo?.mini}
                            alt="Mini Logo"
                            width={32}
                            height={32}
                        />
                        <img
                            className="adminify-logo"
                            src={logo?.full}
                            alt="Logo"
                            width={logo?.width}
                            height={logo?.height}
                        />
                    </Fragment>
                ) : (
                    <Fragment>
                        <img
                            className="adminify-mini-logo"
                            src={logo?.mini}
                            alt="Mini Logo"
                            width={32}
                            height={32}
                        />
                        {!folded ? (
                            <span className="adminify-logo-text" style={logo?.styles}>
                                {logo?.text}
                            </span>
                        ) : null}
                    </Fragment>
                )}
            </a>
        </div>
    );
}

export default Logo;
