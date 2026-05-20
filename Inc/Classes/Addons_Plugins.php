<?php

namespace PXLBSAdminify\Inc\Classes;

use PXLBSAdminify\Libs\Addons;

// no direct access allowed
if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Addons_Plugins')) {
    /**
     * Addons Plugins class
     *
     * Jewel Theme <support@jeweltheme.com>
     */
    class Addons_Plugins extends Addons
    {

        private $transient_key = 'pxlbsadminify_addon_plugins_data';

        /**
         * Constructor method
         */
        public function __construct()
        {
            $this->menu_order = 99; // for submenu order value should be more than 10 .
            parent::__construct($this->menu_order);
            add_action('admin_enqueue_scripts', [$this, 'add_addons_thickbox']);
        }

        public function add_addons_thickbox()
        {
            add_thickbox();
        }

        /**
         * Menu list
         */
        public function menu_items()
        {
            return array(
                array(
                    'key'   => 'all',
                    'label' => 'All',
                ),
                array(
                    'key'   => 'featured', // key should be used as category to the plugin list.
                    'label' => 'Featured Item',
                ),
                array(
                    'key'   => 'popular',
                    'label' => 'Popular',
                ),
                array(
                    'key'   => 'favorites',
                    'label' => 'Favorites',
                ),
                array(
                    'key'   => 'recommended',
                    'label' => 'Recommended',
                ),
            );
        }

        /**
         * Get data from github
         *
         * @return void
         */
        public function get_adminify_plugins_lists()
        {

            // Return plugins data from cache if found
            $plugins_data = get_transient($this->transient_key);
            if (!empty($plugins_data)) return $plugins_data;

            // Read the add-ons catalogue from the copy bundled with the plugin
            // (no remote request).
            $catalogue_file = PXLBSADMINIFY_PATH . 'Inc/data/adminify-plugins.json';

            if (!is_readable($catalogue_file)) {
                return array();
            }

            $data_array = wp_json_file_decode($catalogue_file, array('associative' => true));

            if (empty($data_array) || !is_array($data_array)) {
                return array();
            }

            $plugins_data = [];

            foreach ($data_array as $plugin_data) {

                $plugins_data[$plugin_data['slug']] = $plugin_data;

                if (str_contains($plugin_data['download_link'], 'downloads.wordpress.org')) {

                    require_once(ABSPATH . 'wp-admin/includes/plugin-install.php');

                    $plugin_info = \plugins_api('plugin_information', array('slug' => $plugin_data['slug']));
                    if (is_wp_error($plugin_info)) {
                        unset($plugins_data[$plugin_data['slug']]);
                        continue;
                    }
                    $plugins_data[$plugin_data['slug']]['version'] = $plugin_info->version;
                } else {

                    if (! isset($plugin_data['version'])) {
                        unset($plugins_data[$plugin_data['slug']]);
                        continue;
                    }

                    $download_link = add_query_arg('version', $plugin_data['version'], $plugin_data['download_link']);
                    $plugins_data[$plugin_data['slug']]['download_link'] = $download_link;
                }
            }

            // Cache the processed catalogue.
            set_transient($this->transient_key, $plugins_data, DAY_IN_SECONDS / 2);

            return $plugins_data;
        }


        /**
         * Plugins List
         *
         * @author Jewel Theme <support@jeweltheme.com>
         */
        public function plugins_list()
        {
            // Do not hit the remote source on every admin load. At construction
            // we only return the cached catalogue; the live fetch happens on the
            // Add-ons page (get_addons_plugins_list) and on addon install, both
            // of which are explicit user actions.
            $cached = get_transient( $this->transient_key );
            return ! empty( $cached ) ? $cached : array();
        }

        /**
         * Admin submenu
         */
        public function admin_menu()
        {
            $submenu_position = apply_filters('pxlbsadminify_submenu_position', 50);
            add_submenu_page(
                'wp-adminify-settings',       // Ex. wp-adminify-settings /  edit.php?post_type=page .
                __('Addons', 'adminify'),
                sprintf('<span class="adminify-addons-text">%s</span>', __('Addons', 'adminify')),
                'manage_options',
                'wp-adminify-addons-plugins',
                array($this, 'render_addons_plugins'),
                $submenu_position
            );
        }
    }
}
