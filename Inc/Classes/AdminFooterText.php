<?php

namespace PXLBSAdminify\Inc\Classes;

use PXLBSAdminify\Inc\Classes\ServerInfo;
use PXLBSAdminify\Inc\Admin\AdminSettings;
use PXLBSAdminify\Inc\Admin\AdminSettingsModel;


// no direct access allowed.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Admin footer text
 *
 * @package WP Adminify
 * @author: Jewel Theme<support@jeweltheme.com>
 */
class AdminFooterText extends AdminSettingsModel
{
	/**
	 * Server Info
	 *
	 * @var $server_info
	 */
	public $server_info;

	/**
	 * Default admin_footer_text value supplied by WordPress core.
	 *
	 * Captured via the admin_footer_text filter at an early priority before
	 * the plugin overrides it, so the standard "Thank you for creating with
	 * WordPress." string can be rendered when the credit option is disabled
	 * without hardcoding a copy of that string in the plugin.
	 *
	 * @var string
	 */
	protected static $wp_default_footer_text = '';

	/**
	 * Constructor
	 */
	public function __construct()
	{

        $this->options = (array) AdminSettings::get_instance()->get();
        $this->options = !empty($this->options['white_label']['wordpress']['admin_footer']) ? $this->options['white_label']['wordpress']['admin_footer'] : '';

		// Remove Admin Footer Version Number
		if (!empty($this->options) && in_array('wp_version', $this->options)) {
			add_action('admin_menu', [$this, 'remove_admin_footer_version']);
		}

		add_action('admin_menu', [$this, 'footer_version_remove']);
		add_action('network_admin_menu', [$this, 'footer_version_remove']);
		/** Admin Footer */
		add_filter('update_footer', [$this, 'change_admin_footer'], 10, 3);

		// Capture WordPress core's default admin_footer_text before
		// suppressing it, so we can re-render it when the plugin's
		// "Show Footer Credit" option is disabled.
		add_filter('admin_footer_text', [$this, 'capture_wp_default_footer_text'], 1);

		add_filter( 'admin_footer_text', '__return_false', 999 );
		add_filter( 'update_footer', '__return_false', 999 );

		$this->server_info = new ServerInfo();
	}

	/**
	 * Capture the default admin footer text WordPress passes into the
	 * admin_footer_text filter, then return it unchanged.
	 *
	 * @param string $text
	 * @return string
	 */
	public function capture_wp_default_footer_text($text)
	{
		if (is_string($text) && $text !== '') {
			self::$wp_default_footer_text = $text;
		}
		return $text;
	}



	/**
	 * Remove WordPress version
	 *
	 * @return void
	 */
	public function remove_admin_footer_version()
	{
		// Remove WordPress Version except Admin
		if (!current_user_can('manage_options')) {
			remove_filter('update_footer', 'core_update_footer');
		}
	}


	// function footer_get_options()
	// {
	// 	$objects = isset($this->options) && is_array($this->options) ? $this->options : [];
	// 	return $objects;
	// }

	public function footer_version_remove()
	{
		remove_filter('update_footer', 'core_update_footer');
	}

	/**
	 * Default footer credit markup.
	 *
	 * Single source of truth for the "Developed by / Powered by" string,
	 * used both as the default value of the white-label footer text option
	 * and as the rendered fallback when the option is empty.
	 *
	 * @return string
	 */
	public static function get_default_footer_credit()
	{
		return sprintf(
			/* translators: 1: WP Adminify website URL, 2: Plugin label, 3: WordPress.org URL */
			__('<p>Developed by <a href="%1$s" target="_blank" title="Adminify by Jewel Theme">%2$s</a></p> <p>Powered by <a target="_blank" href="%3$s">WordPress</a></p>', 'adminify'),
			esc_url('https://wpadminify.com/'),
			AdminSettings::get_pro_label(),
			esc_url('https://wordpress.org/')
		);
	}

	/** Footer Credits */
	public function footer_credits()
	{ ?>
		<div class="adminify-copyright">
			<?php echo wp_kses_post(self::get_default_footer_credit()); ?>
		</div>
		<?php
	}


	public function change_admin_footer_text()
	{
		$footer_text = (array) AdminSettings::get_instance()->get();

		// Attribution is opt-in only. When the site admin has not enabled
		// the "Show Footer Credit" option, fall back to the standard
		// WordPress admin footer text instead of plugin credits.
		$show_credit = !empty($footer_text['white_label']['wordpress']['show_footer_credit']);
		if (!$show_credit) {
			$wp_default = self::$wp_default_footer_text;
			if ($wp_default === '') {
				return;
			}
			?>
			<div class="adminify-footer-left">
				<?php echo wp_kses_post($wp_default); ?>
			</div>
			<?php
			return;
		}

		if (!empty($footer_text['white_label']['wordpress']['footer_text'])) { ?>
			<div class="adminify-footer-left">
				<?php echo wp_kses_post($footer_text['white_label']['wordpress']['footer_text']); ?>
			</div>
			<?php
			return;
		}

		// Change the content of the left admin footer text.
		apply_filters('pxlbsadminify_footer_credits', $this->footer_credits());
	}



	/**
	 * IP Address
	 */
	public function ip_address() { ?>
		<div class="adminify-system-info">
			<?php
				if (is_rtl()) {
					echo sprintf(
						wp_kses_post('<span>%2$s</span><span>%1$s</span>'),
						esc_html__('IP: ', 'adminify'),
						esc_html($this->server_info->get_ip_address())
					);
				} else {
					echo sprintf(
						wp_kses_post('<span>%1$s</span><span>%2$s</span>'),
						esc_html__('IP: ', 'adminify'),
						esc_html($this->server_info->get_ip_address())
					);
				}
			?>
		</div>
	<?php
	}


