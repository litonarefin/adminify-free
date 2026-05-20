<?php
/**
 * Upgrade routine for v4.2.0 — namespace prefix migration.
 *
 * Copies plugin option keys, user meta, term meta and post meta from the
 * legacy prefixes ("_wpadminify", "wp_adminify_", "jltwp_adminify_", etc.) to
 * the unique "pxlbsadminify_" prefix required for the WordPress.org plugin
 * review. Old keys are intentionally left in place for rollback safety.
 *
 * This file is included by PXLBSAdminify\Inc\Classes\Upgrade::run_updates().
 *
 * @package Adminify
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Run the one-time option/meta key migration.
 *
 * Idempotent: guarded by the "pxlbsadminify_keys_migrated" flag and by
 * per-key existence checks, so it is safe if included more than once.
 *
 * @return void
 */
function pxlbsadminify_migrate_namespace_keys() {

    if ( get_option( 'pxlbsadminify_keys_migrated' ) ) {
        return;
    }

    $unset = '__pxlbsadminify_unset__'; // Sentinel — distinguishes "missing" from a stored empty value.

    /*
     * Option key map: legacy key => new key.
     * Framework-managed settings, flat options and notice flags.
     */
    $option_map = array(
        // Settings framework instances.
        '_wpadminify'                           => 'pxlbsadminify_settings',
        '_wpadminify_backup'                    => 'pxlbsadminify_settings_backup',
        '_wpadminify_custom_js_css'             => 'pxlbsadminify_custom_js_css',
        '_wpadminify_redirect_urls'             => 'pxlbsadminify_redirect_urls',
        '_wpadminify_server_info'               => 'pxlbsadminify_server_info',
        '_wpadminify_menu_settings'             => 'pxlbsadminify_menu_settings',
        '_wpadminify_dasboard_widgets'          => 'pxlbsadminify_dasboard_widgets',
        '_wpadminify_quick_circle_menu'         => 'pxlbsadminify_quick_circle_menu',
        '_wp_adminify_sidebar_settings'         => 'pxlbsadminify_sidebar_settings',
        '_jltadminbar_settings'                 => 'pxlbsadminify_adminbar_settings',

        // Notice / conflict flags.
        '_wpadminify_plugin_conflict'           => 'pxlbsadminify_plugin_conflict',
        '_wpadminify_plugin_update_info_notice' => 'pxlbsadminify_plugin_update_info_notice',
        'wpadminify_notice_discount_code'       => 'pxlbsadminify_notice_discount_code',

        // Version tracker.
        'wp_adminify_version'                   => 'pxlbsadminify_version',

        // Addon coupon flags.
        'wp_adminify_addon__coupon'             => 'pxlbsadminify_addon_coupon',
        'wp_adminify_addon__coupon_is_deleted'  => 'pxlbsadminify_addon_coupon_is_deleted',
        'wp_adminify_addon__is_eligible_for_coupon' => 'pxlbsadminify_addon_is_eligible_for_coupon',

        // Misc plugin state.
        'jltwp_adminify_activation_time'        => 'pxlbsadminify_activation_time',
        'jltwp_adminify_customizer_flush_url'   => 'pxlbsadminify_customizer_flush_url',
        'jltwp_adminify_login'                  => 'pxlbsadminify_login',
        'jltwp_adminify_setup_wizard_ran'       => 'pxlbsadminify_setup_wizard_ran',
        'jltwp_adminify_sheet_promo_data'       => 'pxlbsadminify_sheet_promo_data',
        'jltwp_adminify_sheet_promo_data_hash'  => 'pxlbsadminify_sheet_promo_data_hash',
        'jltwp_adminify_what_we_collect'        => 'pxlbsadminify_what_we_collect',
        'adminify_extra'                        => 'pxlbsadminify_extra',
        'adminify-notices'                      => 'pxlbsadminify_notices',
        'adminify-hidden-notices'               => 'pxlbsadminify_hidden_notices',
    );

    foreach ( $option_map as $old_key => $new_key ) {
        // Skip if the new key already holds a value.
        if ( $unset !== get_option( $new_key, $unset ) ) {
            continue;
        }
        $value = get_option( $old_key, $unset );
        if ( $unset !== $value ) {
            update_option( $new_key, $value );
        }
    }

    // Multisite-wide option.
    if ( is_multisite() ) {
        if ( $unset === get_site_option( 'pxlbsadminify_multisite_exclude', $unset ) ) {
            $ms_value = get_site_option( 'wp_adminify_multisite_exclude', $unset );
            if ( $unset !== $ms_value ) {
                update_site_option( 'pxlbsadminify_multisite_exclude', $ms_value );
            }
        }
    }

    global $wpdb;

    // User meta: _wpadminify_preferences => pxlbsadminify_preferences (admin-bar collapse state).
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-time key migration; not cacheable.
    $wpdb->query(
        "INSERT INTO {$wpdb->usermeta} (user_id, meta_key, meta_value)
         SELECT um.user_id, 'pxlbsadminify_preferences', um.meta_value
         FROM {$wpdb->usermeta} um
         WHERE um.meta_key = '_wpadminify_preferences'
         AND NOT EXISTS (
             SELECT 1 FROM {$wpdb->usermeta} um2
             WHERE um2.user_id = um.user_id AND um2.meta_key = 'pxlbsadminify_preferences'
         )"
    );

    // Term meta: _wp_adminify_fodler_color => pxlbsadminify_fodler_color (Folders module).
    if ( ! empty( $wpdb->termmeta ) ) {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-time key migration; not cacheable.
        $wpdb->query(
            "INSERT INTO {$wpdb->termmeta} (term_id, meta_key, meta_value)
             SELECT tm.term_id, 'pxlbsadminify_fodler_color', tm.meta_value
             FROM {$wpdb->termmeta} tm
             WHERE tm.meta_key = '_wp_adminify_fodler_color'
             AND NOT EXISTS (
                 SELECT 1 FROM {$wpdb->termmeta} tm2
                 WHERE tm2.term_id = tm.term_id AND tm2.meta_key = 'pxlbsadminify_fodler_color'
             )"
        );
    }

    // Post meta: _wp_adminify_* => pxlbsadminify_* (Pro Admin Pages module).
    // "_wp_adminify_" is 13 characters; keep the suffix after it.
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-time key migration; not cacheable.
    $wpdb->query(
        "INSERT INTO {$wpdb->postmeta} (post_id, meta_key, meta_value)
         SELECT pm.post_id, CONCAT('pxlbsadminify_', SUBSTRING(pm.meta_key, 14)), pm.meta_value
         FROM {$wpdb->postmeta} pm
         WHERE pm.meta_key LIKE '\\_wp\\_adminify\\_%'
         AND NOT EXISTS (
             SELECT 1 FROM {$wpdb->postmeta} pm2
             WHERE pm2.post_id = pm.post_id
             AND pm2.meta_key = CONCAT('pxlbsadminify_', SUBSTRING(pm.meta_key, 14))
         )"
    );

    // Clear stale transients renamed in v4.2.0. These are caches that simply
    // regenerate on the next request, so the old keys only need deleting.
    delete_transient( 'wp_adminify_addon_plugins_data' );
    delete_transient( 'wp_adminify_rollback_versions_' . PXLBSADMINIFY_VER );
    delete_transient( '_adminify_activation_redirect' );

    // The promo/update remote-sync cron was removed in v4.2.0 (no more remote
    // calls). Unschedule it on existing installs so the dead hook stops firing.
    wp_clear_scheduled_hook( 'pxlbsadminify_sheet_promo_data_remote_sync' );

    // Stop the upgrade loop for installs already on v4.x (past the deferred v4.0 DB upgrade).
    $installed = get_option( 'pxlbsadminify_version', get_option( 'wp_adminify_version', '1.0.0' ) );
    if ( version_compare( $installed, '4.0', '>=' ) ) {
        update_option( 'pxlbsadminify_version', PXLBSADMINIFY_VER );
    }

    update_option( 'pxlbsadminify_keys_migrated', true );
}

pxlbsadminify_migrate_namespace_keys();
