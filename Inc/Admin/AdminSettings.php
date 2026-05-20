<?php

namespace PXLBSAdminify\Inc\Admin;

use PXLBSAdminify\Inc\Utils;
use PXLBSAdminify\Inc\Admin\AdminSettingsModel;
use PXLBSAdminify\Inc\Admin\Options\Customize;
use PXLBSAdminify\Inc\Admin\Options\Productivity;
use PXLBSAdminify\Inc\Admin\Options\CustomCSSJS;
use PXLBSAdminify\Inc\Admin\Options\Performance;
use PXLBSAdminify\Inc\Admin\Options\MenuLayout;
use PXLBSAdminify\Inc\Admin\Options\Security;
use PXLBSAdminify\Inc\Admin\Options\White_Label;
if ( !defined( 'ABSPATH' ) ) {
    die;
}
// Cannot access directly.
if ( !class_exists( 'AdminSettings' ) ) {
    class AdminSettings extends AdminSettingsModel {
        // AdminSettings cannot be extended by creating instances
        public static $instance = null;

        public $defaults = [];

        private $message = [];

        public function __construct() {
            // this should be first so the default values get stored
            $this->pxlbsadminify_options();
            parent::__construct( (array) get_option( $this->prefix ) );
            add_action( 'network_admin_menu', [$this, 'network_panel'] );
            add_filter(
                'pxlbsadminify_render_field_html',
                array($this, 'render_pro_locked_field'),
                10,
                2
            );
        }

        public function network_panel() {
            add_menu_page(
                $this->get_plugin_menu_label(),
                $this->get_plugin_menu_label(),
                'manage_options',
                'wp-adminify-settings',
                [$this, 'network_panel_display'],
                PXLBSADMINIFY_ASSETS_IMAGE . 'logos/menu-icon.svg',
                30
            );
        }

        public function get_bloginfo( $blog_id, $fields = [] ) {
            switch_to_blog( $blog_id );
            $_fields = [];
            foreach ( $fields as $field ) {
                $_fields[$field] = get_bloginfo( $field );
            }
            restore_current_blog();
            return $_fields;
        }

        public function get_sites() {
            $sites = get_sites();
            foreach ( $sites as $site ) {
                $info = $this->get_bloginfo( $site->blog_id, ['name'] );
                $site->name = $info['name'];
            }
            return $sites;
        }

        public function get_sites_option_empty() {
            /* translators: 1: option value attribute, 2: option label text */
            return sprintf( __( '<option value="%1$s">%2$s</option>', 'adminify' ), 0, __( 'Select', 'adminify' ) );
        }

        public function get_sites_option( $sites = [], $add_empty_slot = false ) {
            if ( empty( $sites ) ) {
                $sites = $this->get_sites();
            }
            $_sites = [];
            if ( $add_empty_slot ) {
                $_sites[] = $this->get_sites_option_empty();
            }
            foreach ( $sites as $site ) {
                /* translators: 1: site blog ID used as option value, 2: site name shown as option label */
                $_sites[] = sprintf( __( '<option value="%1$s">%2$s</option>', 'adminify' ), $site->blog_id, $site->name );
            }
            return implode( '', $_sites );
        }

        public function maybe_display_message() {
            if ( empty( $this->message ) ) {
                return;
            }
            $classes = 'adminify-status adminify-status--' . esc_attr( $this->message['type'] );
            echo '<div class="' . esc_attr( $classes ) . '"><p>' . wp_kses_post( $this->message['message'] ) . '</p></div>';
        }

        public function network_panel_display() {
            $multisite_settings = sprintf(
                wp_kses_post( '<div class="%1$s"><h2>%2$s</h2> <a href="%3$s" target="_blank">%4$s</a></div>', 'adminify' ),
                Utils::upgrade_pro_notice_class(),
                esc_html__( 'Network Settings', 'adminify' ),
                esc_url( 'https://wpadminify.com/pricing' ),
                Utils::upgrade_pro_notice_class( 'Please Upgrade or Activate License' )
            );
            // Initialize the multisite_settings variable
            $multisite_settings = apply_filters( 'pxlbsadminify/admin_settings/network', $multisite_settings );
            // Apply the filter
            echo wp_kses_post( $multisite_settings );
        }

        public function option_modules() {
            $extra_data_merge = [];
            $clonable_data = [
                'pxlbsadminify_settings'                      => __( 'Adminify Options', 'adminify' ),
                '_adminify_admin_columns_adminify_admin_page' => __( 'Admin Page Columns Data', 'adminify' ),
            ];
            // Activity Logs Active
            if ( Utils::is_plugin_active( 'adminify-activity-logs/adminify-activity-logs.php' ) ) {
                $extra_data_merge['adminify_activity_logs'] = __( 'Activity Logs Data', 'adminify' );
                $clonable_data = array_merge( $clonable_data, $extra_data_merge );
            }
            // Quick Circle Menu Active
            if ( Utils::is_plugin_active( 'adminify-quick-circle-menu/adminify-quick-circle-menu.php' ) ) {
                $extra_data_merge['pxlbsadminify_quick_circle_menu'] = __( 'Quick Circle Menu', 'adminify' );
                $clonable_data = array_merge( $clonable_data, $extra_data_merge );
            }
            // Google Pagespeed Active
            if ( Utils::is_plugin_active( 'adminify-google-pagespeed/adminify-google-pagespeed.php' ) ) {
                $extra_data_merge['adminify_page_speed'] = __( 'Google Pagespeed', 'adminify' );
                $clonable_data = array_merge( $clonable_data, $extra_data_merge );
            }
            // Login Customizer Active
            if ( Utils::is_plugin_active( 'loginfy/loginfy.php' ) ) {
                $extra_data_merge['pxlbsadminify_login'] = __( 'Loginify Data', 'adminify' );
                $clonable_data = array_merge( $clonable_data, $extra_data_merge );
            }
            // Header Footer Scripts Active
            if ( Utils::is_plugin_active( 'adminify-sidebar-generator/adminify-sidebar-generator.php' ) ) {
                $extra_data_merge['pxlbsadminify_sidebar_settings'] = __( 'Sidebar Generator', 'adminify' );
                $clonable_data = array_merge( $clonable_data, $extra_data_merge );
            }
            // Sidebar Generator Active
            if ( Utils::is_plugin_active( 'adminify-header-footer-scripts/adminify-header-footer-scripts.php' ) ) {
                $extra_data_merge['pxlbsadminify_custom_js_css'] = __( 'Custom JS/CSS', 'adminify' );
                $clonable_data = array_merge( $clonable_data, $extra_data_merge );
            }
            // Admin Columns Active
            if ( Utils::is_plugin_active( 'adminify-admin-columns/adminify-admin-columns.php' ) ) {
                $extra_data_merge['_adminify_admin_columns_page'] = __( 'Admin Columns Page Data', 'adminify' );
                $extra_data_merge['_adminify_admin_columns_post'] = __( 'Admin Columns Post Data', 'adminify' );
                $clonable_data = array_merge( $clonable_data, $extra_data_merge );
            }
            return (array) apply_filters( 'adminify_clone_blog_option_modules', $clonable_data );
        }

        public function get_pagespeed_data( $copy_from ) {
            switch_to_blog( $copy_from );
            global $wpdb;
            $table_name = $wpdb->prefix . 'adminify_page_speed';
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name derived from a sanitized internal value, no user input; direct query required for reading a custom plugin table; not cached intentionally.
            $histories = $wpdb->get_results( "SELECT * FROM {$table_name}", ARRAY_A );
            restore_current_blog();
            return $histories;
        }

        public function clone_pagespeed_data( $histories, $copy_to ) {
            switch_to_blog( $copy_to );
            global $wpdb;
            $table_name = $wpdb->prefix . 'adminify_page_speed';
            foreach ( $histories as $history ) {
                unset($history['id']);
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required for writing to a custom plugin table; not cached intentionally.
                $wpdb->insert( "{$table_name}", $history, [
                    'url'           => '%s',
                    'score_desktop' => '%d',
                    'score_mobile'  => '%d',
                    'data_desktop'  => '%s',
                    'data_mobile'   => '%s',
                    'screenshot'    => '%s',
                    'time'          => '%s',
                ] );
            }
            restore_current_blog();
        }

        public function get_admin_columns_options( $copy_from ) {
            $options = [];
            switch_to_blog( $copy_from );
            $args = [
                'public' => true,
            ];
            $types = get_post_types( $args );
            unset($types['attachment']);
            restore_current_blog();
            foreach ( $types as $type ) {
                $options[] = '_adminify_admin_columns_meta_' . esc_attr( $type );
            }
            return $options;
        }

        public static function get_instance() {
            if ( !is_null( self::$instance ) ) {
                return self::$instance;
            }
            self::$instance = new self();
            return self::$instance;
        }

        protected function get_defaults() {
            return $this->defaults;
        }

        public static function get_pro_label() {
            $is_pro = "";
            $is_pro = esc_html__( 'Adminify', 'adminify' );
            return $is_pro;
        }

        public function get_plugin_menu_icon() {
            $menu_icon = PXLBSADMINIFY_ASSETS_IMAGE . 'logos/menu-icon-light.svg';
            $saved_data = get_option( $this->prefix );
            if ( isset( $saved_data['white_label']['adminify']['menu_icon'] ) && !empty( $saved_data['white_label']['adminify']['menu_icon']['url'] ) ) {
                $menu_icon = $saved_data['white_label']['adminify']['menu_icon']['url'];
            }
            return $menu_icon;
        }

        public function get_plugin_menu_label() {
            $plugin_menu_label = self::get_pro_label();
            $saved_data = get_option( $this->prefix );
            if ( isset( $saved_data['white_label']['adminify']['menu_label'] ) && !empty( $saved_data['white_label']['adminify']['menu_label'] ) ) {
                $plugin_menu_label = $saved_data['white_label']['adminify']['menu_label'];
            }
            return $plugin_menu_label;
        }

        public static function support_url() {
            $support_url = '';
            $support_url = 'https://wordpress.org/support/plugin/adminify/#new-topic-0';
            return $support_url;
        }

        public function pxlbsadminify_options() {
            if ( !class_exists( 'ADMINIFY' ) ) {
                return;
            }
            $submenu_position = apply_filters( 'pxlbsadminify_submenu_position', 30 );
            $saved_data = get_option( $this->prefix );
            $global_admin_ui_mode = ( empty( $saved_data['light_dark_mode']['admin_ui_mode'] ) ? 'light' : sanitize_text_field( $saved_data['light_dark_mode']['admin_ui_mode'] ) );
            $admin_ui_mode = ( empty( get_user_meta( get_current_user_id(), 'color_mode', true ) ) ? $global_admin_ui_mode : get_user_meta( get_current_user_id(), 'color_mode', true ) );
            $light_logo_image_url = PXLBSADMINIFY_ASSETS_IMAGE . 'logos/logo-text-light.svg';
            $dark_logo_image_url = PXLBSADMINIFY_ASSETS_IMAGE . 'logos/logo-text-dark.svg';
            $plugin_author_name = PXLBSADMINIFY_AUTHOR;
            // WP Adminify Options
            \ADMINIFY::createOptions( $this->prefix, [
                'framework_title'         => '<img class="wp-adminify-settings-logo adminify-settings-light-logo" src=' . esc_url( $light_logo_image_url ) . '><img class="wp-adminify-settings-logo adminify-settings-dark-logo" src=' . esc_url( $dark_logo_image_url ) . '>' . ' <small>by ' . esc_html( $plugin_author_name ) . '</small>',
                'framework_class'         => '',
                'menu_title'              => $this->get_plugin_menu_label(),
                'menu_slug'               => 'wp-adminify-settings',
                'menu_capability'         => 'manage_options',
                'menu_icon'               => $this->get_plugin_menu_icon(),
                'menu_position'           => 30,
                'menu_hidden'             => false,
                'menu_parent'             => 'admin.php?page=wp-adminify-settings',
                'show_bar_menu'           => true,
                'show_sub_menu'           => false,
                'show_in_network'         => false,
                'show_in_customizer'      => false,
                'show_search'             => false,
                'show_reset_all'          => true,
                'show_reset_section'      => true,
                'show_footer'             => true,
                'show_all_options'        => false,
                'show_form_warning'       => true,
                'sticky_header'           => false,
                'save_defaults'           => false,
                'ajax_save'               => true,
                'admin_bar_menu_icon'     => '',
                'admin_bar_menu_priority' => 80,
                'footer_text'             => ' ',
                'footer_after'            => ' ',
                'footer_credit'           => ' ',
                'database'                => 'options',
                'transient_time'          => 0,
                'contextual_help'         => [],
                'contextual_help_sidebar' => '',
                'enqueue_webfont'         => true,
                'async_webfont'           => false,
                'output_css'              => true,
                'nav'                     => 'normal',
                'has_nav'                 => false,
                'theme'                   => 'dark',
                'class'                   => 'wp-adminify-settings',
                'defaults'                => [],
            ] );
            $this->defaults = array_merge( $this->defaults, ( new Customize() )->get_defaults() );
            $this->defaults = array_merge( $this->defaults, ( new MenuLayout() )->get_defaults() );
            $this->defaults = array_merge( $this->defaults, ( new Productivity() )->get_defaults() );
            $this->defaults = array_merge( $this->defaults, ( new Security() )->get_defaults() );
            $this->defaults = array_merge( $this->defaults, ( new Performance() )->get_defaults() );
            $this->defaults = array_merge( $this->defaults, ( new CustomCSSJS() )->get_defaults() );
            $this->defaults = array_merge( $this->defaults, ( new White_Label() )->get_defaults() );
            // Fix Missing keys on save
            add_filter( "adminify_{$this->prefix}_save", function ( $data ) {
                $data = $this->fix_missing_keys( $this->defaults, $data );
                return $data;
            } );
            // Backup Settings
            \ADMINIFY::createSection( $this->prefix, [
                'title'  => __( 'Backup', 'adminify' ),
                'icon'   => 'fas fa-database',
                'fields' => [[
                    'type'    => 'subheading',
                    'content' => Utils::help_urls(
                        __( 'Backup Config Settings', 'adminify' ),
                        'https://wpadminify.com/docs/adminify/export-import/backup',
                        'https://www.youtube.com/playlist?list=PLqpMw0NsHXV-EKj9Xm1DMGa6FGniHHly8',
                        'https://www.facebook.com/groups/jeweltheme',
                        self::support_url()
                    ),
                ], [
                    'type'  => 'backup',
                    'class' => 'adminify-block',
                ]],
            ] );
        }

        function fix_missing_keys( $defaults, $data ) {
            if ( is_array( $defaults ) ) {
                foreach ( $defaults as $key => $value ) {
                    if ( is_array( $value ) ) {
                        if ( !isset( $data[$key] ) || gettype( $data[$key] ) !== 'array' ) {
                            $data[$key] = [];
                        }
                        $data[$key] = $this->fix_missing_keys( $value, $data[$key] );
                    }
                }
            }
            return $data;
        }

        public function get_prefix() {
            return $this->prefix;
        }

        /**
         * Render-time hook that neutralizes Pro-locked controls in the
         * free build. Bypassed when the Pro plugin is active so the Pro
         * UI is unchanged.
         *
         * Two operating modes, both detected from the rendered HTML:
         *
         * 1. Field-level lock (the field's class array contains
         *    'adminify-pro-locked'): strip name="..." from every input/
         *    select/textarea, add disabled + tabindex="-1", and wrap the
         *    entire field with a <div class="adminify-pro-locked-wrapper">
         *    that carries a lock-icon + "Upgrade to Pro" CTA overlay.
         *
         * 2. Option-level lock (a checkbox/radio option label contains
         *    <span class="adminify-pro-locked-option">): for every <li>
         *    that contains the marker span, strip name="..." from the
         *    enclosed input and add disabled + tabindex="-1". Inline lock
         *    icon is rendered by CSS off the marker class itself.
         *
         * @param string $html  Rendered field HTML from the framework.
         * @param array  $field Field config array.
         * @return string Possibly transformed HTML.
         */
        public function render_pro_locked_field( $html, $field ) {
            // Pro plugin active: leave HTML untouched.
            if ( function_exists( 'jltwp_adminify' ) && jltwp_adminify()->can_use_premium_code__premium_only() ) {
                return $html;
            }
            $field_class = '';
            if ( is_array( $field ) && isset( $field['class'] ) ) {
                $field_class = (string) $field['class'];
            }
            // Detect field-level lock from either the new marker class
            // (adminify-pro-locked) or the legacy Pro-feature classes that
            // pre-date the render-disable hook. Both signal a Pro-only
            // field that must not submit a value in the free build.
            $has_field_lock = strpos( $field_class, 'adminify-pro-locked' ) !== false || strpos( $field_class, 'adminify-pro-fieldset' ) !== false || strpos( $field_class, 'adminify-pro-feature' ) !== false || strpos( $field_class, 'adminify-pro-notice' ) !== false;
            // Per-option lock signal: the helper Utils::upgrade_pro_class()
            // emits a <span class="adminify-pro-checkbox"> next to a Pro-only
            // checkbox label. Match that span (or the historical
            // adminify-pro-locked-option marker) inside <li> blocks.
            $has_option_lock = strpos( $html, 'adminify-pro-checkbox' ) !== false || strpos( $html, 'adminify-pro-locked-option' ) !== false;
            if ( !$has_field_lock && !$has_option_lock ) {
                return $html;
            }
            if ( $has_field_lock ) {
                // Strip name attrs and disable inputs across the whole field.
                // The visual treatment is the inline <span class="adminify-pro-badge">Pro</span>
                // rendered by the helper — no extra wrapper / overlay.
                $html = $this->adminify_strip_inputs( $html );
                return $html;
            }
            // Option-level: only strip inputs inside <li> blocks that
            // carry the per-option marker. Match each <li> ... </li>
            // non-greedily.
            $html = preg_replace_callback( '#<li\\b[^>]*>(.*?)</li>#is', function ( $li_match ) {
                $li_inner = $li_match[1];
                if ( strpos( $li_inner, 'adminify-pro-checkbox' ) === false && strpos( $li_inner, 'adminify-pro-locked-option' ) === false ) {
                    return $li_match[0];
                }
                $open_tag_end = strpos( $li_match[0], '>' );
                $open_tag = substr( $li_match[0], 0, $open_tag_end + 1 );
                return $open_tag . $this->adminify_strip_inputs( $li_inner ) . '</li>';
            }, $html );
            return $html;
        }

        /**
         * Strip name="..." from inputs/selects/textareas in the given
         * HTML and add disabled + tabindex="-1" if missing. Pure string
         * transform — the framework emits a known shape.
         */
        private function adminify_strip_inputs( $html ) {
            $html = preg_replace( '/\\s+name="[^"]*"/i', '', $html );
            $html = preg_replace_callback( '/<(input|select|textarea)\\b([^>]*)>/i', function ( $m ) {
                $attrs = $m[2];
                if ( strpos( $attrs, 'disabled' ) === false ) {
                    $attrs .= ' disabled="disabled"';
                }
                if ( strpos( $attrs, 'tabindex=' ) === false ) {
                    $attrs .= ' tabindex="-1"';
                }
                return '<' . $m[1] . $attrs . '>';
            }, $html );
            return $html;
        }

    }

}