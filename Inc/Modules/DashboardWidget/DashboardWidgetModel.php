<?php

namespace PXLBSAdminify\Inc\Modules\DashboardWidget;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

use PXLBSAdminify\Inc\Base_Model;

abstract class DashboardWidgetModel extends Base_Model {

	protected $prefix = 'pxlbsadminify_dasboard_widgets';
}
