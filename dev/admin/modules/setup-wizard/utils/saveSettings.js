export const saveSettings = (settings, { is_complete = false } = {}) => {
    return new Promise((resolve, reject) => {
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: adminify_setup_wizard_data.ajax_url,
            data: {
                action: "wpadminify_save_wizard_data",
                _wpnonce: adminify_setup_wizard_data.wpnonce,
                settings: settings,
                is_complete: is_complete ? "1" : "0",
            },
            success: resolve,
            error: reject,
        });
    });
};
