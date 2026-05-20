import { Fragment, useEffect, useState, useContext }  from "@wordpress/element";
import { MultiStepContext, StepBtn } from "../components/MultiStep/MultiStep";
import { saveSettings } from "../utils/saveSettings";

function InstallAddons() {
    const [addons, setAddons] = useState({});
    const [selected, setSelected] = useState([]);
    const [pending, setPending]= useState(false)

    const { activeStep, setActiveStep } = useContext(MultiStepContext);
    const rest_nonce = adminify_setup_wizard_data.rest_nonce;
    const rest_base = adminify_setup_wizard_data.rest_url || "/wp-json/adminify/v1/";

    useEffect(() => {
        fetch(rest_base + 'get-addons-list', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'X-WP-Nonce': rest_nonce
            }
        })
        .then(res => res.json())
        .then((data) => {
            if (!data || typeof data !== 'object' || data.code) {
                console.error('Adminify addons endpoint returned an error', data);
                setAddons({});
                return;
            }
            setAddons(data);
        })
        .catch((err) => console.error("Failed to fetch addons", err));
    }, []);
    

    // Toggle selection
    const handleCheckboxChange = (slug) => {
        setSelected((prev) =>
            prev.includes(slug)
                ? prev.filter((s) => s !== slug)
                : [...prev, slug]
        );
    };

    const handleInstall = () => {
        if (selected.length === 0) {
            alert("Please select at least one addon to install.");
            return setPending(false); 
        }


        fetch(rest_base + "install-addons", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": rest_nonce, 
            },
            body: JSON.stringify({ addons: selected }),
        })
        .then((res) => res.json())
        .then((response) => {
            setPending(false)
            setActiveStep(activeStep <= 5 && 5);
        })
    };

    return (
        <Fragment>
            <h1 className="text-xl font-bold mb-4">Install Addons Plugins</h1>
            <div className="choose-addons">
                <ul className="plugins-list">
                    {Object.entries(addons).map(([slug, addon], index) => (
                        <li key={slug} className={`plugin plugin-item ${slug} ${addon.status}`}>
                            <label htmlFor={slug}>
                                <input
                                    type="checkbox"
                                    id={slug}
                                    value={slug}
                                    className="plugin-checkbox"
                                    checked={selected.includes(slug) || addon.status === 'activated'}
                                    onChange={() => handleCheckboxChange(slug)}
                                />
                                <div className="logo">
                                    <img src={addon.icon} alt={addon.name} />
                                </div>
                                <div className="details">
                                    <h4 className="name">{addon.name}</h4>
                                </div>
                            </label>
                        </li>
                    ))}
                </ul>

               {pending ? <div className="loading-wrapper"> <div className="wp-adminify-loading"></div></div> : null} 

                
            </div>

            <div className="wp-adminify-multi-step-action mt-6 flex justify-between gap-4">
                <StepBtn value={3} className="wp-adminify-bg-secondary">
                    Back
                </StepBtn>
                <StepBtn value={5} className="wp-adminify-bg-secondary">
                    Skip This Step
                </StepBtn>

                <StepBtn
                    value={5}
                    type="async"
                    className="wp-adminify-bg-primary"
                    onClick={() => {
                        setPending(true)
                        handleInstall()
                    }}
                >
                    Install and continue
                </StepBtn>
            </div>
        </Fragment>
    );
}

export default InstallAddons;
