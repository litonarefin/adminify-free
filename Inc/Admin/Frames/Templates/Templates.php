<?php

namespace PXLBSAdminify\Inc\Admin\Frames\Templates;
use PXLBSAdminify\Inc\Admin\AdminSettings;

// no direct access allowed
if (!defined('ABSPATH')) {
    exit;
}

$pxlbsadminify_favicon = '';
if( function_exists('get_site_icon_url') ) {
    $pxlbsadminify_favicon = get_site_icon_url();
}
$pxlbsadminify_favicon = apply_filters('pxlbsadminify/frame/favicon', $pxlbsadminify_favicon); // Apply favicon filter

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel='shortcut icon' href='<?php echo esc_url($pxlbsadminify_favicon) ?>' type='image/x-icon' />
</head>
<body>
    <div id="frame-adminify-app" class="frame-adminify-app"></div>
</body>
</html>
