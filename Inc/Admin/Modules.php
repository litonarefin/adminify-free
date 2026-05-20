<?php

namespace PXLBSAdminify\Inc\Admin;

use PXLBSAdminify\Inc\Utils;
use \PXLBSAdminify\Inc\Admin\AdminSettings;
use \PXLBSAdminify\Inc\Admin\AdminSettingsModel;
use \PXLBSAdminify\Inc\Modules\MenuEditor\MenuEditor;
use \PXLBSAdminify\Inc\Modules\MenuDuplicator\MenuDuplicator;
use \PXLBSAdminify\Inc\Modules\PostDuplicator\PostDuplicator;
use \PXLBSAdminify\Inc\Modules\PostTypesOrder\PostTypesOrder;
use \PXLBSAdminify\Inc\Modules\Folders\Folders;
use \PXLBSAdminify\Inc\Modules\DisableComments\DisableComments;
use \PXLBSAdminify\Inc\Modules\ServerInformation\ServerInformation;
use \PXLBSAdminify\Inc\Modules\DismissNotices\Dismiss_Admin_Notices;
use \PXLBSAdminify\Inc\Modules\DashboardWidget\DashboardWidget;
use PXLBSAdminify\Inc\Admin\Options\RollbackVersion;

// no direct access allowed
if (!defined('ABSPATH')) {
	exit;
}
/**
 * WP Adminify
 *
 * @package Modules
 *
 * @author Jewel Theme <support@jeweltheme.com>
 */

class Modules extends AdminSettingsModel
{

	public function __construct()
	{
		$this->modules_init();
	}


	/**
	 * Include Moduels
	 *
	 * @return void
	 */
	public function modules_init()
	{
		$this->options = AdminSettings::get_instance()->get();

		new Dismiss_Admin_Notices();

		if (!empty($this->options['folders']['enable_folders'])) {
			new Folders();
		}

		if (!empty($this->options['post_duplicator']['enable_post_duplicator'])) {
			new PostDuplicator();
		}

		if (!empty($this->options['menu_duplicator'])) {
			new MenuDuplicator();
		}

		if (!empty($this->options['post_types_order']['enable_pto'])) {
			new PostTypesOrder();
		}

		if (!empty($this->options['disable_comments']['enable_disable_comments'] ) ) {
			new DisableComments();
		}

		if (!empty($this->options['dashboard_widgets'])) {
			new DashboardWidget();
		}

		// new ServerInformation();

		MenuEditor::get_instance();

		// TO DO: Turned Off for future release, after making Network Options stable
		// if (Utils::check_modules($this->options['server_info'])) {
		// new RollbackVersion();
		// }
	}
}
