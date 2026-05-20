<?php

namespace PXLBSAdminify\Inc\Classes;

use PXLBSAdminify\Inc\Utils;
use PXLBSAdminify\Inc\Admin\AdminSettings;
use PXLBSAdminify\Inc\Admin\AdminSettingsModel;
use PXLBSAdminify\Inc\Classes\Addons_Plugins;



// no direct access allowed
if (!defined('ABSPATH')) {
	exit;
}

class Assets extends AdminSettingsModel
{

	public $classic_editor = true;
	public $block_editor = true;
	public  $dark_mode = true;

	public function __construct()
	{
		$this->options = (array) AdminSettings::get_instance()->get();
		$global_dark_mode = !empty($this->options['light_dark_mode']['admin_ui_mode']) ? $this->options['light_dark_mode']['admin_ui_mode'] : 'light';
		$this->dark_mode = empty(get_user_meta(get_current_user_id(), 'color_mode', true)) ? $global_dark_mode : get_user_meta(get_current_user_id(), 'color_mode', true);
		add_action('admin_enqueue_scripts', array($this, 'pxlbsadminify_admin_scripts'), 100);
		add_action('wp_ajax_pxlbsadminify_addons_install_active', array( $this, 'pxlbsadminify_addons_install_active' ) );

		if ($this->is_dark_mode() || $this->classic_editor || $this->block_editor) {
			add_action('admin_head', array($this, 'header_scripts'));
		}
	}


	/**
	 * Function: Ajax Call for Install and Activate WP Adminify Plugin
	 */
	function pxlbsadminify_addons_install_active()
	{

		// Include necessary WordPress files
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-ajax-upgrader-skin.php';
		require_once ABSPATH . 'wp-admin/includes/class-plugin-upgrader.php';

		if (isset($_POST['plugin'])) {

			$nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';

			if (!wp_verify_nonce($nonce, 'pxlbsadminify_addons_nonce')) {
				wp_send_json_error(array('mess' => esc_html__('Nonce is invalid', 'adminify')));
			}

			if ((is_multisite() && is_network_admin()) || !current_user_can('install_plugins')) {
				wp_send_json_error(array('mess' => esc_html__('Invalid Access', 'adminify')));
			}

			$plugin = sanitize_text_field(wp_unslash($_POST['plugin']));

			if (empty($plugin)) {
				wp_send_json_error(array('mess' => esc_html__('Invalid plugin', 'adminify')));
			}

			// Validate the requested plugin against the trusted addons list
			// and replace the user-supplied value with the canonical
			// download URL from that list before passing it to the upgrader.
			$addons         = new Addons_Plugins();
			$plugins_list   = (array) $addons->get_adminify_plugins_lists();
			$requested_slug = '';
			$trusted_source = '';
			foreach ( $plugins_list as $slug => $entry ) {
				if ( ! empty( $entry['download_link'] ) && $entry['download_link'] === $plugin ) {
					$requested_slug = $slug;
					$trusted_source = $entry['download_link'];
					break;
				}
				if ( $slug === $plugin ) {
					$requested_slug = $slug;
					$trusted_source = ! empty( $entry['download_link'] ) ? $entry['download_link'] : '';
					break;
				}
			}
			if ( empty( $requested_slug ) || empty( $trusted_source ) ) {
				wp_send_json_error( array( 'mess' => esc_html__( 'Invalid plugin', 'adminify' ) ) );
			}

			$type     = isset($_POST['type']) ? sanitize_text_field(wp_unslash($_POST['type'])) : 'install';
			$skin     = new \WP_Ajax_Upgrader_Skin();
			$upgrader = new \Plugin_Upgrader($skin);

			if ('install' === $type) {
				$result = $upgrader->install( $trusted_source );
				if (is_wp_error($result)) {
					wp_send_json_error(
						array(
							'mess' => $result->get_error_message(),
						)
					);
				}
				$args        = array(
					'slug'   => $upgrader->result['destination_name'],
					'fields' => array(
						'short_description' => true,
						'icons'             => true,
						'banners'           => false,
						'added'             => false,
						'reviews'           => false,
						'sections'          => false,
						'requires'          => false,
						'rating'            => false,
						'ratings'           => false,
						'downloaded'        => false,
						'last_updated'      => false,
						'added'             => false,
						'tags'              => false,
						'compatibility'     => false,
						'homepage'          => false,
						'donate_link'       => false,
					),
				);
				$plugin_data = plugins_api('plugin_information', $args);

				if ($plugin_data && !is_wp_error($plugin_data)) {
					$install_status = \install_plugin_install_status($plugin_data);
					activate_plugin($install_status['file']);
				}
				wp_die();  // die();
			}
		}
	}


