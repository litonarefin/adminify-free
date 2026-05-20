<?php

namespace PXLBSAdminify\Inc\Modules\DismissNotices;

use PXLBSAdminify\Inc\Admin\AdminSettings;
use PXLBSAdminify\Inc\Admin\AdminSettingsModel;


// no direct access allowed
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WP Adminify
 * Module: Dismiss Admin Notices
 *
 * @author Jewel Theme <support@jeweltheme.com>
 */

if ( ! class_exists( 'Dismiss_Admin_Notices' ) ) {
	/**
	 * Base class for the Dismiss Admin Notices module. The free build
	 * has no admin-notice handlers of its own — every concrete handler
	 * (welcome_panel, php_nag, core/plugin/theme update notices,
	 * site_health, and the hide-notices stack) lives in
	 * Pro/Classes/DismissNotice_Pro.php which extends this class.
	 *
	 * Kept as an empty base so DismissNotice_Pro continues to extend
	 * a known free-side class.
	 */
	class Dismiss_Admin_Notices extends AdminSettingsModel {
		public function __construct() {
			$this->options = (array) AdminSettings::get_instance()->get();
		}
	}
}
