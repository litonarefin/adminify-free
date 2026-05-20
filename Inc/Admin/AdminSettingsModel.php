<?php

namespace PXLBSAdminify\Inc\Admin;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

use PXLBSAdminify\Inc\Base_Model;

abstract class AdminSettingsModel extends Base_Model
{
	public $options = [];
	protected $prefix = 'pxlbsadminify_settings';
	// protected $prefix = 'pxlbsadminify_settings_backup';
}