	 /*
	 * Function is_dark_mode()
	 *
	 */
	public function is_dark_mode()
	{

		if (!empty($this->dark_mode) && $this->dark_mode == 'dark') {
			$adminify_dark_mode = true;
		} else {
			$adminify_dark_mode = false;
		}
		return $adminify_dark_mode;
	}

	public function header_scripts()
	{
		// Skip on excluded pages
		if ( $this->should_skip_adminify_scripts() ) {
			return;
		}

		if (!empty($this->dark_mode) && $this->dark_mode == 'dark') { ?>

			<script>
				window.AdminifyDarkMode.enable({
					brightness: 120
				})

				addEventListener("load", (event) => {
					window.AdminifyDarkMode.enable({
						brightness: 120
					})
				});
			</script>
		<?php }

		if (!empty($this->dark_mode) && $this->dark_mode == 'system') { ?>
			<script>
				const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
				if(!!isDark) {
					window.AdminifyDarkMode.enable({
						brightness: 120
					})

					addEventListener("load", (event) => {
						window.AdminifyDarkMode.enable({
							brightness: 120
						})
					});
				} else {
					window.AdminifyDarkMode.disable()

					addEventListener("load", (event) => {
						window.AdminifyDarkMode.disable()
					});
				}

			</script>

		<?php }

	}



	/**
	 * Check if current page should skip Adminify scripts
	 * Handles root, subdirectory, subdomain, and multisite installations
	 *
	 * @return bool True if scripts should be skipped
	 */
	private function should_skip_adminify_scripts() {
		global $pagenow;

		// Pages where Adminify scripts should not load
		$excluded_pages = [
			'customize.php',
			'wp-login.php',
			'wp-register.php',
		];

		// Check global $pagenow
		if ( in_array( $pagenow, $excluded_pages, true ) ) {
			return true;
		}

		// Fallback: Check PHP_SELF for subdirectory WordPress installs
		// Normalize path by extracting just the filename
		$php_self = isset( $_SERVER['PHP_SELF'] ) ? sanitize_text_field( wp_unslash( $_SERVER['PHP_SELF'] ) ) : '';
		$current_file = basename( $php_self );

		if ( in_array( $current_file, $excluded_pages, true ) ) {
			return true;
		}

		// Additional check using REQUEST_URI for edge cases
		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		foreach ( $excluded_pages as $page ) {
			if ( strpos( $request_uri, '/' . $page ) !== false ) {
				return true;
			}
		}

		return false;
	}


