import { Fragment } from "@wordpress/element";
import { StepBtn } from "../components/MultiStep/MultiStep";
import { saveSettings } from "../utils/saveSettings";

function ChooseUI({ isAdminifyUi, setIsAdminifyUi }) {
    const images = adminify_setup_wizard_data.images;

    return (
        <Fragment>
            <h1>Choose Your UI (User Interface)</h1>
            <div className="choose-ui">
                <div>
                    <div
                        className={`choose-ui-image${isAdminifyUi ? "" : " active-ui"}`}
                        onClick={() => setIsAdminifyUi(false)}>
                        <img src={`${images}setup-wizard/default-ui.png`} alt="default-ui" />
                        <span
                            style={{
                                backgroundImage: `url(${images}setup-wizard/icons/check.svg)`,
                            }}
                        />
                    </div>
                    <h2>Default UI</h2>
                </div>
                <div>
                    <div
                        className={`choose-ui-image${isAdminifyUi ? " active-ui" : ""}`}
                        onClick={() => setIsAdminifyUi(true)}>
                        <img src={`${images}setup-wizard/adminify-ui.png`} alt="adminify-ui" />
                        <span
                            style={{
                                backgroundImage: `url(${images}setup-wizard/icons/check.svg)`,
                            }}
                        />
                    </div>
                    <h2>Adminify UI</h2>
                </div>
            </div>

            <div className="wp-adminify-multi-step-action">
                <StepBtn value={1} className="wp-adminify-bg-secondary">
                    Back
                </StepBtn>
                <StepBtn value={3} className="wp-adminify-bg-secondary">
                    Skip This Step
                </StepBtn>
                <StepBtn
                    value={3}
                    className="wp-adminify-bg-primary"
                    onClick={() => {
                        saveSettings({ admin_ui: isAdminifyUi });
                    }}>
                    Continue
                </StepBtn>
            </div>
        </Fragment>
    );
}

export default ChooseUI;
