<?php

namespace PXLBSAdminify\Inc\Classes;

use PXLBSAdminify\Inc\Utils;
use PXLBSAdminify\Inc\Admin\AdminSettings;
use PXLBSAdminify\Inc\Modules\MenuEditor\MenuEditorOptions;
// no direct access allowed
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
/**
 * PXLBSAdminify
 * Third Party Plugins Compatibility
 *
 * @author Jewel Theme <support@jeweltheme.com>
 */
class ThirdPartyCompatibility {
    public $menu_settings;

    public function __construct() {
        $this->menu_settings = ( new MenuEditorOptions() )->get();
        add_action( 'init', [$this, 'register_actions_on_init'], 0 );
        add_action( 'admin_init', [$this, 'register_actions_on_admin_init'], 0 );
        // 24-3-24
        add_action( 'admin_enqueue_scripts', [$this, 'reset_theme_conflicts'], 999999 );
        // 28-6-24
        add_action( 'admin_head', [$this, 'plugin_conflicts'], 999999 );
        if ( Utils::is_plugin_active( 'gravityforms/gravityforms.php' ) ) {
            add_filter(
                'update_footer',
                [$this, 'change_admin_footer'],
                9999,
                3
            );
        }
        // All Fluent Plugin Assets Supports
        $this->whitelist_assets_in_fluent_plugins();
    }

    /**
     * Whitelist Adminify assets in Fluent ecosystem no-conflict mode.
     *
     * Fluent Boards, Fluent Booking, Fluent CRM, Fluent Community, Fluent Forms,
     * and Fluent Snippets (easy-code-manager) iterate $wp_scripts->queue on their
     * admin pages and dequeue every plugin script whose src isn't in their approved
     * slug list. Without this whitelist, Adminify's frame-adminify--admin script is
     * stripped, leaving an empty React mount (white screen).
     */
    public function whitelist_assets_in_fluent_plugins() {
        $add_regex = function ( $slugs ) {
            $slugs[] = '\\/adminify\\/';
            return $slugs;
        };
        if ( Utils::is_plugin_active( 'fluent-boards/fluent-boards.php' ) ) {
            add_filter( 'fluent_boards/asset_listed_slugs', $add_regex );
        }
        if ( Utils::is_plugin_active( 'fluent-booking/fluent-booking.php' ) ) {
            add_filter( 'fluent_booking/asset_listed_slugs', $add_regex );
        }
        if ( Utils::is_plugin_active( 'fluent-crm/fluent-crm.php' ) ) {
            add_filter( 'fluent_crm_asset_listed_slugs', $add_regex );
        }
        if ( Utils::is_plugin_active( 'fluent-community/fluent-community.php' ) ) {
            add_filter( 'fluent_community/asset_listed_slugs', $add_regex );
            add_filter( 'fluent_com_editor/asset_listed_slugs', $add_regex );
        }
        if ( Utils::is_plugin_active( 'easy-code-manager/easy-code-manager.php' ) ) {
            add_filter( 'fluent_snippets_asset_listed_slugs', $add_regex );
        }
        if ( Utils::is_plugin_active( 'fluentform/fluentform.php' ) ) {
            add_filter( 'fluentform/exclude_js_slugs_from_dequeue', function ( $slugs ) {
                $slugs[] = 'adminify';
                return $slugs;
            } );
        }
    }

    /**
     * Gravity Form Custom Footer missing div closing support
     */
    public function change_admin_footer( $footer_text ) {
        $current_screen = get_current_screen();
        if ( !empty( $current_screen ) && ($current_screen->id === 'toplevel_page_gf_edit_forms' || $current_screen->id === 'forms_page_gf_new_form') ) {
            return $footer_text . '</div>';
        }
        return $footer_text;
    }

