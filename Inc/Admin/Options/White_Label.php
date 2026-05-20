<?php

namespace PXLBSAdminify\Inc\Admin\Options;

use PXLBSAdminify\Inc\Utils;
use PXLBSAdminify\Inc\Admin\AdminSettings;
use PXLBSAdminify\Inc\Admin\AdminSettingsModel;
use PXLBSAdminify\Inc\Classes\AdminFooterText;

if ( ! defined( 'ABSPATH' ) ) {
	die;
} // Cannot access directly.

class White_Label extends AdminSettingsModel {


	public function __construct() {
		$this->white_label_settings();
	}

	public function get_defaults() {
		return [
			'white_label'	=> [
				'wordpress' => [
					'admin_bar_cleanup' => [],
					'remove_howdy_msg'  => false,
					'change_howdy_text' => __('Howdy', 'adminify'),
					'show_footer_credit' => false,
					'footer_text'       => AdminFooterText::get_default_footer_credit(),
					'admin_footer'	=> [
						'ip_address',
						'php_version',
						'wp_version',
						'memory_usage',
						'memory_limit',
						'memory_available'
					],
				],
				'adminify'	=> [
					'plugin_logo'         => [],
					'plugin_logo_dark'    => [],
					'plugin_name'         => \PXLBSAdminify\Inc\Admin\AdminSettings::get_pro_label(),
					'plugin_desc'         => __('Adminify is a powerful plugin that modernizes and customizes your WordPress admin dashboard. It offers a clean, branded interface and advanced menu management features to enhance your admin user experience.', 'adminify'),
					'author_name'         => 'Jewel Theme',
					'menu_label'          => \PXLBSAdminify\Inc\Admin\AdminSettings::get_pro_label(),
					'menu_icon'          => [],
					'plugin_url'          => 'https://wpadminify.com',
					'row_links'           => false,
					'remove_action_links' => false,
					'tab_system_info'     => false,
					'plugin_option'       => false,
				]
			]
		];
	}

