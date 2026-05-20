import { useState } from "@wordpress/element";
import Media from "../components/Media/Media";
import { saveSettings } from "../utils/saveSettings";

function DoMore() {
    const [tweetText, setTweetText] = useState(
        "Just installed WP Adminify! Time to create a unique personalized dashboard!"
    );
    const [busy, setBusy] = useState(false);

    const settingsUrl =
        adminify_setup_wizard_data?.settings_url ||
        "/wp-admin/admin.php?page=wp-adminify-settings";
    const dashboardUrl = adminify_setup_wizard_data?.admin_url || "/wp-admin/";

    const completeAndGo = async (target) => {
        if (busy) return;
        setBusy(true);
        try {
            await saveSettings({}, { is_complete: true });
        } catch (e) {
        }
        window.location.href = target;
    };

    return (
        <>
            <div className="adminify-ui-content adminify-ui-media">
                <h1>Watch This 15s Video</h1>
                <p>Learn what you can do with Adminify and do more!</p>

                <div className="adminify-share-tweet">
                    <textarea onChange={(e) => setTweetText(e.target.value)} value={tweetText} />
                    <a
                        target="_blank"
                        href={`http://twitter.com/share?text=${tweetText}&hashtags=wordpress,wpadminify,dashboardcustomization&url=https://wpadminify.com`}>
                        <span className="dashicons dashicons-twitter" style={{ width: "50px" }} />
                    </a>
                </div>

                <div className="adminify-ui-media">
                    <Media />
                </div>
                <div className="wp-adminify-multi-step-action">
                    <a className="right-arrow">
                        Customize more
                        <span className="dashicons dashicons-arrow-right-alt"></span>
                    </a>
                    <a
                        href={settingsUrl}
                        onClick={(e) => {
                            e.preventDefault();
                            completeAndGo(settingsUrl);
                        }}
                        className="wp-adminify-bg-primary"
                        aria-disabled={busy}>
                        {busy ? "Saving..." : "Adminify Options"}
                    </a>
                </div>
            </div>
            <a
                className="wp-adminify-return-dashboard"
                href={dashboardUrl}
                onClick={(e) => {
                    e.preventDefault();
                    completeAndGo(dashboardUrl);
                }}>
                Return to the WordPress Dashboard
            </a>
        </>
    );
}

export default DoMore;
