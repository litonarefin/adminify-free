import Axios from "axios";

const Api = Axios.create({
    baseURL: adminify_setup_wizard_data.rest_base,
    headers: {
        Accept: "application/json",
        // "X-WP-Nonce": adminify_setup_wizard_data.wpnonce,
    },
});

export default Api;