	/**
	 * PHP Version
	 */
	public function php_version() { ?>
		<div class="adminify-system-info">
			<?php
				if (is_rtl()) {
					echo sprintf(
						'<span>%2$s</span><span>%1$s</span>',
						esc_html__('PHP: ', 'adminify'),
						esc_html($this->server_info->get_php_version_lite())
					);
				} else {
					echo sprintf(
						'<span>%1$s</span><span>%2$s</span>',
						esc_html__('PHP: ', 'adminify'),
						esc_html($this->server_info->get_php_version_lite())
					);
				}
			?>
		</div>
	<?php
	}

	/**
	 * WordPress Version
	 */
	public function default_wp_version() { ?>
		<div class="adminify-system-info">
			<?php
				if (is_rtl()) {
					echo sprintf(
						'<span>%2$s</span><span>%1$s</span>',
						esc_html__('WordPress: v', 'adminify'),
						esc_html($this->server_info->get_wp_version())
					);
				} else {
					echo sprintf(
						'<span>%1$s</span><span>%2$s</span>',
						esc_html__('WordPress: v', 'adminify'),
						esc_html($this->server_info->get_wp_version())
					);
				}
			?>
		</div>
	<?php
	}

	/**
	 * Memory Usage
	 */
	public function memory_usage() {
		$memory_usage        = $this->server_info->get_wp_memory_usage();
		$memory_limit        = $memory_usage['MemLimitFormat'];
		$memory_usage_format = $memory_usage['MemUsageFormat'];
		// $memory_usage_percentage = $memory_usage['MemUsageCalc'];
		$memory_usage_percentage = ServerInfo::memory_usage_percentage();

		if ($memory_usage_percentage <= 65) {
			$memory_status = '#00BA88';
		} elseif ($memory_usage_percentage > 65 && $memory_usage_percentage < 85) {
			$memory_status = '#ffe08a';
		} elseif ($memory_usage_percentage > 85) {
			$memory_status = '#f14668';
		} ?>
		<div class="adminify-system-info">
			<?php
				if (is_rtl()) {
					echo sprintf(
						wp_kses_post('<span>%2$s of %3$s <span class="adminify-info-status" style="background:%4$s">%5$s</span></span><span>%1$s</span>'),
						esc_html__('WP Memory Usage: ', 'adminify'),
						esc_html($memory_usage_format),
						esc_html($memory_limit),
						esc_html($memory_status),
						esc_html($memory_usage_percentage) . '%'
					);
				} else {
					echo sprintf(
						wp_kses_post('<span>%1$s</span><span>%2$s of %3$s <span class="adminify-info-status" style="background:%4$s">%5$s</span></span>'),
						esc_html__('WP Memory Usage: ', 'adminify'),
						esc_html($memory_usage_format),
						esc_html($memory_limit),
						esc_html($memory_status),
						esc_html($memory_usage_percentage) . '%'
					);
				}
			?>
			</span>
		</div>
	<?php
	}

	/**
	 * Memory Limit
	 */
	public function memory_limit() {
		$memory_limit = $this->server_info->get_wp_memory_usage();

		$memory_limit = $memory_limit['MemLimitFormat']; ?>

		<div class="adminify-system-info">
			<?php
			if (is_rtl()) {
				echo sprintf(
					'<span>%2$s</span><span>%1$s</span>',
					esc_html__('WP Memory Limit: ', 'adminify'),
					esc_html($memory_limit)
				);
			} else {
				echo sprintf(
					'<span>%1$s</span><span>%2$s</span>',
					esc_html__('WP Memory Limit: ', 'adminify'),
					esc_html($memory_limit)
				);
			}
			?>
		</div>
	<?php
	}


	/**
	 * Memory Limit
	 */
	public function memory_available() {
		$memory_available = $this->server_info->get_wp_memory_usage();
		$memory_available = rtrim($memory_available['MemLimitGet'], 'MB') - rtrim($memory_available['MemUsageFormat'], 'MB'); ?>

		<div class="adminify-system-info">
			<?php
			if (is_rtl()) {
				echo sprintf(
					'<span>%2$s</span><span>%1$s</span>',
					esc_html__('WP Memory Available: ', 'adminify'),
					esc_html($memory_available)
				);
			} else {
				echo sprintf(
					'<span>%1$s</span><span>%2$s</span>',
					esc_html__('WP Memory Available: ', 'adminify'),
					esc_html($memory_available)
				);
			}
			?>MB
		</div>
	<?php
	}


	/** Admin Footer Text **/
	public function change_admin_footer($footer_text) { ?>

		<div class="adminify--footer">
			<?php $this->change_admin_footer_text();
			if ( !empty($this->options) ) { ?>

				<div class="adminify-footer-right">
					<div class="adminify-system-info-col">
						<?php
							if ( in_array('ip_address', $this->options ) ) {
								$this->ip_address();
							}

							if ( in_array('php_version', $this->options ) ) {
								$this->php_version();
							}

							if ( in_array('wp_version', $this->options ) ) {
								$this->default_wp_version();
							}
						?>
					</div>
					<div class="adminify-system-info-col">
						<?php
							if ( in_array('memory_usage', $this->options ) ) {
								$this->memory_usage();
							}

							if ( in_array('memory_limit', $this->options ) ) {
								$this->memory_limit();
							}

							if ( in_array('memory_available', $this->options ) ) {
								$this->memory_available();
							}
						?>
					</div>
				</div>
				<?php return $footer_text;
			} ?>
		</div>
		<?php
		// Nothing, return blank
		return '';
	}
}
