<?php

namespace PXLBSAdminify\Inc\Admin;

use PXLBSAdminify\Inc\Utils;
use \PXLBSAdminify\Inc\Classes\CustomAdminColumns;
use \PXLBSAdminify\Inc\Classes\Tweaks;
use \PXLBSAdminify\Inc\Classes\MenuStyle;
use \PXLBSAdminify\Inc\Classes\AdminBar;
use \PXLBSAdminify\Inc\Classes\OutputCSS;
use \PXLBSAdminify\Inc\Classes\ThirdPartyCompatibility;
use \PXLBSAdminify\Inc\Classes\AdminFooterText;
use \PXLBSAdminify\Inc\Admin\Modules;
use \PXLBSAdminify\Inc\Classes\Sidebar_Widgets;
use \PXLBSAdminify\Inc\Classes\Remove_DashboardWidgets;
use PXLBSAdminify\Inc\Classes\Adminify_Rollback;
use PXLBSAdminify\Inc\Admin\AdminSettings;
use PXLBSAdminify\Inc\Admin\Frames\Init as FrameInit;

// no direct access allowed
if (!defined('ABSPATH')) {
	exit;
}
/**
 * WP Adminify
 * Admin Class
 *
 * @author Jewel Theme <support@jeweltheme.com>
 */

