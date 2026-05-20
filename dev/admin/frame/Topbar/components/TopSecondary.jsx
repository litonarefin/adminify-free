import LightDarkSwitcher from "./LightDarkSwitcher";
import UserAccount from "./UserAccount";
import Search from "./Search";
import Comments from "./Comments";
import MenuItems from "./MenuItems";

// Check top secondary values
function getTopSecondaryItems(topSecondarySubmenu) {
    return [
        ...(typeof topSecondarySubmenu === "object"
            ? Object.values(topSecondarySubmenu)
            : topSecondarySubmenu),
    ]
        ?.filter((item) => item.id !== "my-account")
        ?.filter((item) => item.id !== "wp-adminify-admin-bar-switcher")
        ?.filter((item) => item.id !== "adminify_notification_count");
}

function TopSecondary({ setShowSearch, getWidth, iframeFullReady, setAdminifyColorMode, setUrl }) {
    const topSecondarySubmenu = adminify_admin_bar_data?.data?.find(
        (menu) => menu?.id === "top-secondary"
    )?.submenu;

    return (
        <div className="adminify-admin-bar-top-secondary">
            {getWidth ? null : (
                <>
                    {getTopSecondaryItems(topSecondarySubmenu)?.length ? (
                        <ul className="adminify-top-menu">
                            {getTopSecondaryItems(topSecondarySubmenu)?.map((item, i) => {
                                const depthLevel = 0;
                                if(item.menu_status === false ) {return null;}
                                return (
                                    <MenuItems
                                        setUrl={setUrl}
                                        items={item}
                                        key={item.key || i}
                                        depthLevel={depthLevel}
                                    />
                                );
                            })}
                        </ul>
                    ) : null}
                </>
            )}

            {!!adminify_admin_bar_data.search && adminify_admin_bar_data.search !== "0" ? (
                <Search setShowSearch={setShowSearch} />
            ) : null}

            {!!adminify_admin_bar_data.notification &&
            adminify_admin_bar_data.notification !== "0" ? (
                <Comments iframeFullReady={iframeFullReady} />
            ) : null}

            {!!adminify_admin_bar_data.light_dark_switcher &&
            adminify_admin_bar_data.light_dark_switcher !== "0" ? (
                <LightDarkSwitcher setAdminifyColorMode={setAdminifyColorMode} />
            ) : null}

            <div className="wp-adminify--preview">
                <a
                    className="wp-adminify-preview-trigger"
                    href={adminify_admin_bar_data?.site_url}
                    target="_blank">
                    <i className="dashicons dashicons-visibility"></i>
                </a>
            </div>

            <UserAccount />
        </div>
    );
}

export default TopSecondary;
