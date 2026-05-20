<?php

namespace PXLBSAdminify\Inc\Modules\MenuEditor;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

use PXLBSAdminify\Inc\Base_Model;

abstract class MenuEditorModel extends Base_Model {

	protected $prefix = 'pxlbsadminify_menu_settings';
}