if (!class_exists('Admin')) {
	class Admin
	{
		public $options = [];

		public function __construct()
		{
			$this->options = AdminSettings::get_instance()->get();

			$this->pxlbsadminify_modules_manager();

			// Remove Page Header like - Dashboard, Plugins, Users etc
			// add_action('admin_head', [$this, 'remove_page_headline'], 99);


			// Freemius Hooks
			jltwp_adminify()->add_filter('plugin_icon', array($this, 'pxlbsadminify_logo_icon'));

			add_action('admin_menu', array($this, 'support_menu'), 1100);
			add_action('network_admin_menu', array($this, 'support_menu'), 1100);
			add_action('admin_menu', [$this, 'submenu_link_new_tab']);
			// jltwp_adminify()->add_filter('support_forum_url', [$this, 'pxlbsadminify_support_forum_url']);

			// Disable deactivation feedback form
			jltwp_adminify()->add_filter('show_deactivation_feedback_form', '__return_false');

			// Disable after deactivation subscription cancellation window
			jltwp_adminify()->add_filter('show_deactivation_subscription_cancellation', '__return_false');

			$this->disable_gutenberg_editor();

			add_filter('show_admin_bar', [ $this, 'pxlbsadminify_removeAdminBar'], PHP_INT_MAX);
			add_action('wp_head', [ $this,'pxlbsadminify_remove_header_for_baknd'], PHP_INT_MAX);

		}

		function pxlbsadminify_removeAdminBar($status)
		{
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
			if (!empty($_GET['bknd']) && sanitize_text_field(wp_unslash($_GET['bknd']))) {
				return false;
			}
			return $status;
		}

		function pxlbsadminify_remove_header_for_baknd() {
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
				if (isset($_GET['bknd']) && sanitize_text_field(wp_unslash($_GET['bknd'])) == '1') {
						echo '<script>
						jQuery(document).ready(function($){
							$("header").remove();
							$("footer").remove();
						})
					</script>';
				}
		}

		public function disable_gutenberg_editor()
		{
			// Sidebar Widgets Remove
			if (!empty($this->options['remove_widgets']['disable_gutenberg_editor'])) {
				// Disable Gutenberg for Block Editor
				add_filter('gutenberg_use_widgets_block_editor', '__return_false');
				// Disable Gutenberg for widgets.
				add_filter('use_widgets_block_editor', '__return_false');
			}

			// Disable Block Editor Gutenberg
			if (!empty($this->options["disable_gutenberg"]['disable_for']) && in_array('block_editor', $this->options["disable_gutenberg"]['disable_for'])) {
				add_filter('use_block_editor_for_post', '__return_false');
				add_action('wp_enqueue_scripts', [$this, 'remove_backend_gutenberg_scripts'], 20);
			}

			// Remove all scripts and styles added by Gutenberg
			if (isset($this->options["disable_gutenberg"]['disable_gutenberg_enable']) && $this->options["disable_gutenberg"]['disable_gutenberg_enable'] && in_array('remove_gutenberg_scripts', $this->options["disable_gutenberg"]['disable_for'])) {
				add_action('wp_enqueue_scripts', [$this, 'remove_gutenberg_scripts']);
				remove_action('enqueue_block_assets', 'wp_enqueue_registered_block_scripts_and_styles');
			}
		}


		// Dequeue all Frontend scripts and styles added by Gutenberg
		public function remove_gutenberg_scripts()
		{
			wp_dequeue_style('wp-block-library');
			wp_dequeue_style('wc-block-style'); // Remove WooCommerce block CSS

			// Remove Inline CSS
			// wp_deregister_style('wp-block-library-inline');
			// wp_dequeue_style('wp-block-library-inline');
		}

		/**
		 * Remove Gutenberg Scripts
		 *
		 * @return void
		 */
		public function remove_backend_gutenberg_scripts()
		{
			if (is_admin()) {
				// Remove CSS on the front end.
				wp_dequeue_style('wp-block-library');

				// Remove Gutenberg theme.
				wp_dequeue_style('wp-block-library-theme');

				// Remove inline global CSS on the front end.
				wp_dequeue_style('global-styles');
			}
		}

		/**
		 * Adminify Logo
		 *
		 * @param [type] $logo
		 *
		 * @return void
		 */
		public function pxlbsadminify_logo_icon($logo)
		{
			$logo = PXLBSADMINIFY_PATH . '/assets/images/adminify.svg';
			return $logo;
		}


		/**
		 * WP Adminify: Modules
		 */
		public function pxlbsadminify_modules_manager()
		{
			// new MenuStyle();
			new Modules();
			new AdminBar();
			new Tweaks();
			new OutputCSS();
			new ThirdPartyCompatibility();
			new AdminFooterText();
			new Sidebar_Widgets();
			new Remove_DashboardWidgets();

			if (!empty($this->options['admin_ui']) && preg_match('/https:\/\//', site_url()) && is_ssl()) {
				FrameInit::instance();
			}

			// Version Rollback
			// Adminify_Rollback::get_instance();
		}


		/**
		 * Remove Page Headlines: Dashboard, Plugins, Users
		 *
		 * @return void
		 */
		public function remove_page_headline()
		{
			$screen = get_current_screen();
			if (empty($screen->id)) {
				return;
			}

			if (in_array(
				$screen->id,
				[
					'dashboard',
					'nav-menus',
					'edit-tags',
					'themes',
					'widgets',
					'plugins',
					'plugin-install',
					'users',
					'user',
					'profile',
					'tools',
					'import',
					'export',
					'export-personal-data',
					'erase-personal-data',
					'options-general',
					'options-writing',
					'options-reading',
					'options-discussion',
					'options-media',
					'options-permalink',
				]
			)) {
				echo '<style>#wpbody-content .wrap > h1,#wpbody-content .wrap > h1.wp-heading-inline{display:none;}</style>';
			}
		}


		public function support_menu()
		{
			// $this->submenu_link_new_tab();
			// $adminify_ui = AdminSettings::get_instance()->get('admin_ui');
			$support_url = 'adminify-support';
			// if($adminify_ui ) {
				// $support_urlsss = \PXLBSAdminify\Inc\Admin\AdminSettings::support_url();
			// }
			add_submenu_page(
				'wp-adminify-settings',       // Ex. wp-adminify-settings
				__('Get Support', 'adminify'),
				__('Support', 'adminify'),
				'manage_options',
				$support_url,
				[$this, 'support_menu_redirect'],
				60
			);

			// Hook into admin_init to handle the redirect early, before any output
			add_action('admin_init', [$this, 'handle_support_redirect']);
		}

		/**
		 * Handle support menu redirect
		 * This method is called when the support page would normally load
		 */
		public function support_menu_redirect()
		{
			// This function body will never execute because we redirect in admin_init
			// But it needs to exist as the callback
		}

		/**
		 * Handle the actual redirect in admin_init before any output
		 */
		public function handle_support_redirect()
		{
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
			if (isset($_GET['page']) && sanitize_key(wp_unslash($_GET['page'])) === 'adminify-support') {
				$redirect_url = \PXLBSAdminify\Inc\Admin\AdminSettings::support_url();

				// Add the URLs to the allowed redirect hosts filter
				add_filter('allowed_redirect_hosts', function($hosts) {
					$hosts[] = 'wpadminify.com';
					$hosts[] = 'wordpress.org';
					return $hosts;
				});

				wp_safe_redirect($redirect_url, 301);
				exit;
			}
		}


		public function submenu_link_new_tab()
		{
			add_action('admin_footer', function () {
?>
				<script type="text/javascript">
					jQuery(document).ready(function($) {
						$('a[href="admin.php?page=adminify-support"]').attr('target', '_blank');
					});
				</script>
<?php
			});
		}

	}
}