	public function pxlbsadminify_wordpress_white_label_fields(&$white_label)
	{
		$admin_bar_items = [
			// 'menu_toggle' => __('Menu Toggle', 'adminify'),
			'wp_logo'     => __('WordPress Logo', 'adminify'),
			'site_name'   => __('Site Name', 'adminify'),
			'comments'    => __('Comments', 'adminify'),
			/* translators: %s: pro upgrade badge HTML */
			'updates'     => sprintf(__('Updates  %s', 'adminify'), Utils::upgrade_pro_class()),
			/* translators: %s: pro upgrade badge HTML */
			'new_content' => sprintf(__('"New" Button %s', 'adminify'), Utils::upgrade_pro_class()),
		];
		$admin_footer_items = [
			'ip_address'       => __('Show IP Address', 'adminify'),
			'php_version'      => __('Show PHP Version', 'adminify'),
			'wp_version'       => __('Show WordPress Version', 'adminify'),
			'memory_usage'     => __('Show Memory Usage', 'adminify'),
			'memory_limit'     => __('Show Memory Limit', 'adminify'),
			'memory_available' => __('Show Memory Available', 'adminify')
		];

		$white_label[] = [
			'id'      => 'white_label_subheading',
			'type'    => 'subheading',
			'content' => Utils::help_urls(
				__('"WordPress" White Label Settings', 'adminify'),
				'https://wpadminify.com/docs/adminify/white-label/wordpress-white-label-features',
				'https://www.youtube.com/watch?v=zDK_MwIcTpc',
				'https://www.facebook.com/groups/jeweltheme',
				\PXLBSAdminify\Inc\Admin\AdminSettings::support_url()
			)
		];


		// Check Admin Bar Editor Plugin Activate
		if (! class_exists('\JewelTheme\AdminBarEditor\AdminBarEditor')) {
			$white_label[] = [
				'id'         => 'remove_howdy_msg',
				'type'       => 'switcher',
				'title'      => __('Remove "Howdy" message?', 'adminify'),
				'subtitle'   => __('Removed Howdy Message entirely.', 'adminify'),
				'text_on'    => __('Yes', 'adminify'),
				'text_off'   => __('No', 'adminify'),
				'text_width' => 80,
				'default'    => $this->get_default_field('white_label')['wordpress']['remove_howdy_msg'],
				'dependency' => ['admin_ui', '==', 'false', 'true'],
			];
			$white_label[] = [
				'id'         => 'change_howdy_text',
				'type'       => 'text',
				'title'      => __('Change "Howdy" Text', 'adminify'),
				'subtitle'   => __('Change your custom "Howdy" Text', 'adminify'),
				'default'    => $this->get_default_field('white_label')['wordpress']['change_howdy_text'],
				'dependency' => ['remove_howdy_msg|admin_ui', '==|==', 'false|false', 'true'],
			];
		}

		$white_label[] = [
			'id'         => 'admin_bar_cleanup',
			'type'       => 'checkbox',
			'inline'     => true,
			'title'      => __('Admin Bar Cleanup', 'adminify'),
			'subtitle'   => __('Remove Unnecessary items from Admin Bar.', 'adminify'),
			'default'    => $this->get_default_field('white_label')['wordpress']['admin_bar_cleanup'],
			'options'    => $admin_bar_items,
			'dependency' => ['admin_ui', '!=', 'true', 'true'],
		];
		$white_label[] = [
			'id'       => 'admin_footer',
			'type'     => 'checkbox',
			'inline'   => true,
			'title'    => __( 'Admin Footer', 'adminify' ),
			'subtitle' => __( 'Admin Footer right side options', 'adminify' ),
			'options'  => $admin_footer_items,
			'default'  => $this->get_default_field('white_label')['wordpress']['admin_footer'],
		];
		$white_label[] = [
			'id'         => 'show_footer_credit',
			'type'       => 'switcher',
			'title'      => __('Show Footer Credit', 'adminify'),
			'subtitle'   => __('Display the default "Developed by / Powered by" credit in the admin footer. Disabled by default; enable to opt in.', 'adminify'),
			'text_on'    => __('Yes', 'adminify'),
			'text_off'   => __('No', 'adminify'),
			'text_width' => 80,
			'default'    => $this->get_default_field('white_label')['wordpress']['show_footer_credit'],
		];
		$white_label[] = [
			'id'            => 'footer_text',
			'type'          => 'wp_editor',
			'title'         => __( 'Admin Footer Text', 'adminify' ),
			'height'        => '100px',
			'media_buttons' => false,
			'tinymce'       => false,
			'subtitle'      => 'Left Side WordPress Admin Footer Text ',
			'default'       => $this->get_default_field( 'white_label')['wordpress']['footer_text' ],
			'dependency'    => ['show_footer_credit', '==', 'true', 'true'],
		];

		$white_label = apply_filters('pxlbsadminify_settings/wp_white_label', $white_label, $this);
	}

	public static function pxlbsadminify_white_label_options(){
		$adminify_options = get_option('pxlbsadminify_settings');
		if( isset($adminify_options['white_label']) && !empty($adminify_options['white_label']) ){
			return $adminify_options['white_label'];
		}else{
			return [];
		}
	}
	/**
	 * White Label Settings: White Label Fields
	 *
	 * @param [type] $white_label
	 *
	 * @return void
	 */
	public function pxlbsadminify_white_label_fields( &$white_label ) {


		$wp_white_label = [];
		$adminify_white_label = [];

		$this->pxlbsadminify_wordpress_white_label_fields($wp_white_label);

		$pxlbsadminify_white_label_options = self::pxlbsadminify_white_label_options();
		$adminify_white_label_plugin_option_enabled = !empty($pxlbsadminify_white_label_options['plugin_option']) ? $pxlbsadminify_white_label_options['plugin_option'] : '';

		if(empty($adminify_white_label_plugin_option_enabled)){
			$this->pxlbsadminify_adminify_white_label_fields($adminify_white_label);
		}

		$white_label[] = [
			'id'     => 'white_label',
			'type'   => 'fieldset',
			'class'  => 'adminify-one-col adminify-pl-0',
			'fields' => [
				[
					'id'     => 'wordpress',
					'type'   => 'fieldset',
					'class'  => 'adminify-one-col adminify-pl-0',
					'fields' => $wp_white_label
				],
				[
					'id'     => 'adminify',
					'type'   => 'fieldset',
					'class'  => 'adminify-one-col adminify-pl-0',
					'fields' => $adminify_white_label
				]
			],
			'default' => $this->get_default_field('white_label')
		];
	}

