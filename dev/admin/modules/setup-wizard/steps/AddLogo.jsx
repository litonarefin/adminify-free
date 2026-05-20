import { Fragment, useState } from "@wordpress/element";
import { Tab, Tabs } from "../components/Tabs/Tabs";
import Uploader from "../components/Uploader/Uploader";
import { StepBtn } from "../components/MultiStep/MultiStep";
import { saveSettings } from "../utils/saveSettings";

function AddLogo({ isAdminifyUi }) {
    const images = adminify_setup_wizard_data.images;
    const data = adminify_setup_wizard_data?.settings;
    const [logoType, setLogoType] = useState(data?.admin_ui_logo_type || "image_logo");
    const [logo, setLogo] = useState(data?.admin_ui_light_mode?.admin_ui_light_logo?.url || "");
    const [text, setText] = useState(data?.admin_ui_light_mode?.admin_ui_light_logo_text || "");
    const [footerText, setFooterText] = useState(data?.footer_text || "");
    const [image, setImage] = useState({ imageData: "", imageName: "" });

    // Media Upload handle
    const handleMediaUpload = () => {
        const mediaUploader = wp.media({
            title: "Upload Image",
            button: {
                text: "Select",
            },
            multiple: false,
        });

        mediaUploader.on("select", () => {
            const img = mediaUploader.state().get("selection").first().toJSON();
            setLogo(img.url);
        });

        mediaUploader.open();
    };

    // Save Settings
    const saveSettingsWithAdminifyUi = async () => {
        saveSettings({
            admin_ui_logo_type: logoType,
            admin_ui_light_mode: {
                admin_ui_light_logo: {
                    url: logo,
                },
                admin_ui_light_logo_text: text,
            },
        });

        if (!!image.imageData) {
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                // async: false,
                url: adminify_setup_wizard_data.ajax_url,
                data: {
                    action: "adminify_drag_and_drop_image",
                    _wpnonce: adminify_setup_wizard_data.wpnonce,
                    settings: { image_data: image.imageData, image_name: image.imageName },
                },
                // cache: false,
                success: function (response) {
                    // console.log("sadf");
                },
            });
        }
    };

    const dragAndDropFileUpload = () => {};

    return (
        <Fragment>
            {isAdminifyUi ? (
                <>
                    <h2>Add Your Website Logo</h2>
                    <div className="add-logo">
                        <div>
                            <img
                                src={`${images}setup-wizard/branding-placeholder.png`}
                                alt="logo-banner"
                            />
                        </div>
                        <div className="wp-adminify-add-logo-tab">
                            <Tabs tabActiveKey={logoType === "image_logo" ? 1 : 2}>
                                <Tab
                                    tabKey={1}
                                    title="Logo Image"
                                    onTabClick={() => setLogoType("image_logo")}>
                                    <Uploader
                                        logo={logo}
                                        setLogo={setLogo}
                                        setImage={setImage}
                                        handleMediaUpload={handleMediaUpload}
                                        dragAndDropFileUpload={dragAndDropFileUpload}
                                    />
                                </Tab>
                                <Tab
                                    tabKey={2}
                                    title="Logo Text"
                                    onTabClick={() => setLogoType("text_logo")}>
                                    <input
                                        type="text"
                                        defaultValue={text}
                                        onBlur={(e) => setText(e.target.value)}
                                    />
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h2>Admin Footer Text</h2>
                    <textarea
                        defaultValue={footerText}
                        onBlur={(e) => setFooterText(e.target.value)}
                    />
                </>
            )}

            <div className="wp-adminify-multi-step-action">
                <StepBtn value={2} className="wp-adminify-bg-secondary">
                    Back
                </StepBtn>
                <StepBtn value={4} className="wp-adminify-bg-secondary">
                    Skip This Step
                </StepBtn>
                <StepBtn
                    value={4}
                    className="wp-adminify-bg-primary"
                    onClick={() => {
                        isAdminifyUi
                            ? saveSettingsWithAdminifyUi()
                            : saveSettings({ footer_text: footerText });
                    }}>
                    Continue
                </StepBtn>
            </div>
        </Fragment>
    );
}

export default AddLogo;