    public function plugin_conflicts() {
        $adminify_ui = AdminSettings::get_instance()->get( 'admin_ui' );
        if ( !empty( $adminify_ui ) ) {
            // Motopress Hotel Booking Lite
            if ( Utils::is_plugin_active( 'motopress-hotel-booking-lite/motopress-hotel-booking.php' ) ) {
                echo '<style>
				.wp-adminify.bookings_page_mphb_calendar .widefat thead th,
				.wp-adminify.bookings_page_mphb_calendar .widefat tfoot th,
				.wp-adminify.bookings_page_mphb_calendar .widefat tbody td {
					padding: 0 !important;
				}
				.adminify-ui .widefat tbody tr td:first-child {
					border-left-color: inherit !important;
				}
				</style>';
            }
            // Fluent Support
            if ( Utils::is_plugin_active( 'fluent-support/fluent-support.php' ) ) {
                echo '<style>
					body.adminify-ui .fs_main_navbar{width:100%;top:0;left:0;}
				</style>';
            }
            // Fluent Affiliate
            if ( Utils::is_plugin_active( 'fluent-affiliate/fluent-affiliate.php' ) ) {
                echo '<style>
					body.adminify-ui #fluent-affiliate-app #fa_aff_menu {top:0;}
				</style>';
            }
            // Fluent Cart
            if ( Utils::is_plugin_active( 'fluent-cart/fluent-cart.php' ) ) {
                echo '<style>
					body.adminify-ui #wpbody-content #fct_admin_menu_holder .fct_admin_menu_wrap {width:100%;top:0;left:0;}
				</style>';
            }
        }
        if ( Utils::is_plugin_active( 'squirrly-seo/squirrly.php' ) ) {
            echo '<style>
            .wp-adminify.adminify-ui.block-editor-page .interface-interface-skeleton {
                top: 0 !important;
            }
            </style>';
        }
        if ( Utils::is_plugin_active( 'surecart/surecart.php' ) || Utils::is_plugin_active( 'suremember/suremember.php' ) ) {
            if ( !empty( $adminify_ui ) ) {
                echo '<style>
							.css-wa3qun,.backdrop-blur-sm {
								top: 0 !important;
							}
							#suremembers-settings-content::before, #sc-settings-content::before{
									width: 250px !important;
							}
						</style>';
            }
        }
        if ( Utils::is_plugin_active( 'advanced-database-cleaner-pro/advanced-db-cleaner.php' ) ) {
            echo '<style>
            .wp-adminify.toplevel_page_advanced_db_cleaner #wpbody-content .wp-list-table.widefat td{
                padding: 10px 10px;
            }
			.wp-adminify.toplevel_page_advanced_db_cleaner #wpbody-content input#aDBc_keep_button_revision {
				padding: 0px 3px !important;
				line-height: inherit !important;
			}
            </style>';
        }
        if ( Utils::is_plugin_active( 'insert-headers-and-footers/ihaf.php' ) ) {
            echo '<style>
            .wp-adminify .wpcode-code-type-picker, .wp-adminify .wpcode-code-type-picker-backdrop {
                left: 0;
            }
            </style>';
        }
        if ( Utils::is_plugin_active( 'advanced-access-manager/aam.php' ) ) {
            add_filter(
                'pxlbsadminify_menu_option_compatibility_filter',
                array($this, 'apply_menu_restrictions_via_filter'),
                10,
                2
            );
        }
        if ( Utils::is_plugin_active( 'meta-box/meta-box.php' ) ) {
            echo '<style>
				.adminify-ui .og.mb {
							left: 0;
					}
				</style>';
        }
        if ( Utils::is_plugin_active( 'wp-security-audit-log/wp-security-audit-log.php' ) ) {
            echo '<script>
				jQuery(document).ready(function($) {
					$("body.wp-adminify.adminify-ui ul.frame-adminify-admin-menu li a .frame-adminify-menu-item-name").find("style").remove();

					setInterval(function() {
						$("body.wp-adminify.adminify-ui ul.frame-adminify-admin-menu li a .frame-adminify-menu-item-name").find("style").remove();
					}, 1000);
				});
			</script>';
        }
        if ( Utils::is_plugin_active( 'shopengine/shopengine.php' ) ) {
            global $pagenow;
            // e.g. "edit.php"
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
            $post_type = ( isset( $_GET['post_type'] ) ? sanitize_key( wp_unslash( $_GET['post_type'] ) ) : '' );
            // Build the slug
            $slug = ( $post_type ? "{$pagenow}?post_type={$post_type}" : $pagenow );
            // Example usage:
            if ( $slug === 'edit.php?post_type=shopengine-template' ) {
                echo '<style>
								#wpfooter {
										position: inherit !important;
										display: flex;
										flex-direction: column-reverse;
								}
						</style>';
            }
        }
        if ( Utils::is_plugin_active( 'breeze/breeze.php' ) ) {
            echo '<script>
				jQuery(document).ready(function($) {
					
					const iframe = document.getElementById("frame-adminify-app--iframe");

					const fileBtn = document.getElementById("adminify-top-menu-breeze-purge-file-group");
					const objectCacheBtn = document.getElementById("adminify-top-menu-breeze-purge-object-cache-group");

					if( fileBtn ) {
						fileBtn.addEventListener("click", function (e) {
							handleClickBreezeBtn("#wp-admin-bar-breeze-purge-file-group");
						});
					}

					if( objectCacheBtn ) {
						objectCacheBtn.addEventListener("click", function (e) {
							handleClickBreezeBtn("#wp-admin-bar-breeze-purge-object-cache-group");
						});
					}

					function handleClickBreezeBtn(selector) {
						try {
							const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
							
							// Find and click the button
							const button = iframeDoc.querySelector(selector);
							if (button) {
								button.click();
							}
						} catch (error) {
							console.error("Cannot access iframe content:", error);
						}
					}
				});
			</script>';
        }
        // Redis Object Cache plugin compatibility
        if ( Utils::is_plugin_active( 'redis-cache/redis-cache.php' ) ) {
            $nonce = wp_create_nonce();
            $ajaxurl = esc_url( admin_url( 'admin-ajax.php' ) );
            $flushingText = __( 'Flushing cache...', 'adminify' );
            echo '<script>
				jQuery(document).ready(function($) {
					const flushBtn = document.getElementById("adminify-top-menu-redis-cache-flush");
					const parentMenu = document.getElementById("adminify-top-menu-redis-cache");

					if (flushBtn) {
						const flushLink = flushBtn.querySelector("a");

						flushBtn.addEventListener("click", async function(e) {
							e.preventDefault();
							e.stopPropagation();

							if (!flushLink) return;

							// Store original text
							const originalText = flushLink.textContent || flushLink.innerText;

							// Close dropdown and show flushing text on parent menu
							const parentLink = parentMenu ? parentMenu.querySelector("a") : null;
							const parentOriginalHTML = parentLink ? parentLink.innerHTML : null;

							if (parentLink) {
								parentLink.innerHTML = "' . esc_js( $flushingText ) . '";
							}

							// Close dropdown
							const dropdown = flushBtn.closest(".adminify-dropdown");
							if (dropdown) {
								dropdown.classList.remove("show");
							}

							try {
								const data = new FormData();
								data.append("action", "roc_flush_cache");
								data.append("nonce", "' . esc_js( $nonce ) . '");

								const response = await fetch("' . esc_url( $ajaxurl ) . '", {
									method: "POST",
									body: data,
								});

								const resultText = await response.text();

								// Show result text
								if (parentLink) {
									parentLink.innerHTML = resultText;
								}

								// Reset to original after 3 seconds
								setTimeout(function() {
									if (parentLink && parentOriginalHTML) {
										parentLink.innerHTML = parentOriginalHTML;
									}
								}, 3000);

							} catch (error) {
								console.error("Object cache could not be flushed:", error);
								// Reset on error
								if (parentLink && parentOriginalHTML) {
									parentLink.innerHTML = parentOriginalHTML;
								}
							}
						});
					}
				});
			</script>';
        }
    }

    public function apply_menu_restrictions_via_filter( $menu_options, $menu ) {
        $aam_options = get_option( 'aam_access_settings', [] );
        if ( is_array( $aam_options ) ) {
            $simplified_aam_option = $this->simplify_aam_menu_restriction( $aam_options );
            $menu_options = $this->update_aam_menu_option( $menu_options, $simplified_aam_option );
        }
        return $menu_options;
    }

    public function simplify_aam_menu_restriction( $aam_option ) {
        $simplified_aam_option = [];
        foreach ( $aam_option['role'] as $role => $aam_role ) {
            if ( !empty( $aam_role['menu'] ) ) {
                foreach ( $aam_role['menu'] as $menu_item => $value ) {
                    if ( !$value ) {
                        continue;
                    }
                    $menu_item = str_replace( 'menu-', '', $menu_item );
                    if ( !isset( $simplified_aam_option[$menu_item] ) ) {
                        $simplified_aam_option[$menu_item] = [];
                    }
                    $simplified_aam_option[$menu_item][] = $role;
                }
            }
        }
        return $simplified_aam_option;
    }

    public function update_aam_menu_option( $menu_options, $simplified_aam_option ) {
        foreach ( $menu_options as $key => $item ) {
            // If this menu item is in restricted list, update hidden_for
            if ( isset( $simplified_aam_option[$key] ) ) {
                if ( !isset( $item['hidden_for'] ) ) {
                    $item['hidden_for'] = [];
                }
                $item['hidden_for'] = array_merge( $item['hidden_for'], $simplified_aam_option[$key] );
                $item['hidden_for'] = array_unique( $item['hidden_for'] );
            }
            // If submenu exists, apply the function recursively
            // if (isset($item['submenu']) && is_array($item['submenu'])) {
            //     $item['submenu'] = update_aam_menu_option($item['submenu'], $simplified_aam_option);
            // }
            $menu_options[$key] = $item;
        }
        return $menu_options;
    }

    public function reset_theme_conflicts() {
        global $pagenow;
        if ( $pagenow == 'wp-login.php' || $pagenow == 'wp-register.php' || $pagenow == 'customize.php' ) {
            return;
        }
        $screen = get_current_screen();
        $theme = wp_get_theme();
        // Neve WordPress Theme
        if ( 'Neve' == $theme->name || 'Neve' == $theme->parent_theme ) {
            wp_enqueue_style(
                'wp-adminify_neve-theme',
                PXLBSADMINIFY_ASSETS . 'css/themes/neve.min.css',
                false,
                PXLBSADMINIFY_VER
            );
        }
        // Phlox WordPress Theme
        if ( 'Phlox' == $theme->name || 'Phlox' == $theme->parent_theme ) {
            echo '<style>
            .wp-adminify.adminify-ui #wpcontent .wp-adminify.adminify-top_bar {
                opacity: 1 !important;
            }
            </style>';
        }
        // Enfold WordPress Theme
        if ( 'Enfold' == $theme->name || 'Enfold' == $theme->parent_theme ) {
            echo '<style>
				.wp-adminify.avia-advanced-editor-enabled #wpadminbar{
					display: none !important;
				}
            </style>';
        }
        // BrightHub theme compatibility fix
        if ( 'BrightHub' == $theme->name || 'BrightHub' == $theme->parent_theme ) {
            echo '<style>
				body.wp-adminify.adminify-ui.wp-theme-brighthub #wpadminbar,
				body.wp-adminify.adminify-ui.wp-theme-brighthub #adminmenumain{
					display: none !important;
				}
				.adminify-toolbar-wrapper .adminify-toolbar ul.adminify-top-menu li.adminify-top-menu-item{
					display: flex;
					width: auto;
					justify-content: center;
					align-items: center;
				}
			</style>';
            echo '<script>
				document.addEventListener("DOMContentLoaded", function() {
					document.documentElement.setAttribute("frame-adminify-app", "true");

					var iframe = document.querySelector(".adminify-frame-wrapper iframe");
					if (iframe) {
						iframe.addEventListener("load", function() {
							try {
								iframe.contentDocument.documentElement.setAttribute("frame-adminify-iframe", "true");
							} catch(e) {
								console.log("Could not access iframe content");
							}
						});

						try {
							if (iframe.contentDocument && iframe.contentDocument.documentElement) {
								iframe.contentDocument.documentElement.setAttribute("frame-adminify-iframe", "true");
							}
						} catch(e) {
							// Cross-origin restrictions might prevent access
						}
					}
				});
				document.addEventListener("DOMContentLoaded", function() {
					var menuItems = document.querySelectorAll(".wp-adminify.adminify-ui .adminify-toolbar-wrapper .adminify-toolbar .adminify-top-menu li");
					menuItems.forEach(function(item) {
						var link = item.querySelector("a");
						var divInLink = item.querySelector("a > div");
						if (link && divInLink) {
							link.textContent = divInLink.textContent;
						}
					});
				});
			</script>';
        }
        // Third Party Plugin CSS Conflict
        // $pxlbsadminify_plugin_conflict_css = '';
        // if (Utils::is_plugin_active('quillforms/quillforms.php')) {
        // $pxlbsadminify_plugin_conflict_css = '//css code here';
        // $pxlbsadminify_plugin_conflict_css = preg_replace('#/\*.*?\*/#s', '', $pxlbsadminify_plugin_conflict_css);
        // $pxlbsadminify_plugin_conflict_css = preg_replace('/\s*([{}|:;,])\s+/', '$1', $pxlbsadminify_plugin_conflict_css);
        // $pxlbsadminify_plugin_conflict_css = preg_replace('/\s\s+(.*)/', '$1', $pxlbsadminify_plugin_conflict_css);
        // }
        // $adminify_ui = AdminSettings::get_instance()->get('admin_ui');
        // if (!empty($adminify_ui)) {
        // wp_add_inline_style('wp-adminify-admin', wp_strip_all_tags($pxlbsadminify_plugin_conflict_css));
        // } else {
        // wp_add_inline_style('wp-adminify-default-ui', wp_strip_all_tags($pxlbsadminify_plugin_conflict_css));
        // }
        if ( Utils::is_plugin_active( 'stackable-ultimate-gutenberg-blocks-premium/plugin.php' ) ) {
            echo '<style>
            .wp-adminify.adminify-ui #wpcontent .wp-adminify.adminify-top_bar {
                opacity: 1 !important;
            }
            </style>';
        }
        if ( Utils::is_plugin_active( 'woocommerce/woocommerce.php' ) ) {
            echo '<style>
			.adminify-ui #woocommerce-embedded-root .woocommerce-layout__header, .adminify-ui .woocommerce-layout .woocommerce-layout__header {
				width: 100%;
				top: 0;
			}
			.adminify-ui #woocommerce-embedded-root .woocommerce-layout__header .woocommerce-layout__header-wrapper, .adminify-ui .woocommerce-layout .woocommerce-layout__header .woocommerce-layout__header-wrapper  {
				margin-right: 1rem;
			}
			body.woocommerce-page #wpwrap #wpcontent,
			body.woocommerce-page.woocommerce_page_wc-admin #wpwrap #wpbody-content {
					overflow-x: unset !important;
					position: unset !important;
			}
            </style>';
        }
        if ( Utils::is_plugin_active( 'tinymce-templates/tinymce-templates.php' ) ) {
            echo '<style>#tinymce-templates-wrap #tinymce-templates-preview { height: 500px !important; }</style>';
        }
        if ( Utils::is_plugin_active( 'elementor/elementor.php' ) ) {
            echo '<style>
                body.wp-adminify-admin-bar.admin-bar .dialog-lightbox-widget {
                    height: calc(100vh - 0px) !important;
                }
                body.wp-adminify-admin-bar.admin-bar #e-admin-top-bar-root{
                    padding-top: 70px !important;
                    width: calc(100% + 20px) !important;
                    margin-left: -20px;
                }
                body.wp-adminify-admin-bar.admin-bar #e-admin-top-bar-root .e-admin-top-bar{
                    padding-left: 20px;
                }

								body.adminify-ui.e-has-sidebar-navigation #wpwrap #wpcontent #editor-one-top-bar > header {
									top: 0!important;
								}
            </style>';
        }
        if ( Utils::is_plugin_active( 'one-click-demo-import/one-click-demo-import.php' ) ) {
            echo '<style>
                .wp-adminify.appearance_page_one-click-demo-import .button-hero {
                    min-height: auto !important;
                }
            </style>';
        }
        if ( Utils::is_plugin_active( 'wpforms-lite/wpforms.php' ) ) {
            if ( Utils::currentpage_id( 'dashboard' ) ) {
                wp_enqueue_style(
                    'wpforms-full',
                    WPFORMS_PLUGIN_URL . 'assets/css/frontend/classic/wpforms-full.css',
                    [],
                    WPFORMS_VERSION
                );
            }
        }
        if ( Utils::is_plugin_active( 'classic-editor/classic-editor.php' ) ) {
            echo '<style>
                #ed_toolbar{
                    width: 100% !important;
                }
                #ed_toolbar #qt_content_dfw{
                    line-height: inherit;
                    padding: 0;
                }
            </style>';
        }
        if ( Utils::is_plugin_active( 'updraftplus/updraftplus.php' ) ) {
            echo '<style>
				.wp-adminify.settings_page_updraftplus input{
					border-radius: 4px !important;
					border: 1px solid #CCC !important;
				}
                .wp-adminify.adminify-dark-mode .updraft_feat_table,
                .wp-adminify.adminify-dark-mode .updraft_feat_table td,
                .wp-adminify.adminify-dark-mode .updraft_next_scheduled_backups_wrapper > div,
                .wp-adminify.adminify-dark-mode .updraft_migrate_widget_module_content{
                    background: inherit;
                }
                .wp-adminify.adminify-dark-mode .updraft_premium_cta,
                .wp-adminify.adminify-dark-mode .updraft_premium_cta__bottom,
                .wp-adminify.adminify-dark-mode .udp-box,
                .wp-adminify.adminify-dark-mode .updraftcentral_cloud_connect,
                .wp-adminify.adminify-dark-mode .updraft_advert_bottom,
                .wp-adminify.adminify-dark-mode #remote-storage-container label{
                    background: #020407;
                }
                .wp-adminify.adminify-dark-mode .expertmode .advanced_settings_container .advanced_settings_menu .advanced_tools_button{
                    color: inherit;
                }
            </style>';
        }
        if ( Utils::is_plugin_active( 'tinymce-advanced/tinymce-advanced.php' ) ) {
            echo '<style>
                .wp-editor-container .mce-container-body .mce-menubar.mce-toolbar{
                    position: initial !important;
                }
                .wp-editor-container .mce-container-body .mce-toolbar-grp .mce-container-body{
                    position: relative !important;
                }
                .wp-editor-container .mce-container-body .mce-toolbar-grp .mce-toolbar.mce-first {
                    padding-right: 0 !important;
                }
                #ed_toolbar{
                    width: 100% !important;
                }
                #ed_toolbar #qt_content_dfw{
                    line-height: inherit;
                    padding: 0;
                }
            </style>';
        }
        if ( Utils::is_plugin_active( 'email-template-customizer-for-woo/email-template-customizer-for-woo.php' ) ) {
            if ( $screen->id === 'edit-viwec_template' ) {
                echo '<style>
								#wpfooter{
									position: relative !important;
									display: flex;
									flex-direction: column-reverse;
								}
							</style>';
            }
        }
        if ( Utils::is_plugin_active( 'woocommerce-orders-tracking/woocommerce-orders-tracking.php' ) ) {
            if ( $screen->id === 'woocommerce_page_wc-orders' ) {
                echo '<style>
								#wpfooter{
									position: relative !important;
									display: block !important;
									flex-direction: column-reverse;
								}
							</style>';
            }
        }
        // Divi Theme - "Edit With Divi" link should reload parent page instead of iframe
        if ( 'Divi' == $theme->name || 'Divi' == $theme->parent_theme ) {
            echo '<script>
				document.addEventListener("DOMContentLoaded", function() {
					var iframe = document.getElementById("frame-adminify-app--iframe");
					if (!iframe) return;

					function handleDiviLinks(iframeDoc) {
						var diviLinks = iframeDoc.querySelectorAll("a[href*=\\"et_fb=1\\"], a.et_pb_toggle_builder_wrapper, a[href*=\\"page=et_divi_options\\"]");
						diviLinks.forEach(function(link) {
							link.addEventListener("click", function(e) {
								e.preventDefault();
								e.stopPropagation();
								window.top.location.href = link.href;
							});
						});
					}

					iframe.addEventListener("load", function() {
						try {
							var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
							handleDiviLinks(iframeDoc);

							var observer = new MutationObserver(function() {
								handleDiviLinks(iframeDoc);
							});
							observer.observe(iframeDoc.body, { childList: true, subtree: true });
						} catch(e) {
							console.log("Divi compatibility: Cannot access iframe content");
						}
					});
				});
			</script>';
            echo '<style>
				#adminify-top-menu-et-builder-shortcode-framework,
				#adminify-top-menu-et-builder-shortcode-framework-loaded,
				#adminify-top-menu-et-builder-shortcode-framework-option,
				#adminify-top-menu-et-builder-shortcode-framework-constant,
				#adminify-top-menu-et-builder-shortcode-framework-hook,
				#adminify-top-menu-et-builder-shortcode-framework-constant-value {
					display: none;
				}
			</style>';
        }
        if ( Utils::is_plugin_active( 'js_composer/js_composer.php' ) ) {
            echo '<style>
				.adminify-ui .vc_dropdown-list-item p{
					color: #fff;
				}
			</style>';
        }
        // Third Party localize script
        wp_localize_script( 'adminify-admin', 'PXLBSADMINIFY_THIRDPARTY', $this->thirdparty_create_js_object() );
    }

    public function thirdparty_create_js_object() {
        // betterlinks menu settings
        $betterlinks = [
            'active' => false,
        ];
        if ( Utils::is_plugin_active( 'betterlinks/betterlinks.php' ) ) {
            if ( is_array( $this->menu_settings ) && array_key_exists( 'betterlinks', $this->menu_settings ) ) {
                $menu_name = ( !empty( $this->menu_settings['betterlinks']['name'] ) ? esc_html( $this->menu_settings['betterlinks']['name'] ) : '' );
                $submenu_manage = ( !empty( $this->menu_settings['betterlinks']['submenu']['betterlinks']['name'] ) ? esc_html( $this->menu_settings['betterlinks']['submenu']['betterlinks']['name'] ) : '' );
                $submenu_name = ( !empty( $this->menu_settings['betterlinks']['submenu']['betterlinks-analytics']['name'] ) ? esc_html( $this->menu_settings['betterlinks']['submenu']['betterlinks-analytics']['name'] ) : '' );
                $submenu_settings = ( !empty( $this->menu_settings['betterlinks']['submenu']['betterlinks-settings']['name'] ) ? esc_html( $this->menu_settings['betterlinks']['submenu']['betterlinks-settings']['name'] ) : '' );
                $betterlinks = [
                    'active'           => true,
                    'menu_name'        => esc_html( $menu_name ),
                    'submenu_manage'   => esc_html( $submenu_manage ),
                    'submenu_name'     => esc_html( $submenu_name ),
                    'submenu_settings' => esc_html( $submenu_settings ),
                ];
            }
        }
        return [
            'ajax_url'     => admin_url( 'admin-ajax.php' ),
            'better_links' => wp_kses_post_deep( $betterlinks ),
        ];
    }

    public function register_actions_on_init() {
        // Brizy Builder
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
        if ( isset( $_REQUEST['brizy-edit-iframe'] ) ) {
            add_filter( 'pxlbsadminify_defer_skip', '__return_true' );
            add_filter( 'pxlbsadminify_skip_removing_dashicons', '__return_true' );
        }
    }

    public function register_actions_on_admin_init() {
        $adminify_ui = AdminSettings::get_instance()->get( 'admin_ui' );
        if ( !empty( $adminify_ui ) ) {
            // Commented On: 24-3-24
            add_action( 'admin_enqueue_scripts', [$this, 'enqueue_scripts'], 999 );
        }
        // Commented On: 10-6-24
        // add_filter('pxlbsadminify_third_party_styles', [$this, 'register_compatability_styles']);
        // Fluent CRM
        add_action( 'fluentcrm_skip_no_conflict', '__return_true' );
        // Fluent FORM
        add_action( 'fluentform_skip_no_conflict', '__return_true' );
    }

    /**
     * Register Third Party Styles
     *
     * @since 1.0.0
     */
    public function register_compatability_styles( $plugin_supports ) {
        if ( !is_array( $plugin_supports ) ) {
            $plugin_supports = [];
        }
        $plugin_dir = PXLBSADMINIFY_ASSETS . 'css/plugins/';
        $plugin_files = list_files( PXLBSADMINIFY_PATH . 'assets/css/plugins/', 1 );
        if ( !empty( $plugin_files ) ) {
            foreach ( $plugin_files as $file ) {
                $plugin_supports[wp_basename( $file, '.min.css' )] = $plugin_dir . wp_basename( $file );
            }
        }
        return $plugin_supports;
    }

    /**
     * Admin Enqueue Third Party Scripts/Styles
     *
     * @return void
     */
    public function enqueue_scripts() {
        $plugin_supports = [];
        $plugin_supports = apply_filters( 'pxlbsadminify_third_party_styles', $plugin_supports );
        // Check Plugin Activated for Site Wide
        if ( is_multisite() ) {
            $active_plugins = get_site_option( 'active_sitewide_plugins' );
            foreach ( $active_plugins as $active_path => $active_plugin ) {
                if ( is_plugin_active_for_network( $active_path ) ) {
                    $string = explode( '/', $active_path );
                    $pluginname = $string[0];
                    if ( isset( $plugin_supports[$pluginname] ) ) {
                        if ( $plugin_supports[$pluginname] != '' ) {
                            wp_register_style(
                                'adminify_site-wide_' . $pluginname . '_css',
                                $plugin_supports[$pluginname],
                                [],
                                PXLBSADMINIFY_VER
                            );
                            wp_enqueue_style( 'adminify_site-wide_' . $pluginname . '_css' );
                        }
                    }
                }
            }
        }
        // Check Plugin Activated for Individual Sites
        $activeplugins = get_option( 'active_plugins' );
        foreach ( $activeplugins as $plugin ) {
            if ( Utils::is_plugin_active( $plugin ) ) {
                $string = explode( '/', $plugin );
                $pluginname = $string[0];
                if ( isset( $plugin_supports[$pluginname] ) ) {
                    if ( $plugin_supports[$pluginname] != '' ) {
                        wp_register_style(
                            'adminify_' . $pluginname . '_css',
                            $plugin_supports[$pluginname],
                            [],
                            PXLBSADMINIFY_VER
                        );
                        wp_enqueue_style( 'adminify_' . $pluginname . '_css' );
                    }
                }
            }
        }
    }

}
