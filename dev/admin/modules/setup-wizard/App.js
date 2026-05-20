import { MultiStep, Step, StepBtn } from "./components/MultiStep/MultiStep";
import ChooseUI from "./steps/ChooseUI";
import AddLogo from "./steps/AddLogo";
import InstallAddons from "./steps/InstallAddonsI";
import { useState } from "@wordpress/element";
import DoMore from "./steps/DoMore";

function App() {
    const [isAdminifyUi, setIsAdminifyUi] = useState(
        adminify_setup_wizard_data?.settings?.admin_ui
    );

    return (
        <div className="wp-adminify-setup-wizard-wrapper">
            <MultiStep activeStepKey={1} logo="logo-text-light.png">
                <Step stepKey={1}>
                    <div className="adminify-ui-content">
                        <h1>Welcome to the future of configuring WordPress!</h1>
                        <p>
                            Thank you for choosing WP Adminify. An easier way to set up and manage
                            your WordPress website! This quick setup wizard will help you configure
                            the basic settings for your site. It’s completely optional and shouldn’t
                            take longer than five minutes.
                            <br />
                            <br />
                            Need help with configuring WP Adminify? Check this tutorial on: Youtube
                            <br />
                            <br />
                            No time right now? If you don’t want to go through the wizard, you can
                            skip and return to the plugin's dashboard. Come back anytime if you
                            change your mind!
                        </p>
                        <div className="wp-adminify-multi-step-action">
                            <a
                                href={adminify_setup_wizard_data?.settings_url || "/wp-admin/admin.php?page=wp-adminify-settings"}
                                className="wp-adminify-bg-secondary">
                                Not Right Now
                            </a>
                            <StepBtn value={2} className="wp-adminify-bg-primary">
                                Let’s Go!
                            </StepBtn>
                        </div>
                    </div>
                </Step>
                <Step stepKey={2} title="Choose UI">
                    <div className="adminify-ui-content adminify-choose-ui">
                        <ChooseUI isAdminifyUi={isAdminifyUi} setIsAdminifyUi={setIsAdminifyUi} />
                    </div>
                </Step>
                <Step stepKey={3} title={isAdminifyUi ? "Add Logo" : "White Label WordPress"}>
                    <div className="adminify-ui-content adminify-add-logo-ui">
                        <AddLogo isAdminifyUi={isAdminifyUi} />
                    </div>
                </Step>
                <Step stepKey={4} title={ "Install Addons Plugins"}>
                    <div className="adminify-ui-content adminify-install-addons-plugins">
                        <InstallAddons />
                    </div>
                </Step>
                <Step stepKey={5} title="Do More!">
                    <DoMore />
                </Step>
            </MultiStep>
        </div>
    );
}

export default App;