	public function pxlbsadminify_admin_scripts()
	{
		// Skip loading scripts on excluded pages (customize.php, login, etc.)
		if ( $this->should_skip_adminify_scripts() ) {
			return;
		}

		$screen = get_current_screen();


		// Register Styles
		wp_register_style('adminify-admin', PXLBSADMINIFY_ASSETS . 'css/wp-adminify' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		wp_register_style('adminify-default-ui', PXLBSADMINIFY_ASSETS . 'css/wp-adminify-default-ui' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		// wp_register_style('wp-adminify-admin-bar', PXLBSADMINIFY_ASSETS . 'css/admin-bar' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		wp_register_style('adminify-menu-editor', PXLBSADMINIFY_ASSETS . 'css/adminify-menu-editor' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		// wp_register_style('wp-adminify-dark-mode', PXLBSADMINIFY_ASSETS . 'css/dark-mode' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		// wp_register_style('wp-adminify-rtl', PXLBSADMINIFY_ASSETS . 'css/adminify-rtl' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		// wp_register_style('wp-adminify-responsive', PXLBSADMINIFY_ASSETS . 'css/adminify-responsive' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		// wp_register_style('wp-adminify-animate', PXLBSADMINIFY_ASSETS . 'vendors/animatecss/animate' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		wp_register_style('adminify-tokenize2', PXLBSADMINIFY_ASSETS . 'vendors/tokenize/tokenize2' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		wp_register_style('adminify-select2', PXLBSADMINIFY_ASSETS . 'vendors/select2/select2' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);


		// Register Scripts
		wp_register_script('adminify-tokenize2', PXLBSADMINIFY_ASSETS . 'vendors/tokenize/tokenize2.min.js', array('jquery'), PXLBSADMINIFY_VER, false);
		wp_register_script('adminify-select2', PXLBSADMINIFY_ASSETS . 'vendors/select2/select2.min.js', array('jquery'), PXLBSADMINIFY_VER, true);
		wp_register_script('adminify-admin', PXLBSADMINIFY_ASSETS . 'admin/js/wp-adminify' . Utils::assets_ext('.js'), array('jquery'), PXLBSADMINIFY_VER, true);

		// wp_register_script('wp-adminify-realtime-server', PXLBSADMINIFY_ASSETS . 'js/adminify-realtime-server.js', array('jquery'), PXLBSADMINIFY_VER, true);

		// Adminify Icon Picker
		wp_register_style('adminify-simple-line-icons', PXLBSADMINIFY_ASSETS . 'vendors/font-icons/simple-line-icons/css/simple-line-icons' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		wp_register_style('adminify-icon-picker', PXLBSADMINIFY_ASSETS . 'vendors/adminify-icon-picker/css/style' . Utils::assets_ext('.css'), false, PXLBSADMINIFY_VER);
		wp_register_script('adminify-icon-picker', PXLBSADMINIFY_ASSETS . 'vendors/adminify-icon-picker/js/adminify-icon-picker' . Utils::assets_ext('.js'), array('jquery'), PXLBSADMINIFY_VER, true);

		// Dark Mode
		wp_register_script('adminify--dark-mode', PXLBSADMINIFY_ASSETS . 'admin/js/wp-adminify-dark-mode' . Utils::assets_ext('.js'), array(), PXLBSADMINIFY_VER, false);

		// Menu Editor
		wp_register_script('adminify-menu-editor', PXLBSADMINIFY_ASSETS . 'admin/js/wp-adminify-menu-editor' . Utils::assets_ext('.js'), array('jquery', 'jquery-ui-sortable', 'adminify-icon-picker'), PXLBSADMINIFY_VER, true);

		// Styles Enqueue
		if (!empty($this->options['admin_ui'])) {
			// wp_enqueue_style('wp-adminify-animate');
			wp_enqueue_style('adminify-admin');
			// Commented on: 9-6-24
			// wp_enqueue_style('wp-adminify-admin-bar');
			// wp_enqueue_style('wp-adminify-responsive');
		} else {
			wp_enqueue_style('adminify-default-ui');
		}


		// RTL CSS
		if ( is_rtl() ) {
			wp_enqueue_style( 'adminify-rtl', PXLBSADMINIFY_URL . 'Libs/adminify-framework/assets/css/style-rtl'. Utils::assets_ext('.css'), array(), PXLBSADMINIFY_VER, 'all' );
		  }


		// Dark Mode Style
		// wp_enqueue_style('adminify-dark-mode');
		wp_enqueue_script('adminify--dark-mode');


		// Get local fonts data for frontend - download if not exists
		$local_fonts = GoogleFontsLocal::get_instance();
		$local_fonts_urls = [];

		// Process light mode logo font
		if (!empty($this->options['light_dark_mode']['admin_ui_light_mode']['admin_ui_light_logo_text_typo']['font-family'])) {
			$font_family = $this->options['light_dark_mode']['admin_ui_light_mode']['admin_ui_light_logo_text_typo']['font-family'];
			$font_weight = !empty($this->options['light_dark_mode']['admin_ui_light_mode']['admin_ui_light_logo_text_typo']['font-weight']) ? $this->options['light_dark_mode']['admin_ui_light_mode']['admin_ui_light_logo_text_typo']['font-weight'] : '400';

			if (!$local_fonts->is_font_local($font_family)) {
				$local_fonts->download_font($font_family, $font_weight);
			}

			$local_url = $local_fonts->get_local_font_url($font_family);
			if ($local_url) {
				$local_fonts_urls['light_logo'] = $local_url;
			}
		}

		// Process dark mode logo font
		if (!empty($this->options['light_dark_mode']['admin_ui_dark_mode']['admin_ui_dark_logo_text_typo']['font-family'])) {
			$font_family = $this->options['light_dark_mode']['admin_ui_dark_mode']['admin_ui_dark_logo_text_typo']['font-family'];
			$font_weight = !empty($this->options['light_dark_mode']['admin_ui_dark_mode']['admin_ui_dark_logo_text_typo']['font-weight']) ? $this->options['light_dark_mode']['admin_ui_dark_mode']['admin_ui_dark_logo_text_typo']['font-weight'] : '400';

			if (!$local_fonts->is_font_local($font_family)) {
				$local_fonts->download_font($font_family, $font_weight);
			}

			$local_url = $local_fonts->get_local_font_url($font_family);
			if ($local_url) {
				$local_fonts_urls['dark_logo'] = $local_url;
			}
		}

		$local_fonts_data = [
			'base_url' => $local_fonts->get_folder_url(),
			'urls' => $local_fonts_urls,
		];

		$localize_array_data = [
			'admin_ajax'  => admin_url('admin-ajax.php'),
			'settings'    => [
				'adminify_ui'  => !empty($this->options['admin_ui']) ? true : false,
			],
			'admin_nonce' => wp_create_nonce('adminify_nonce'),
			'is_pro'      => (class_exists('\\PXLBSAdminify\\Pro\\Adminify_Pro') && !empty(\PXLBSAdminify\Pro\Adminify_Pro::is_premium())) ? true : false,
			'local_fonts' => $local_fonts_data
		];

		// Pro-only settings flags (e.g. menu_search) attach via this
		// filter from Pro/Classes/Assets_Pro.php. Free leaves the
		// localize array untouched.
		$localize_array_data = (array) apply_filters( 'pxlbsadminify_admin_localize_data', $localize_array_data, $this->options );

		// Scripts Enqueue
		wp_enqueue_script('adminify-admin');
		wp_localize_script( 'adminify-admin', 'PXLBSADMINIFY_ADMIN', $localize_array_data );

		if (!wp_script_is('adminify-fa', 'enqueued') || !wp_script_is('adminify-fa5', 'enqueued')) {
			if (apply_filters('adminify_fa4', false)) {
				wp_enqueue_style('adminify-fa', PXLBSADMINIFY_ASSETS . 'vendors/fontawesome/fa4/css/font-awesome.min.css', array(), '4.7.0', 'all');
			} else {
				wp_enqueue_style('adminify-fa5', PXLBSADMINIFY_ASSETS . 'vendors/fontawesome/fa5/css/all.min.css', array(), '5.15.4', 'all');
				wp_enqueue_style('adminify-fa5-v4-shims', PXLBSADMINIFY_ASSETS . 'vendors/fontawesome/fa5/css/v4-shims.min.css', array(), '5.15.4', 'all');
			}
		}
		wp_enqueue_style('adminify-simple-line-icons');

		if ($screen->id === 'adminify_page_wp-adminify-addons-plugins' || $screen->id === 'adminify-pro_page_wp-adminify-addons-plugins') {
			// JS Files .
			wp_enqueue_script('adminify-addons', PXLBSADMINIFY_ASSETS . 'admin/js/wp-adminify-addons' . Utils::assets_ext('.js'), array('jquery'), PXLBSADMINIFY_VER, true);
			wp_localize_script(
				'adminify-addons',
				'PXLBSADMINIFY_CORE',
				array(
					'admin_ajax'        => admin_url('admin-ajax.php'),
					'addons_nonce' 		=> wp_create_nonce('pxlbsadminify_addons_nonce'),
					'plugin_key' 		=> 'pxlbsadminify'
				)
			);
		}
	}

	// WP Adminify Options Page Style
	public function pxlbsadminify_admin_script()
	{
		echo '<style>.wp-adminify-two-columns{ display: flex; flex-wrap: wrap; padding: 15px; } .wp-adminify .adminify-hightlight-field{ border: 2px solid #0347FF !important; font-weight: 600 !important;} .wp-adminify-two-columns .adminify-full-width-field{ width: 100% !important; flex-basis: 100% !important; } .wp-adminify-two-columns > .adminify-field{ width: 49%; flex-basis: 49%; margin-right: 1%; margin-top: -1px; border: 1px solid #eee; box-sizing: border-box; } .wp-adminify-two-columns.aminify-title-width-40 .adminify-title, .aminify-title-width-40 .adminify-title{ width: 40% !important;} .wp-adminify-two-columns.aminify-title-width-40 .adminify-fieldset, .aminify-title-width-40 .adminify-fieldset{ width: calc(60% - 20px) !important;} .wp-adminify-two-columns.aminify-title-width-65 .adminify-title{ width: 65%;} .wp-adminify-two-columns.aminify-title-width-65 .adminify-fieldset{ width: calc(35% - 20px);} .wp-adminify-two-columns .adminify-field-subheading{height:25px;box-sizing: content-box; width: 100%; flex-basis: 100%;} .wp-adminify-white-label-notice-content { background-color: #fff; box-shadow: 0px 0px 50px rgb(0 0 0 / 13%); position: absolute; top: 150px; left: 400px; width: 530px; padding: 32px; padding-bottom: 50px; -webkit-border-radius: 20px; border-radius: 20px; text-align: center; z-index: 2; } .wp-adminify-white-label-notice-logo img { height: 100px; width: 250px; padding: 10px; padding-top: 10px; } .wp-adminify-white-label-notice-content h2 span{ color: #6814cd; text-transform: uppercase; } .wp-adminify-white-label-notice-content em{ font-size: 13px; color: red; } .wp-adminify-white-label-notice .wp-adminify-get-pro{ background-image: -moz-linear-gradient( 0deg, rgb(223,29,198) 0%, rgb(106,20,209) 100%); background-image: -webkit-linear-gradient( 0deg , rgb(223,29,198) 0%, rgb(106,20,209) 100%); background-image: -ms-linear-gradient( 0deg, rgb(223,29,198) 0%, rgb(106,20,209) 100%); border: none; box-shadow: none; color: #fff; cursor: pointer; font-weight: 700; line-height: 35px; padding: 0 15px; text-transform: uppercase; text-decoration: none; display: inline-block; width: 180px; padding: 5px 15px !important; border-radius: 10px; font-size: 15px; font-weight: 800; -webkit-transition: all 0.2s ease-in-out; transition: all 0.2s ease-in-out; } .wp-adminify-white-label-notice{ position: absolute !important; top: 0; left: 0; width: 100% !important; height: 100%; background: rgba(200, 200, 200, 0.5); -js-display: flex; display: -webkit-box; display: -webkit-flex; display: -moz-box; display: -ms-flexbox; display: flex; -webkit-box-pack: center; -webkit-justify-content: center; -moz-box-pack: center; -ms-flex-pack: center; justify-content: center;z-index: 1; } .wp-adminify-white-label-notice .wp-adminify-get-pro:hover { color:#fff; background-image: -moz-linear-gradient(0deg, rgb(106, 20, 209) 0%, rgb(223, 29, 198) 100%); background-image: -webkit-linear-gradient( 0deg, rgb(106, 20, 209) 0%, rgb(223, 29, 198) 100%); background-image: -ms-linear-gradient(0deg, rgb(106, 20, 209) 0%, rgb(223, 29, 198) 100%);} .adminify-field-callback a.wp-adminify-rollback-button{font-family:inherit !important;} .wp-adminify-rollback-button.dashicons, .wp-adminify-rollback-button.dashicons-before:before{ width: inherit !important;}</style>';
	}

}
