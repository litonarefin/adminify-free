<?php

/**
 * Plugin Name: Adminify – White Label, Admin Menu Editor, Login Customizer
 * Description: Customize the WordPress admin area with white-label branding, a drag-and-drop menu editor, login customizer, media folders, and security tools.
 * Plugin URI: https://wpadminify.com
 * Version: 4.2.2
 * Author: Pixar Labs
 * Author URI: https://pixarlabs.com
 * License:     GPLv3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: adminify
 * Domain Path: /languages
 *
 */
// No, Direct access Sir !!!
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
$pxlbsadminify_plugin_data = get_file_data( __FILE__, array(
    'Version'     => 'Version',
    'Plugin Name' => 'Plugin Name',
    'Author'      => 'Author',
    'Description' => 'Description',
    'Plugin URI'  => 'Plugin URI',
), false );
if ( function_exists( 'jltwp_adminify' ) ) {
    jltwp_adminify()->set_basename( false, __FILE__ );
} elseif ( !function_exists( 'jltwp_adminify' ) ) {
    // Create a helper function for easy SDK access.
    function jltwp_adminify() {
        global $jltwp_adminify;
        if ( !isset( $jltwp_adminify ) ) {
            // Activate multisite network integration.
            if ( !defined( 'WP_FS__PRODUCT_7829_MULTISITE' ) ) {
                define( 'WP_FS__PRODUCT_7829_MULTISITE', true );
            }
            // Include Freemius SDK.
            require_once __DIR__ . '/Libs/freemius/start.php';
            $jltadminify_menu = array(
                'slug'        => 'wp-adminify-settings',
                'first-path'  => 'admin.php?page=wp-adminify-settings',
                'account'     => false,
                'network'     => false,
                'support'     => false,
                'contact'     => false,
                'affiliation' => false,
                'pricing'     => true,
                'addons'      => false,
            );
            // WP Adminify
            $jltwp_adminify = fs_dynamic_init( array(
                'id'                  => '7829',
                'slug'                => 'adminify',
                'premium_slug'        => 'adminify-pro',
                'type'                => 'plugin',
                'public_key'          => 'pk_a0ea61beae7126eb845f7e58a03e5',
                'premium_suffix'      => 'Premium',
                'affiliation'         => false,
                'has_addons'          => false,
                'has_paid_plans'      => true,
                'is_org_compliant'    => true,
                'parallel_activation' => array(
                    'enabled'                  => true,
                    'premium_version_basename' => 'adminify-pro/adminify.php',
                ),
                'menu'                => ( function_exists( 'pxlbsadminify_get_menu_params__premium_only' ) ? pxlbsadminify_get_menu_params__premium_only() : $jltadminify_menu ),
                'is_live'             => true,
                'is_premium'          => false,
            ) );
        }
        return $jltwp_adminify;
    }

    // Init Freemius.
    jltwp_adminify();
    jltwp_adminify()->add_filter( 'deactivate_on_activation', '__return_false' );
    // Signal that SDK was initiated.
    do_action( 'pxlbsadminify_loaded' );
}
if ( !defined( 'PXLBSADMINIFY' ) ) {
    define( 'PXLBSADMINIFY', $pxlbsadminify_plugin_data['Plugin Name'] );
}
if ( !defined( 'PXLBSADMINIFY_VER' ) ) {
    define( 'PXLBSADMINIFY_VER', $pxlbsadminify_plugin_data['Version'] );
}
if ( !defined( 'PXLBSADMINIFY_FILE' ) ) {
    define( 'PXLBSADMINIFY_FILE', __FILE__ );
}
if ( !defined( 'PXLBSADMINIFY_SLUG' ) ) {
    define( 'PXLBSADMINIFY_SLUG', dirname( plugin_basename( __FILE__ ) ) );
}
if ( !defined( 'PXLBSADMINIFY_BASE' ) ) {
    define( 'PXLBSADMINIFY_BASE', plugin_basename( __FILE__ ) );
}
if ( !defined( 'PXLBSADMINIFY_PATH' ) ) {
    define( 'PXLBSADMINIFY_PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
}
if ( !defined( 'PXLBSADMINIFY_URL' ) ) {
    define( 'PXLBSADMINIFY_URL', trailingslashit( plugins_url( '/', __FILE__ ) ) );
}
if ( !defined( 'PXLBSADMINIFY_ASSETS' ) ) {
    define( 'PXLBSADMINIFY_ASSETS', PXLBSADMINIFY_URL . 'assets/' );
}
if ( !defined( 'PXLBSADMINIFY_ASSETS_IMAGE' ) ) {
    define( 'PXLBSADMINIFY_ASSETS_IMAGE', PXLBSADMINIFY_ASSETS . 'images/' );
}
if ( !defined( 'PXLBSADMINIFY_ASSET_PATH' ) ) {
    define( 'PXLBSADMINIFY_ASSET_PATH', wp_upload_dir()['basedir'] . '/wp-adminify' );
}
if ( !defined( 'PXLBSADMINIFY_ASSET_URL' ) ) {
    define( 'PXLBSADMINIFY_ASSET_URL', wp_upload_dir()['baseurl'] . '/wp-adminify' );
}
if ( !defined( 'PXLBSADMINIFY_DESC' ) ) {
    define( 'PXLBSADMINIFY_DESC', $pxlbsadminify_plugin_data['Description'] );
}
if ( !defined( 'PXLBSADMINIFY_AUTHOR' ) ) {
    define( 'PXLBSADMINIFY_AUTHOR', $pxlbsadminify_plugin_data['Author'] );
}
if ( !defined( 'PXLBSADMINIFY_URI' ) ) {
    define( 'PXLBSADMINIFY_URI', $pxlbsadminify_plugin_data['Plugin URI'] );
}
if ( !class_exists( '\\PXLBSAdminify\\WP_Adminify' ) ) {
    // Autoload Files
    require_once __DIR__ . '/vendor/autoload.php';
    // Instantiate WP Adminify Class
    require_once __DIR__ . '/class-wp-adminify.php';
}
// Activation and Deactivation hooks
if ( class_exists( '\\PXLBSAdminify\\WP_Adminify' ) ) {
    register_activation_hook( PXLBSADMINIFY_FILE, array('\\PXLBSAdminify\\WP_Adminify', 'pxlbsadminify_activation_hook') );
    register_deactivation_hook( PXLBSADMINIFY_FILE, array('\\PXLBSAdminify\\WP_Adminify', 'pxlbsadminify_deactivation_hook') );
}