	/**
	 * White Label Settings: White Label Fields
	 *
	 * @param [type] $white_label
	 *
	 * @return void
	 */
	public function pxlbsadminify_adminify_white_label_fields( &$adminify_whl_fields ) {

		$adminify_white_label_class = 'adminify-white-label adminify-pro-feature adminify-pro-notice';

		$adminify_whl_fields[] = [
			'id'      => 'adminify_whl_sub_heading',
			'type'    => 'subheading',
			'class'   => 'adminify-mt-10 adminify-agency-plan',
			'content' => Utils::help_urls(
				/* translators: %s: pro plan badge HTML */
				'<span>' . sprintf( __('"Adminify" Branding %s', 'adminify'), Utils::upgrade_pro_badge('Agency or Higher Plan Only')) . '</span>',
				'https://wpadminify.com/docs/adminify/white-label/rebrand-wp-adminify-plugin',
				'https://www.youtube.com/watch?v=zDK_MwIcTpc',
				'https://www.facebook.com/groups/jeweltheme',
				\PXLBSAdminify\Inc\Admin\AdminSettings::support_url()
			),
			'dependency' => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'           => 'plugin_logo',
			'type'         => 'media',
			'class'        => $adminify_white_label_class . ' adminify-pro-pointer',
			'title'        => __('Light Logo', 'adminify'),
			'library'      => 'image',
			'preview_size' => 'thumbnail',
			'button_title' => __(
				'Add Logo Image',
				'adminify'
			),
			'remove_title' => __('Remove Logo Image', 'adminify'),
			'default'      => $this->get_default_field( 'white_label')['adminify']['plugin_logo'],
			'dependency'   => ['admin_ui_mode', '==', 'light', 'true'],
			'dependency'   => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'           => 'plugin_logo_dark',
			'type'         => 'media',
			'class'        => $adminify_white_label_class . ' adminify-pro-pointer',
			'title'        => __('Dark Logo ', 'adminify'),
			'library'      => 'image',
			'preview_size' => 'thumbnail',
			'button_title' => __('Add Logo Image', 'adminify'),
			'remove_title' => __('Remove Logo Image', 'adminify'),
			'default'      => $this->get_default_field('white_label')['adminify']['plugin_logo_dark'],
			'dependency'   => ['admin_ui_mode', '==', 'dark', 'true'],
			'dependency'   => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'         => 'plugin_name',
			'type'       => 'text',
			'class'      => $adminify_white_label_class . ' adminify-pro-pointer',
			'title'      => __('Plugin Name', 'adminify'),
			'default'    => $this->get_default_field('white_label')['adminify']['plugin_name'],
			'dependency' => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'         => 'plugin_desc',
			'type'       => 'textarea',
			'class'      => $adminify_white_label_class . ' adminify-pro-pointer',
			'title'      => __('Plugin Description', 'adminify'),
			'default'    => $this->get_default_field('white_label')['adminify']['plugin_desc'],
			'dependency' => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'      => 'author_name',
			'type'    => 'text',
			'class'   => $adminify_white_label_class . ' adminify-pro-pointer',
			'title'   => __('Developer/Agency Name', 'adminify'),
			'default' => $this->get_default_field('white_label')['adminify']['author_name'],
			'dependency' => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'      => 'menu_label',
			'type'    => 'text',
			'class'   => $adminify_white_label_class . ' adminify-pro-pointer',
			'title'   => __('Menu Label', 'adminify'),
			'default' => $this->get_default_field('white_label')['adminify']['menu_label'],
			'dependency' => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'           => 'menu_icon',
			'type'         => 'media',
			'class'        => $adminify_white_label_class . ' adminify-pro-pointer',
			'title'        => __('Menu Icon ', 'adminify'),
			'library'      => 'image',
			'preview_size' => 'thumbnail',
			'button_title' => __('Add Menu Icon', 'adminify'),
			'remove_title' => __('Remove Menu Icon', 'adminify'),
			'default'      => $this->get_default_field('white_label')['adminify']['menu_icon'],
			'dependency' => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'      => 'plugin_url',
			'type'    => 'text',
			'class'   => $adminify_white_label_class . ' adminify-pro-pointer',
			'title'   => __(
				'Plugin URL',
				'adminify'
			),
			'default' => $this->get_default_field('white_label')['adminify']['plugin_url'],
			'dependency' => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'         => 'row_links',
			'title'      => __('Hide All Row Meta Links', 'adminify'),
			'subtitle'   => __('All Plugin Meta Links will be removed - Upgrade, Settings etc', 'adminify'),
			'type'       => 'switcher',
			'class'      => $adminify_white_label_class . ' adminify-pro-pointer',
			'text_on'    => __('Yes', 'adminify'),
			'text_off'   => __('No', 'adminify'),
			'text_width' => 80,
			'default'    => $this->get_default_field('white_label')['adminify']['row_links'],
			'dependency' => ['plugin_option', '==', 'false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'      => 'remove_action_links',
			'title'   => __('Remove Action Links', 'adminify'),
			'type'    => 'checkbox',
			'inline'  => true,
			'class'   => $adminify_white_label_class . ' adminify-pro-pointer',
			'options' => [
				'upgrade'          => __('Upgrade', 'adminify'),
				'activate_license' => __('Activate/Change License', 'adminify'),
				// 'opt_in_out'       => __('Opt In/Out', 'adminify'),
				'settings'         => __('Settings', 'adminify'),
				'account'          => __('Account', 'adminify'),
			],
			'default'    => $this->get_default_field('white_label')['adminify']['remove_action_links'],
			'dependency' => ['row_links|plugin_option', '==|==', 'false|false', 'true'],
		];
		$adminify_whl_fields[] = [
			'id'      => 'plugin_option',
			'type'    => 'checkbox',
			'class'   => $adminify_white_label_class . ' adminify-full-width-field adminify-hightlight-field adminify-one-col adminify-mt-6 adminify-pro-pointer',
			'label'   => __('Force Disable White Label (Adminify): When enabled, the White Label settings will be completely hidden. To access them again, you\'ll need to deactivate and reactivate Adminify Plugin.', 'adminify'),
			'default' => $this->get_default_field('white_label')['adminify']['plugin_option'],
		];

		$adminify_whl_fields = apply_filters('pxlbsadminify_settings/adminify_white_label', $adminify_whl_fields, $this);
	}


	/*
	White Label Settings
	*/
	public function white_label_settings() {
		if ( ! class_exists( 'ADMINIFY' ) ) {
			return;
		}

		$fields = [];
		$this->pxlbsadminify_white_label_fields($fields);

		\ADMINIFY::createSection(
			$this->prefix,
			[
				'title'  => __( 'White Label', 'adminify' ),
				'id'     => 'white_label',
				'icon'   => 'far fa-copyright',
				'fields' => $fields,
			]
		);
	}
}
