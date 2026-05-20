<?php

namespace PXLBSAdminify\Libs;

// No, Direct access Sir !!!
if (!defined('ABSPATH')) {
    exit;
}

/*
 * Addons global class
 */

if (!class_exists('Addons')) {

    /**
     * Addons Class
     *
     * Jewel Theme <support@jeweltheme.com>
     */
    class Addons
    {
        public $menu_items = [];
        public $plugins_list = [];
        public $sub_menu;
        public $menu_order;


        /**
         * Constructor method
         *
         * @param integer $menu_order .
         * @author Jewel Theme <support@jeweltheme.com>
         */
        public function __construct($menu_order = 70)
        {
            $this->menu_order   = $menu_order;
            $this->menu_items   = $this->menu_items();
            $this->plugins_list = $this->plugins_list();

            $this->includes();

            // Show Addons menu only on network admin for multisite, or on regular admin for single site
            if ( is_multisite() ) {
                add_action('network_admin_menu', array($this, 'admin_menu'), 1000);
            } else {
                add_action('admin_menu', array($this, 'admin_menu'), 1000);
            }
            add_action('wp_ajax_pxlbsadminify_addons_upgrade_plugin', array($this, 'pxlbsadminify_addons_upgrade_plugin'));
            add_action('wp_ajax_pxlbsadminify_addons_activate_plugin', array($this, 'pxlbsadminify_addons_activate_plugin'));
            // Notify the site admin when a renamed legacy addon is detected
            // alongside its replacement. Per WordPress.org plugin guidelines,
            // we must not deactivate or activate plugins automatically; the
            // user has to perform the swap themselves from the Plugins screen.
            add_action('admin_notices', array($this, 'maybe_renamed_addon_notice'));
            add_action( 'rest_api_init', array( $this , 'addons_rest_routes') );
        }

        public function addons_rest_routes() {
            register_rest_route('adminify/v1', '/get-addons-list', array(
                'methods'             => 'GET',
                'callback'            => [$this, 'get_addons_plugins_list'],
                'permission_callback' => [$this, 'check_is_admin_user'],
            ));

            register_rest_route('adminify/v1', '/install-addons', array(
                'methods'             => 'POST',
                'callback'            => [$this, 'install_addons'],
                'permission_callback' => [$this, 'check_verify_nonce_and_permissions'],
            ));
        }

        public function check_is_admin_user() {
            if ( is_multisite() && ! is_super_admin() ) {
                return new \WP_Error('rest_forbidden', __('You are not allowed to access this resource.', 'adminify'), array('status' => 403));
            }
            if ( ! current_user_can('manage_options') ) {
                return new \WP_Error('rest_forbidden', __('You are not allowed to access this resource.', 'adminify'), array('status' => 403));
            }
            return true;
        }

        public function check_verify_nonce_and_permissions() {
            // The install-addons endpoint may both install AND activate
            // addons depending on each addon's current status, so the
            // caller must hold BOTH capabilities. On multisite this also
            // requires super admin.
            if ( is_multisite() && ! is_super_admin() ) {
                return new \WP_Error('rest_forbidden', __('Super admin required.', 'adminify'), array('status' => 403));
            }
            if ( ! current_user_can('install_plugins') ) {
                return new \WP_Error('rest_forbidden', __('You are not allowed to install plugins.', 'adminify'), array('status' => 403));
            }
            if ( ! current_user_can('activate_plugins') ) {
                return new \WP_Error('rest_forbidden', __('You are not allowed to activate plugins.', 'adminify'), array('status' => 403));
            }

            // Nonce check from header. Sanitize and unslash before verifying.
            $nonce = isset($_SERVER['HTTP_X_WP_NONCE'])
                ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_WP_NONCE'] ) )
                : '';
            if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
                return new \WP_Error('rest_cookie_invalid_nonce', __('Invalid nonce.', 'adminify'), array('status' => 403));
            }

            return true;
        }


        public function get_addons_plugins_list() {
            // Fetch the catalogue on demand. This callback only runs on the
            // Add-ons page (a user action), so the remote request is not made on
            // routine admin page loads.
            $plugins = ( method_exists( $this, 'get_adminify_plugins_lists' ) )
                ? (array) $this->get_adminify_plugins_lists()
                : (array) $this->plugins_list;
            unset($plugins['master-addons']);
            $all_plugins = get_plugins();
            $active_plugins = get_option('active_plugins');
            foreach( $plugins as $slug => $plugin){
                foreach ($all_plugins as $plugin_file => $plugin_data) {
                    if (strpos($plugin_file, $slug) !== false) {
                        $plugins[$slug]["status"] = 'installed';

                        if (in_array($plugin_file, $active_plugins)) {
                            $plugins[$slug]["status"] = 'activated';
                        }
                        break;
                    }
                }
                if( !isset($plugins[$slug]["status"])) $plugins[$slug]["status"] = 'not-installed';
    
            }

            return rest_ensure_response($plugins);
            
        }


        public function install_addons( $request ) {
            $addons = $request->get_param('addons');
            if ( empty($addons) || ! is_array($addons) ) {
                return new \WP_Error('no_addons', __('No addons were selected.', 'adminify'), array('status' => 400));
            }

            $plugins_list = $this->get_addons_plugins_list()->data;
            foreach( $addons as $key => $plugin ) {
                $plugin = sanitize_key( $plugin );
                if ( ! isset( $plugins_list[ $plugin ] ) ) {
                    continue;
                }
                if ( $plugins_list[ $plugin ]['status'] === 'activated' ) {
                    continue;
                }
                if ( $plugins_list[ $plugin ]['status'] === 'installed' ) {
                    $this->activate_plugin_by_slug( $plugin );
                    continue;
                }
                $params = [
                    'request_type' => 'rest',
                    'plugin'       => $plugins_list[ $plugin ]['download_link'],
                ];

                $this->pxlbsadminify_addons_upgrade_plugin( $params );
            }

            return rest_ensure_response(['message' => __('Addons processed.', 'adminify'), 'addons' => $addons]);
        }

        function activate_plugin_by_slug($slug) {
            // Activation requires the activate_plugins capability in
            // addition to whatever capability gated the calling endpoint.
            // On multisite, activation must be performed by a super admin.
            if ( is_multisite() && ! is_super_admin() ) {
                return new \WP_Error( 'rest_forbidden', __( 'Super admin required to activate plugins.', 'adminify' ), array( 'status' => 403 ) );
            }
            if ( ! current_user_can( 'activate_plugins' ) ) {
                return new \WP_Error( 'rest_forbidden', __( 'You are not allowed to activate plugins.', 'adminify' ), array( 'status' => 403 ) );
            }

            // Reject any slug containing path separators / traversal so
            // $slug cannot escape WP_PLUGIN_DIR.
            if ( ! is_string( $slug ) || $slug === '' || strpbrk( $slug, "/\\" ) !== false || strpos( $slug, '..' ) !== false ) {
                return new \WP_Error( 'invalid_slug', __( 'Invalid plugin slug.', 'adminify' ), array( 'status' => 400 ) );
            }

            // Slug must be present in the trusted addons list.
            if ( ! array_key_exists( $slug, (array) $this->plugins_list ) ) {
                return new \WP_Error( 'invalid_slug', __( 'Invalid plugin slug.', 'adminify' ), array( 'status' => 400 ) );
            }

            $plugin_path = WP_PLUGIN_DIR . '/' . $slug;

            if ( ! is_dir( $plugin_path ) ) {
                return;
            }

            $installed_plugins = get_plugins( '/' . $slug );
            if ( empty( $installed_plugins ) ) {
                return;
            }

            $plugin_relative_path = $slug . '/' . key( $installed_plugins );

            if ( is_plugin_active( $plugin_relative_path ) ) {
                return;
            }

            activate_plugin( $plugin_relative_path );
        }

        /**
         * Map of legacy addon slugs that have been renamed to a new slug.
         *
         * @return array<string,string>
         */
        protected function renamed_addons_map() {
            return [
                'sidebar-generator/adminify-sidebar-generator.php' => 'adminify-sidebar-generator/adminify-sidebar-generator.php',
            ];
        }

        /**
         * Show a non-blocking admin notice if a legacy (renamed) addon is
         * still installed. We never deactivate or activate plugins on the
         * user's behalf; the notice points them to the Plugins screen so
         * they can perform the swap themselves.
         */
        public function maybe_renamed_addon_notice() {
            if ( ! current_user_can('activate_plugins') ) {
                return;
            }

            $messages = [];

            foreach ($this->renamed_addons_map() as $old_plugin => $new_plugin) {
                $old_exists = file_exists(WP_PLUGIN_DIR . '/' . $old_plugin);
                if ( ! $old_exists ) {
                    continue;
                }

                $messages[] = sprintf(
                    /* translators: 1: old plugin slug, 2: new plugin slug */
                    esc_html__('"%1$s" has been renamed to "%2$s". Please deactivate and remove the old version, then install the new one from the Adminify Addons screen.', 'adminify'),
                    esc_html(dirname($old_plugin)),
                    esc_html(dirname($new_plugin))
                );
            }

            if ( empty($messages) ) {
                return;
            }

            echo '<div class="notice notice-warning"><p><strong>' . esc_html__('Adminify', 'adminify') . ':</strong> ' . esc_html(implode('<br>', $messages)) . '</p></div>';
        }

        /**
         * Includes
         *
         * @author Jewel Theme <support@jeweltheme.com>
         */
        public function includes()
        {
            // wp-load.php must never be required from within a plugin: the
            // plugin already runs inside WordPress. The wp-admin includes
            // below are required for plugin install/upgrade APIs used by
            // this class and are loaded with require_once immediately
            // before the functions from each file are called.
            require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/misc.php';
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
            require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        }

        /**
         * Menu Items
         *
         * @author Jewel Theme <support@jeweltheme.com>
         */
        public function menu_items()
        {
            return array();
        }

        /**
         * Plugins list
         *
         * @author Jewel Theme <support@jeweltheme.com>
         */
        public function plugins_list()
        {
            return array();
        }

        /**
         * Admin submenu
         */
        public function admin_menu()
        {
        }

        /**
         * Render addons plugins body
         */
        public function render_addons_plugins()
        {
?>
            <div class='wp-adminify-addons-wrapper'>
                <?php $this->header(); ?>
                <?php $this->body(); ?>
            </div>
        <?php
        }


        /**
         * Addons License Header Check
         *
         * @return void
         */

        public function addons_check()
        {
            echo '<style>
			#fs_addons .fs-cards-list{ display: flex; }
			#fs_addons .fs-cards-list .fs-card .fs-inner .fs-cta .button{
				top: 112px;
				right: 12px;
				line-height: 26px !important;
				border-radius: 3px !important;
			}</style>';
        }



        /**
         * Header
         */
        public function header()
        {
        ?>
            <div class='wp-adminify-addons-header'>
                <div class='wp-adminify-addons-title'>
                    <h2>
                        <?php echo esc_html__('Add Ons for Adminify', 'adminify'); ?>
                    </h2>
                    <?php $this->addons_check(); ?>
                </div>
                <div class='wp-adminify-addons-menu'>
                    <div class="wp-filter">
                        <ul class="filter-links">
                            <?php
                            $i = 0;

                            foreach ($this->menu_items as $menu) {
                                $class = str_replace(' ', '-', strtolower($menu['key']));
                            ?>
                                <li class="plugin-install-<?php echo esc_attr($class); ?>">
                                    <a href="#" class="<?php echo esc_attr(0 === $i ? 'current' : ''); ?>" data-type="<?php echo esc_attr($menu['key']); ?>"><?php echo esc_html($menu['label']); ?></a>
                                </li>
                            <?php
                                ++$i;
                            }
                            ?>
                        </ul>

                        <form class="search-form wp-adminify-search-plugins mr-0" method="get">
                            <input type="hidden" name="tab" value="search">
                            <label class="screen-reader-text" for="search-plugins">
                                <?php echo esc_html__('Search Plugins', 'adminify'); ?>
                            </label>
                            <input type="search" name="s" id="search-plugins" value="" class="wp-filter-search" placeholder="<?php echo esc_html__('Search plugins...', 'adminify'); ?>">
                            <input type="submit" id="search-submit" class="button hide-if-js" value="<?php echo esc_html__('Search Plugins', 'adminify'); ?>">
                        </form>
                    </div>
                </div>
            </div>
        <?php
        }

        /**
         * Body
         */
        public function body()
        {
        ?>
            <div class="wp-list-table widefat plugin-install">
                <div id="the-list">
                    <?php
                    $this->plugins();
                    ?>
                </div>
            </div>
            <?php
        }

        /**
         * Body
         */
        public function plugins()
        {
            // $this->plugins_list is populated at construction only from the
            // cached catalogue, which is empty until a live fetch runs. The
            // Add-ons page render is itself an explicit user action, so fall
            // back to the bundled catalogue here so the cards always show.
            $plugins_list = $this->plugins_list;

            if ( empty( $plugins_list ) && method_exists( $this, 'get_adminify_plugins_lists' ) ) {
                $plugins_list = (array) $this->get_adminify_plugins_lists();
            }

            foreach ($plugins_list as $key => $plugin) {
                $install_status = \install_plugin_install_status($plugin);
                $classes        = implode(' ', $plugin['type']);

                $more_details = self_admin_url(
                    'plugin-install.php?tab=plugin-information&amp;plugin=' . esc_attr($plugin['slug']) .
                        '&amp;TB_iframe=true&amp;width=600&amp;height=550'
                );

                ?>
                    <div class="plugin-card plugin-card-<?php echo esc_attr($key); ?> <?php echo esc_attr($classes); ?>">
                        <div class="plugin-card-top">
                            <div class="name column-name">
                                <h3>
                                    <a href="<?php echo esc_url($more_details); ?>" class="thickbox open-plugin-details-modal">
                                        <?php echo esc_html($plugin['name']); ?>
                                        <img src="<?php echo esc_url($plugin['icon']); ?>" class="plugin-icon" alt="">
                                    </a>
                                </h3>
                            </div>
                            <div class="desc column-description">
                                <p><?php echo wp_kses_post($plugin['short_description']); ?></p>
                            </div>
                            <!-- Hover Popup -->
                             <?php if( !empty($plugin['pricing_url']) || !empty($plugin['view_details']) ) { ?>
                                <div class="adminify-plugin-details">
                                    <?php if( !empty($plugin['view_details']) ) { ?>
                                        <a href="<?php echo esc_url($plugin['view_details']); ?>" target="_blank" class="adminify-view-details"><?php echo esc_html__('View Details', 'adminify'); ?></a>
                                    <?php } ?>

                                    <?php if( !empty($plugin['pricing_url']) ) { ?>
                                        <a href="<?php echo esc_url($plugin['pricing_url']); ?>" target="_blank"><?php echo esc_html__('Buy Now', 'adminify'); ?></a>
                                    <?php } ?>
                                </div>
                            <?php } ?>
                        </div>
                        <div class="plugin-card-bottom">
                            <div class="column-downloaded">
                                <span class="plugin-status">
                                    <?php
                                    echo esc_html__('Status:', 'adminify');

                                    if ('install' === $install_status['status']) {
                                    ?>
                                        <span class="plugin-status-not-install" data-plugin-url="<?php echo esc_attr($plugin['download_link']); ?>"><?php echo esc_html__('No Installed', 'adminify'); ?></span>
                                        <?php
                                    } elseif ('update_available' === $install_status['status']) {
                                        if (is_plugin_active($install_status['file'])) {
                                        ?>
                                            <span class="plugin-status-active">
                                                <?php echo esc_html__('Active', 'adminify'); ?>
                                            </span>
                                        <?php
                                        } else {
                                        ?>
                                            <span class="plugin-status-inactive" data-plugin-file="<?php echo esc_attr(esc_attr($install_status['file'])); ?>">
                                                <?php echo esc_html__('Inactive', 'adminify'); ?>
                                            </span>
                                        <?php
                                        }
                                    } elseif (('latest_installed' === $install_status['status']) || ('newer_installed' === $install_status['status'])) {
                                        if (is_plugin_active($install_status['file'])) {
                                        ?>
                                            <span class="plugin-status-active">
                                                <?php echo esc_html__('Active', 'adminify'); ?>
                                            </span>
                                        <?php
                                        } elseif (current_user_can('activate_plugin', $install_status['file'])) {
                                        ?>
                                            <span class="plugin-status-inactive" data-plugin-file="<?php echo esc_attr($install_status['file']); ?>">
                                                <?php echo esc_html__('Inactive', 'adminify'); ?>
                                            </span>
                                        <?php
                                        } else {
                                        ?>
                                            <span class="plugin-status-inactive" data-plugin-file="<?php echo esc_attr($install_status['file']); ?>">
                                                <?php echo esc_html__('Inactive', 'adminify'); ?>
                                            </span>
                                    <?php
                                        }
                                    }
                                    ?>
                                </span>
                            </div>
                            <div class="column-compatibility">
                                <ul class="plugin-action-buttons">
                                    <?php
                                    if ('install' === $install_status['status']) {
                                    ?>
                                        <li>
                                            <button class="install-now adminify-btn adminify-btn-outline-primary" data-install-url="<?php echo esc_attr($plugin['download_link']); ?>">
                                                <?php echo esc_html__('Install Now', 'adminify'); ?>
                                            </button>
                                        </li>
                                    <?php
                                    } elseif ('update_available' === $install_status['status']) {
                                    ?>
                                        <li class="mr-0">
                                            <button class="update-now button" data-plugin="<?php echo esc_attr($install_status['file']); ?>" data-slug="<?php echo esc_attr($plugin['slug']); ?>" data-update-url="<?php echo esc_attr($install_status['url']); ?>">
                                                <?php echo esc_html__('Update Now', 'adminify'); ?>
                                            </button>
                                        </li>
                                        <?php
                                    } elseif (('latest_installed' === $install_status['status']) || ('newer_installed' === $install_status['status'])) {
                                        if (is_plugin_active($install_status['file'])) {
                                        ?>
                                            <li class="mr-0">
                                                <button type="button" class="adminify-btn adminify-btn-success" disabled="disabled">
                                                    <?php echo esc_html__('Activated', 'adminify'); ?>
                                                </button>
                                            </li>
                                        <?php
                                        } elseif (current_user_can('activate_plugin', $install_status['file'])) {
                                        ?>
                                            <button class="button activate-now" data-plugin-file="<?php echo esc_attr($install_status['file']); ?>">
                                                <?php echo esc_html__('Activate Now', 'adminify'); ?>
                                            </button>
                                        <?php
                                        } else {
                                        ?>
                                            <li class="mr-0">
                                                <button type="button" class="button button-disabled" disabled="disabled">
                                                    <?php echo esc_html__('Installed', 'adminify'); ?>
                                                </button>
                                            </li>
                                    <?php
                                        }
                                    }
                                    ?>
                                </ul>
                            </div>
                        </div>
                    </div>
                <?php
            }
        }

        /**
         * Activate Plugins
         *
         * @author Jewel Theme <support@jeweltheme.com>
         */
        public function pxlbsadminify_addons_activate_plugin()
        {
            if (empty($_POST['plugin'])) {
                return;
            }
            try {
                $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';

                if (!wp_verify_nonce($nonce, 'pxlbsadminify_addons_nonce')) {
                    wp_send_json_error(array('mess' => __('Nonce is invalid', 'adminify')));
                }

                // Security check - only administrators can activate plugins
                if (!current_user_can('activate_plugins')) {
                    wp_send_json_error(array('mess' => __('You do not have permission to perform this action.', 'adminify')));
                }

                $plugin = sanitize_text_field(wp_unslash($_POST['plugin']));
                $plugin_links = array_values(wp_list_pluck($this->plugins_list, 'slug'));

                if (!in_array(dirname($plugin), $plugin_links, true)) {
                    wp_send_json_error(array('mess' => __('Invalid plugin', 'adminify')));
                }

                // Resolve against the list of actually installed plugins so that
                // only a known plugin file is ever passed to activate_plugin().
                if (!function_exists('get_plugins')) {
                    require_once ABSPATH . 'wp-admin/includes/plugin.php';
                }
                $installed_plugins = array_keys(get_plugins());

                if (!in_array($plugin, $installed_plugins, true)) {
                    wp_send_json_error(array('mess' => __('Invalid plugin', 'adminify')));
                }

                $result = activate_plugin($plugin);

                if (is_wp_error($result)) {
                    wp_send_json_error(
                        array(
                            'mess' => $result->get_error_message(),
                        )
                    );
                }
                wp_send_json_success(
                    array(
                        'mess' => __('Activate success', 'adminify'),
                    )
                );
            } catch (\Exception $ex) {
                wp_send_json_error(
                    array(
                        'mess' => __('Error exception.', 'adminify'),
                        array(
                            'error' => $ex,
                        ),
                    )
                );
            } catch (\Error $ex) {
                wp_send_json_error(
                    array(
                        'mess' => __('Error.', 'adminify'),
                        array(
                            'error' => $ex,
                        ),
                    )
                );
            }
        }

        public function get_the_plugin_slug( $plugin ) {

            // If the plugin is like myplugin/myplugin.php
            if ( ! filter_var($plugin, FILTER_VALIDATE_URL) ) {
                return dirname($plugin);
            }

            // If the plugin is from wordpress.org
            if ( false !== strpos( $plugin, 'https://downloads.wordpress.org/plugin/' ) ) {
                $plugin = str_replace( 'https://downloads.wordpress.org/plugin/', '', $plugin );
                return str_replace( '.zip', '', $plugin );
            }

            // If the plugin is from local store
            $plugin = explode( 'plugin_slug=', $plugin );
            $plugin = explode( '&', $plugin[1] );
            return $plugin[0];
        }

        /**
         * Upgrade Plugins required Libraries
         *
         * @author Jewel Theme <support@jeweltheme.com>
         */
        public function pxlbsadminify_addons_upgrade_plugin( $params = null )
        {
            if ($params == null && empty($_POST['plugin'])) {
                return;
            }

            try {
                require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
                require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
                require_once ABSPATH . 'wp-admin/includes/class-wp-ajax-upgrader-skin.php';
                require_once ABSPATH . 'wp-admin/includes/class-plugin-upgrader.php';

                if($params == null){
                    $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';

                    if (!wp_verify_nonce($nonce, 'pxlbsadminify_addons_nonce')) {
                        wp_send_json_error(array('mess' => __('Nonce is invalid', 'adminify')));
                    }
                    $plugin = sanitize_text_field(wp_unslash($_POST['plugin']));
                }else{
                    $plugin =  $params['plugin'];
                }

                // Security check - only administrators can install plugins
                if (!current_user_can('install_plugins')) {
                    wp_send_json_error(array('mess' => __('You do not have permission to perform this action.', 'adminify')));
                }

                $plugin_slug = $this->get_the_plugin_slug( $plugin );

                if ( ! array_key_exists( $plugin_slug, $this->plugins_list ) ) {
                    wp_send_json_error(array('mess' => __('Invalid plugin', 'adminify')));
                }

                // Replace the user-supplied $plugin value with values derived
                // from our trusted internal addons list, so that arbitrary
                // input never reaches Plugin_Upgrader::install()/upgrade() or
                // activate_plugin().
                $trusted_install_source = isset($this->plugins_list[$plugin_slug]['download_link'])
                    ? $this->plugins_list[$plugin_slug]['download_link']
                    : '';

                if($params == null){
                    $type     = isset($_POST['type']) ? sanitize_text_field(wp_unslash($_POST['type'])) : 'install';
                }else{
                    $type     = 'install';
                }
                $skin     = new \WP_Ajax_Upgrader_Skin();
                $upgrader = new \Plugin_Upgrader($skin);

                if ('install' === $type) {

                    if ( empty( $trusted_install_source ) ) {
                        wp_send_json_error(array('mess' => __('Invalid plugin', 'adminify')));
                    }

                    $result = $upgrader->install( $trusted_install_source );
                    if ($params == null){
                        if (empty($result) || empty($upgrader->result)) {
                            wp_send_json_error(
                                array(
                                    'mess' => 'Something is wrong',
                                )
                            );
                        }

                        if (is_wp_error($result)) {
                            wp_send_json_error(
                                array(
                                    'mess' => $result->get_error_message(),
                                )
                            );
                        }
                    }else{
                        if(empty($result) || empty($upgrader->result)){
                            return;
                        }
                    }

                    $plugins = get_plugins('/' . $upgrader->result['destination_name']);
                    $plugin_data = end($plugins);
                    $plugin_data['slug'] = $upgrader->result['destination_name'];
                    $plugin_data['version'] = $plugin_data['Version'];

                    if (!empty($plugin_data) && !is_wp_error($plugin_data)) {

                        $install_status = \install_plugin_install_status($plugin_data);

                        $active_plugin  = activate_plugin($install_status['file']);
                        
                        if ($params == null){
                            if (is_wp_error($active_plugin)) {
                                wp_send_json_error(
                                    array(
                                        'mess' => $active_plugin->get_error_message(),
                                    )
                                );
                            } else {
                                wp_send_json_success(
                                    array(
                                        'mess' => __('Install success', 'adminify'),
                                    )
                                );
                            }
                        }
                    } else {
                        if ($params == null){
                            wp_send_json_error(
                                array(
                                    'mess' => 'Error',
                                )
                            );

                        }
                    }
                } else {

                    // Resolve the trusted plugin file path from the validated
                    // slug instead of trusting the raw $_POST value, so that
                    // is_plugin_active(), Plugin_Upgrader::upgrade() and
                    // activate_plugin() never receive attacker-supplied paths.
                    $installed_plugins = get_plugins( '/' . $plugin_slug );
                    if ( empty( $installed_plugins ) ) {
                        wp_send_json_error(array('mess' => __('Plugin not installed.', 'adminify')));
                    }
                    $trusted_plugin_file = $plugin_slug . '/' . key( $installed_plugins );

                    $is_active = is_plugin_active( $trusted_plugin_file );
                    $result    = $upgrader->upgrade( $trusted_plugin_file );

                    if ($params == null){
                        if ( empty($result) || is_wp_error($result) ) {
                            wp_send_json_error(
                                array(
                                    'mess' => is_wp_error($result) ? $result->get_error_message() : __('Couldn\'t upgrade', 'adminify')
                                )
                            );
                        }
                    }

                    $active_status = activate_plugin( $trusted_plugin_file );

                    if ($params == null){
                        if ( empty($active_status) || is_wp_error($active_status) ) {
                            wp_send_json_error(
                                array(
                                    'mess' => is_wp_error($result) ? $result->get_error_message() : __('Activation Failed', 'adminify')
                                )
                            );
                        }

                        wp_send_json_success(
                            array(
                                'mess'   => __('Update success', 'adminify'),
                                'active' => true,
                            )
                        );
                    }
                }
                
            } catch (\Exception $ex) {
                if ($params == null){
                    wp_send_json_error(
                        array(
                            'mess' => __('Error exception.', 'adminify'),
                            array(
                                'error' => $ex,
                            ),
                        )
                    );
                }
            }
        }
        
    }
}
