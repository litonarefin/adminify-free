import { Fragment, createContext, useContext, useState } from "@wordpress/element";

export const MultiStepContext = createContext();

function MultiStep({ activeStepKey, logo, children }) {
    const [activeStep, setActiveStep] = useState(activeStepKey);

    return (
        <div className="wp-adminify-multi-step-wrapper">
            <div className="wp-adminify-multi-step-logo">
                <img src={adminify_setup_wizard_data.images + "logos/" + `${logo}`} alt="logo" />
            </div>
            <ul className="wp-adminify-multi-step">
                {children.map((item) => {
                    return (
                        <Fragment key={item?.props?.stepKey}>
                            {item.props.title ? (
                                <li
                                    className={`wp-adminify-step ${
                                        activeStep >= item?.props?.stepKey ? "active" : ""
                                    }`}>
                                    {item?.props?.title}
                                </li>
                            ) : null}
                        </Fragment>
                    );
                })}
            </ul>
            <MultiStepContext.Provider value={{ activeStep, setActiveStep }}>
                {children}
            </MultiStepContext.Provider>
        </div>
    );
}

function Step({ stepKey, children }) {
    const { activeStep } = useContext(MultiStepContext);
    return <Fragment>{stepKey === activeStep ? children : null}</Fragment>;
}

function StepBtn({ className = "", value, children, onClick = () => {},  type='sync' }) {
    const { activeStep, setActiveStep } = useContext(MultiStepContext);

    return (
        <button
            type="button"
            className={className}
            onClick={() => {
                onClick();
                if(type !== 'async'){
                    setActiveStep(activeStep <= 5 && value);
                    
                }
            }}>
            {children}
        </button>
    );
}

export { MultiStep, Step, StepBtn };
