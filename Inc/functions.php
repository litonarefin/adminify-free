<?php

// no direct access allowed
if (!defined('ABSPATH')) {
    exit;
}


// WP Adminify function for get an option
function pxlbsadminify_get_option($option = '', $default = null) {
    $options = [];
    // if (is_multisite() && is_site_wide('wp-adminify/wp-adminify.php')) {
    $options = (array) \PXLBSAdminify\Inc\Admin\AdminSettings::get_instance()->get();
    // }
    return (isset($options[$option])) ? $options[$option] : $default;
}


/**
 * User Roles Slug from Names
 *
 * @param [type] $user_roles
 *
 * @return void
 */
function pxlbsadminify_menu_roles($user_roles = [])
{
    $disabled_for_roles = [];
    if (!empty( $user_roles)) {
        foreach ($user_roles as $usr_key) {
            $disabled_for_roles[] = strtolower(str_replace(' ', '_', $usr_key));
        }
    }
    return $disabled_for_roles;
}


/**
 * Build admin menu array.
 *
 * @param array $menu Menu array.
 * @param array $submenu Submenu array.
 * @param array $menu_options Menu options array.
 *
 * @return array Admin menu array.
 */
function pxlbsadminify_build_menu($menu, $submenu, $menu_options) {
    $admin_menu = [];
    $menu_options = apply_filters('pxlbsadminify_menu_option_compatibility_filter', $menu_options, $menu);

    foreach ($menu as $key => $item) { 
        if (is_array($menu_options)) {
            if (isset($menu_options[$item[2]])) {
                $optiongroup = $menu_options[$item[2]];
                if (!empty($optiongroup['hidden_for'])) {
                    $disabled_for = pxlbsadminify_menu_roles($optiongroup['hidden_for']);
                    if (\PXLBSAdminify\Inc\Utils::restrict_for($disabled_for)) {
                        continue;
                    }
                }
            }
        }

        $menu_slug  = $item[2];
        $menu_title = $item[0];
        $menu_name  = isset($item[5]) ? $item[5] : '';
        // Use unique key for custom menu items instead of link URL
        $menu_key_id = (!empty($menu_name) && strpos($menu_name, 'adminify-custom-menu-') !== false) ? $menu_name : $menu_slug;
        $menu_icon  = isset($item[6]) ? $item[6] : '';
        $external_link = (isset($item['external_link']) && $item['external_link'] == 1 ) ? true: false;

        $menu_hook = get_plugin_page_hook($menu_slug, 'admin.php');
        $menu_file = $menu_slug;
        $pos = strpos($menu_file, '?');

        if (false !== $pos) {
            $menu_file = substr($menu_file, 0, $pos);
        }

        $url = '';

        $arrParsedUrl = wp_parse_url($menu_slug);
        if (!empty($arrParsedUrl['scheme'])) {
            if ($arrParsedUrl['scheme'] === "http" || $arrParsedUrl['scheme'] === "https") {
                $url = $menu_slug;
            }
        } else {
            $url = ( ! empty($menu_hook) || ( ( 'index.php' !== $menu_slug ) && file_exists(WP_PLUGIN_DIR . "/$menu_file") && ! file_exists(ABSPATH . "/wp-admin/$menu_file") ) )
                ? \PXLBSAdminify\Inc\Utils::maybe_network_admin_url('admin.php?page=' . $menu_slug)
                : \PXLBSAdminify\Inc\Utils::maybe_network_admin_url($menu_slug);
        }

        $admin_menu[$menu_key_id] = [
            'key'      => $menu_key_id,
            'title'    => $menu_title,
            'url'      => $url,
            'name'     => $menu_name,
            'icon'     => $menu_icon,
            'children' => [],
            'separator' => !empty( $item['separator'] ) ? $item['separator'] : '',
            'external_link' => $external_link ,
        ];

        if (!empty($submenu[$menu_slug])) {
            foreach ($submenu[$menu_slug] as $sub_key => $sub_item) {
                $sub_slug  = $sub_item[2];
                // Use unique key for custom submenu items instead of link URL
                $sub_key_id = isset($sub_item['key']) ? $sub_item['key'] : $sub_slug;
                $external_link = false;
                // Look up external_link setting using unique key first, then fall back to slug
                if( isset($optiongroup['submenu'][$sub_key_id])){
                    $external_link = ($optiongroup['submenu'][$sub_key_id]['external_link'] == 1) ? true : false;
                } elseif( isset($optiongroup['submenu'][$sub_slug])){
                    $external_link = ($optiongroup['submenu'][$sub_slug]['external_link'] == 1) ? true : false;
                }
                $sub_title = $sub_item[0];
                $sub_name  = isset($sub_item[5]) ? $sub_item[5] : '';
                $sub_icon  = isset($sub_item[6]) ? $sub_item[6] : '';

                $sub_menu_hook = get_plugin_page_hook($sub_slug, $menu_slug);
                $sub_file = $sub_slug;
                $pos = strpos($sub_file, '?');

                if (false !== $pos) {
                    $sub_file = substr($sub_file, 0, $pos);
                }


                $sub_url = '';

                $arrParsedUrl = wp_parse_url($sub_slug);
                if (!empty($arrParsedUrl['scheme'])) {
                    if ($arrParsedUrl['scheme'] === "http" || $arrParsedUrl['scheme'] === "https") {
                        $sub_url = $sub_slug;
                    }
                } else {
                    $sub_url = ( ! empty($sub_menu_hook) || ( ( 'index.php' !== $sub_slug ) && file_exists(WP_PLUGIN_DIR . "/$sub_file") && ! file_exists(ABSPATH . "/wp-admin/$sub_file") ) )
                    ? \PXLBSAdminify\Inc\Utils::maybe_network_admin_url('admin.php?page=' . $sub_slug)
                    : \PXLBSAdminify\Inc\Utils::maybe_network_admin_url($sub_slug);
                }

                // Wrong Menu/Submenu Links

                // Support for White Label Plugin Url
                if ('white-label' === $sub_slug) {
                    $sub_url = admin_url('options-general.php?page=white-label');
                }

                // JetFormBuilder
                if ('jet-form-builder' === $sub_slug) { $sub_url = admin_url('edit.php?post_type=jet-form-builder'); }
                if ('jet-form-builder' === $sub_slug) { $sub_url = admin_url('post-new.php?post_type=jet-form-builder'); }
                if ('jfb-settings' === $sub_slug) { $sub_url = admin_url('edit.php?post_type=jet-form-builder&page=jfb-settings'); }
                if ('jfb-addons' === $sub_slug) { $sub_url = admin_url('edit.php?post_type=jet-form-builder&page=jfb-addons'); }
                if ('jfb-payments' === $sub_slug) { $sub_url = admin_url('edit.php?post_type=jet-form-builder&page=jfb-payments'); }
                if ('jfb-records' === $sub_slug) { $sub_url = admin_url('edit.php?post_type=jet-form-builder&page=jfb-records'); }

                // WP Adminify Support - open in new tab
                if ('adminify-support' === $sub_slug) {
                    $sub_url = \PXLBSAdminify\Inc\Admin\AdminSettings::support_url();
                    $external_link = true;
                }

                // WP Adminify Pricing/Upgrade - open in new tab
                if ('wp-adminify-settings-pricing' === $sub_slug) {
                    $sub_url = 'https://wpadminify.com/pricing';
                    $external_link = true;
                }

                $admin_menu[$menu_key_id]['children'][$sub_key_id] = [
                    'key'               => $sub_key_id,
                    'title'             => $sub_title,
                    'url'               => $sub_url,
                    'name'              => $sub_name,
                    'icon'              => $sub_icon,
                    'external_link'     => $external_link,
                ];
            }
        }
    }

    // Elementor 3rd-level flyout menu integration
    // Grabs Quick Start, Settings, Tools, Role Manager, etc. from Elementor's sidebar navigation
    // Wrapped in Throwable catch so any Elementor API change degrades gracefully
    try {
        $elementor_flyout_class = '\Elementor\Modules\EditorOne\Classes\Menu_Data_Provider';

        if (class_exists($elementor_flyout_class)) {
            $elementor_menu_key = isset($admin_menu['elementor-home']) ? 'elementor-home' :
                                 (isset($admin_menu['elementor']) ? 'elementor' : null);

            if ($elementor_menu_key && isset($admin_menu[$elementor_menu_key]['children']['elementor'])
                && method_exists($elementor_flyout_class, 'instance')
            ) {
                $menu_data_provider = $elementor_flyout_class::instance();

                // Try known method names in order: current API → known alternates
                $flyout_items = [];
                $method_candidates = [
                    'get_third_level_data'  => ['editor_flyout'], // Current Elementor API
                    'get_editor_flyout_data' => [],               // Legacy / alternate
                    'get_level3_items'       => [],               // Fallback
                ];

                foreach ($method_candidates as $method => $args) {
                    if (!method_exists($menu_data_provider, $method)) {
                        continue;
                    }

                    $result = call_user_func_array([$menu_data_provider, $method], $args);

                    if (is_array($result)) {
                        // Normalize: result might wrap items under an 'items' key or be the array itself
                        $flyout_items = isset($result['items']) && is_array($result['items'])
                            ? $result['items']
                            : $result;
                    }
                    break;
                }

                if (!empty($flyout_items)) {
                    $flyout_children = [];

                    foreach ($flyout_items as $item) {
                        if (!is_array($item)) {
                            continue;
                        }

                        // Flexible key mapping — tolerate renamed fields
                        $slug  = $item['slug'] ?? ($item['id'] ?? '');
                        $label = $item['label'] ?? ($item['title'] ?? '');
                        $url   = $item['url'] ?? ($item['link'] ?? '');

                        if (empty($slug) || empty($label)) {
                            continue;
                        }

                        $flyout_children[$slug] = [
                            'key'             => $slug,
                            'title'           => $label,
                            'url'             => $url,
                            'icon'            => $item['icon'] ?? '',
                            'name'            => '',
                            'is_flyout_child' => true,
                            'external_link'   => false,
                        ];
                    }

                    if (!empty($flyout_children)) {
                        $admin_menu[$elementor_menu_key]['children']['elementor']['children'] = $flyout_children;
                        $admin_menu[$elementor_menu_key]['children']['elementor']['has_flyout_children'] = true;
                    }
                }
            }
        }
    } catch (\Throwable $e) {
        // Silently degrade — menu renders without flyout items
    }

    $admin_menu = pxlbsadminify_replaceAmpersandInHref($admin_menu, 'url');
    return $admin_menu;
}

/**
* Recursively replace all occurrences of &amp; with & in an array.
*
* @see https://wordpress.org/support/topic/automatically-adding-amp-in-url/
* @param array $array The input array to process.
* @return array The updated array with replacements.
*/
function pxlbsadminify_replaceAmpersandInHref($array, $indicator='href') {

    foreach ($array as $key => $value) {
        if (is_array($value)) {
            // Recursively process child arrays
            $array[$key] = pxlbsadminify_replaceAmpersandInHref($value, $indicator);
        } elseif ($key === $indicator && is_string($value)) {
            // Replace &amp; with & in $indicator keys
            $array[$key] = str_replace('&amp;', '&', $value);
        }
    }
    return $array;
}
