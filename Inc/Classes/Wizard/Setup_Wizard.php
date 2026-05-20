<?php

namespace PXLBSAdminify\Inc\Classes\Wizard;

// no direct access allowed
if (!defined('ABSPATH')) {
	exit;
}

class Setup_Wizard
{

	public function __construct()
	{
		add_action('admin_init', [$this, 'redirects']);
		add_action('admin_menu', [$this, 'setup_wizar_menu'], 11);
		add_action('admin_init', [$this, 'setup_wizard_run']);
	}

	public function setup_wizard_run()
	{
		new Adminify_Setup_Wizard();
	}


	public function setup_wizar_menu()
	{
		$submenu_position = apply_filters('pxlbsadminify_submenu_position', 1);
		add_submenu_page(
			'wp-adminify-settings',
			esc_html__( 'Setup Wizard by Adminify', 'adminify' ),
			esc_html__( 'Setup Wizard', 'adminify' ),
			apply_filters( 'pxlbsadminify_capability', 'manage_options' ),
			'wp-adminify-setup-wizard',
			$submenu_position
		);

		add_dashboard_page('', '', 'manage_options', 'wp-adminify-setup-wizard', '');
	}


	public function redirects()
	{
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
		if (!current_user_can('administrator') || is_network_admin() || isset($_GET['activate-multi']) || !current_user_can('manage_options')) {
			return;
		}

		// pxlbsadminify_setup_wizard_ran = 0 => not started
		// pxlbsadminify_setup_wizard_ran = 1 => finished
		// pxlbsadminify_setup_wizard_ran = 2 => started
		// pxlbsadminify_setup_wizard_ran = 3 => canceled

		$is_ran = get_option('pxlbsadminify_setup_wizard_ran', '0');

		if (is_admin()) {
			global $pagenow;
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
			if (($pagenow == 'index.php' && !isset($_GET['page'])) || ($pagenow == 'admin.php' && (isset($_GET['page']) && sanitize_text_field(wp_unslash($_GET['page'])) == 'wp-adminify-settings'))) {
				if ($is_ran == '2') {
					update_option('pxlbsadminify_setup_wizard_ran', '3');
				}
			}

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
			if ((($pagenow == 'index.php' && !isset($_GET['page'])) || ($pagenow == 'admin.php' && (isset($_GET['page']) && sanitize_text_field(wp_unslash($_GET['page'])) == 'wp-adminify-settings'))) && isset($_GET['adminify_setup_done_config']) && sanitize_text_field(wp_unslash($_GET['adminify_setup_done_config'])) == '1') {
				if ($is_ran == '2') {
					update_option('pxlbsadminify_setup_wizard_ran', '1');
				}
			}
		}

		if ($is_ran != '1' && $is_ran != '2' && $is_ran != '3') {
			update_option('pxlbsadminify_setup_wizard_ran', '2');
			wp_safe_redirect(admin_url('index.php?page=wp-adminify-setup-wizard'));
			exit;
		} elseif ($is_ran == '2') {
			new \PXLBSAdminify\Inc\Classes\Wizard\Adminify_Setup_Wizard();
		}
	}
}
