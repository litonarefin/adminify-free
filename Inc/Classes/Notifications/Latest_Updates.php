<?php

namespace PXLBSAdminify\Inc\Classes\Notifications;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

use PXLBSAdminify\Inc\Classes\Notifications\Model\Notice;

if (!class_exists('Latest_Updates')) {
	/**
	 * Latest Pugin Updates Notice Class
	 *
	 * Jewel Theme <support@jeweltheme.com>
	 */
	class Latest_Updates extends Notice
	{
		public $type  = 'notice';
		public $color = 'info';

		/**
		 * Check if we're on the WP Adminify settings page
		 *
		 * @return bool
		 */
		private function is_adminify_settings_page() {
			global $pagenow;
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
			return is_admin() && $pagenow === 'admin.php' && isset( $_GET['page'] ) && $_GET['page'] === 'wp-adminify-settings';
		}

		/**
		 * Latest Updates Notice
		 *
		 * @return void
		 */
		public function __construct()
		{
			parent::__construct();
			if(is_admin()){
				// TODO: Need to check about conflicts with other plugins
        // add_action( 'admin_footer', array( $this, 'pxlbsadminify_handle_plugin_update_notice_dismiss' ),99999 );
				add_action( 'wp_ajax_pxlbsadminify_plugin_update_info', array( $this, 'pxlbsadminify_plugin_update_info' ) );
      }
		}

		/**
		 * Handles the AJAX request for the plugin update info notice dismissal.
		 *
		 * Triggered when the user clicks the Dismiss button in the notice.
		 *
		 * @since 1.0
		 *
		 * @return void
		 */
		public function pxlbsadminify_plugin_update_info() {
			if (!current_user_can('install_plugins')) {
				return;
			}

			// Verify nonce for security.
			check_ajax_referer( 'dismiss_notice_nonce', 'nonce' );

			$action_type = isset( $_POST['action_type'] ) ? sanitize_text_field( wp_unslash( $_POST['action_type'] ) ) : 'dismiss';
			$option_value = ( 'forever' === $action_type ) ? 'forever' : 'dismissed';

			wp_send_json_success( array( 'message' => 'Notice dismissed.', 'data' => update_option('pxlbsadminify_plugin_update_info_notice', $option_value ) ) );
		}


		/**
		 * Notice Content
		 *
		 * @author Jewel Theme <support@jeweltheme.com>
		 */
		public function notice_content()
		{
			if ( ! $this->is_adminify_settings_page() ) {
				return;
			}

			$forever_notice = get_option('pxlbsadminify_plugin_update_info_notice', true );
			if( 'forever' === $forever_notice ){
				return;
			}

			if("dismissed" !== $forever_notice){
				$pxlbsadminify_changelog_message = sprintf(
					/* translators: %1$s: changelogs page URL. %2$s: link anchor text. %3$s: plugin update heading HTML. %4$s, %5$s, %6$s, %7$s %8$s %9$s %10$s %11$s: changelog list item HTML. */
					__('%3$s %4$s <br> <strong>Check Changelogs for </strong> <a href="%1$s" target="__blank">%2$s</a>', 'adminify'),
					esc_url_raw('https://wpadminify.com/changelogs'),
					__('More about Updates ', 'adminify'),
					/** Changelog Items
					 * Starts from: %3$s
					 */

					'<h3 class="adminify-update-head">' . PXLBSADMINIFY . ' <span><small><em>v' . esc_html(PXLBSADMINIFY_VER) . '</em></small>' . __(' has some updates..', 'adminify') . '</span></h3><br>', // %3$s
					// changelogs
					__('<span class="dashicons dashicons-yes"></span> <span class="adminify-changes-list"> <strong>Fixed:</strong> Admin Bar Editor with Adminify UI white screen issue fixed. </span><br>', 'adminify'),
				);
				printf(wp_kses_post($pxlbsadminify_changelog_message));
			}

			$this->pxlbsadminify_handle_plugin_update_notice_dismiss();
		}

		/**
		 * Notice Header
		 *
		 * @author Jewel Theme <support@jeweltheme.com>
		 */
		public function notice_header() {
			if ( ! $this->is_adminify_settings_page() ) {
				echo '<div class="wp-adminify-notice-hidden" style="display:none;"><div>';
				return;
			}

			$notice_status = get_option('pxlbsadminify_plugin_update_info_notice', true );
			if ( 'forever' === $notice_status ) {
				echo '<div class="wp-adminify-notice-hidden" style="display:none;"><div>';
				return;
			}

			if("dismissed" !== $notice_status){
				$border_colors = array(
					'info'    => '#72aee6',
					'success' => '#00a32a',
					'warning' => '#dba617',
					'error'   => '#d63638',
				);
				$border_color = isset( $border_colors[ $this->color ] ) ? $border_colors[ $this->color ] : $border_colors['info'];
				?>
				<div class="wp-adminify-notice--ignored wp-adminify-notice wp-adminify-notice-<?php echo esc_attr( $this->color ); ?> wp-adminify-notice-<?php echo esc_attr( $this->get_id() ); ?> wp-adminify-notice-plugin-update-info" style="background: #fff; border-left: 4px solid <?php echo esc_attr( $border_color ); ?>; padding: 10px 12px; margin: 5px 15px 2px 0; box-shadow: 0 1px 1px rgba(0,0,0,.04); position: relative;">
					<button type="button" class="wp-adminify-notice-dismiss" data-notice-type="plugin_update_notice" style="position: absolute; top: 0; right: 1px; border: none; margin: 0; padding: 9px; background: none; color: #787c82; cursor: pointer;">
						<span class="dashicons dashicons-no-alt"></span>
					</button>
					<div class="wp-adminify-notice-content">
				<?php
			}else{ echo '<div class="wp-adminify-notice-hidden" style="display:none;"><div>';}
		}

		public function pxlbsadminify_handle_plugin_update_notice_dismiss() { ?>

			<!-- Update Notice Confirmation Modal -->
			<div id="wp-adminify-update-notice-modal" class="wp-adminify-update-modal-overlay">
				<div class="wp-adminify-update-modal">
					<button type="button" class="wp-adminify-update-modal-close" id="wp-adminify-modal-close">
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					<div class="wp-adminify-update-modal-icon">
						<div class="wp-adminify-update-modal-icon-ring">
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div>
					<h3 class="wp-adminify-update-modal-title"><?php echo esc_html__('Want to see future updates?', 'adminify'); ?></h3>
					<p class="wp-adminify-update-modal-desc"><?php echo esc_html__('Stay informed about new features and improvements.', 'adminify'); ?></p>
					<div class="wp-adminify-update-modal-buttons">
						<button type="button" id="wp-adminify-notice-yes" class="wp-adminify-update-btn wp-adminify-update-btn-primary">
							<span><?php echo esc_html__('Yes, notify me', 'adminify'); ?></span>
						</button>
						<button type="button" id="wp-adminify-notice-forever" class="wp-adminify-update-btn wp-adminify-update-btn-secondary">
							<span><?php echo esc_html__("Don't show again", 'adminify'); ?></span>
						</button>
					</div>
				</div>
			</div>

			<style>
				.wp-adminify-update-modal-overlay {
					--modal-accent: #5046e5;
					--modal-accent-light: #6366f1;
					--modal-accent-glow: rgba(80, 70, 229, 0.35);
					--modal-text: #1e293b;
					--modal-text-muted: #64748b;
					--modal-bg: #ffffff;
					--modal-border: #e2e8f0;
					--modal-danger: #ef4444;

					display: none;
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: rgba(15, 23, 42, 0.5);
					backdrop-filter: blur(8px);
					-webkit-backdrop-filter: blur(8px);
					z-index: 999999;
					align-items: center;
					justify-content: center;
				}

				.wp-adminify-update-modal {
					background: var(--modal-bg);
					padding: 48px 44px 44px;
					border-radius: 20px;
					max-width: 460px;
					width: calc(100% - 32px);
					text-align: center;
					box-shadow:
						0 0 0 1px rgba(0, 0, 0, 0.03),
						0 2px 4px rgba(0, 0, 0, 0.02),
						0 12px 24px rgba(0, 0, 0, 0.06),
						0 32px 64px rgba(0, 0, 0, 0.12);
					position: relative;
					animation: wpAdminifyModalAppear 0.35s cubic-bezier(0.16, 1, 0.3, 1);
				}

				@keyframes wpAdminifyModalAppear {
					from {
						opacity: 0;
						transform: scale(0.92) translateY(8px);
					}
					to {
						opacity: 1;
						transform: scale(1) translateY(0);
					}
				}

				.wp-adminify-update-modal-close {
					position: absolute;
					top: 18px;
					right: 18px;
					width: 36px;
					height: 36px;
					border: none;
					background: transparent;
					color: var(--modal-danger);
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 10px;
					transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
					opacity: 0.7;
				}

				.wp-adminify-update-modal-close:hover {
					background: #fef2f2;
					opacity: 1;
					transform: scale(1.05);
				}

				.wp-adminify-update-modal-close:active {
					transform: scale(0.95);
				}

				.wp-adminify-update-modal-icon {
					margin-bottom: 24px;
					display: flex;
					justify-content: center;
				}

				.wp-adminify-update-modal-icon-ring {
					width: 64px;
					height: 64px;
					border-radius: 50%;
					border: 2px solid var(--modal-accent);
					display: flex;
					align-items: center;
					justify-content: center;
					color: var(--modal-accent);
					background: linear-gradient(135deg, rgba(80, 70, 229, 0.04) 0%, rgba(99, 102, 241, 0.08) 100%);
					animation: wpAdminifyIconPulse 2s ease-in-out infinite;
				}

				@keyframes wpAdminifyIconPulse {
					0%, 100% {
						box-shadow: 0 0 0 0 rgba(80, 70, 229, 0.15);
					}
					50% {
						box-shadow: 0 0 0 8px rgba(80, 70, 229, 0);
					}
				}

				.wp-adminify-update-modal-title {
					margin: 0 0 8px;
					font-size: 22px;
					font-weight: 600;
					color: var(--modal-text);
					letter-spacing: -0.02em;
					line-height: 1.3;
				}

				.wp-adminify-update-modal-desc {
					margin: 0 0 32px;
					font-size: 15px;
					color: var(--modal-text-muted);
					line-height: 1.6;
				}

				.wp-adminify-update-modal-buttons {
					display: flex;
					flex-direction: row;
					gap: 12px;
				}

				.wp-adminify-update-btn {
					position: relative;
					padding: 16px 24px;
					border: none;
					border-radius: 12px;
					cursor: pointer;
					font-size: 15px;
					font-weight: 600;
					letter-spacing: -0.01em;
					transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
					flex: 1;
					overflow: hidden;
					white-space: nowrap;
				}

				.wp-adminify-update-btn span {
					position: relative;
					z-index: 1;
				}

				.wp-adminify-update-btn-primary {
					background: linear-gradient(135deg, var(--modal-accent-light) 0%, var(--modal-accent) 100%);
					color: #fff;
				}

				.wp-adminify-update-btn-primary:hover {
					background: linear-gradient(135deg, var(--modal-accent) 0%, #4338ca 100%);
				}

				.wp-adminify-update-btn-primary:active {
					background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
				}

				.wp-adminify-update-btn-secondary {
					background: #fef2f2;
					color: #dc2626;
				}

				.wp-adminify-update-btn-secondary:hover {
					background: #fee2e2;
					color: #b91c1c;
				}

				.wp-adminify-update-btn-secondary:active {
					background: #fecaca;
					color: #991b1b;
				}

				/* Responsive adjustments */
				@media (max-width: 520px) {
					.wp-adminify-update-modal {
						padding: 40px 28px 32px;
						border-radius: 16px;
					}
					.wp-adminify-update-modal-title {
						font-size: 20px;
					}
					.wp-adminify-update-modal-buttons {
						flex-direction: column;
					}
					.wp-adminify-update-btn {
						padding: 14px 20px;
						flex: none;
						width: 100%;
					}
				}
			</style>

			<script>
				(function($) {
					var $modal = $('#wp-adminify-update-notice-modal');
					var $noticeContainer = null;

					function pxlbsadminify_run_dismiss_ajax(action_type) {
						$.post('<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>', {
							action: 'pxlbsadminify_plugin_update_info',
							_wpnonce: '<?php echo esc_js( wp_create_nonce( 'dismiss_notice_nonce' ) ); ?>',
							action_type: action_type
						}).then(function(response) {
							console.log(response);
						});
					}

					function closeModal() {
						$modal.css('display', 'none');
					}

					// Notice Dismiss - Show Modal
					$(document).on('click', '.wp-adminify-notice-plugin-update-info .wp-adminify-notice-dismiss', function(evt) {
						evt.preventDefault();
						evt.stopImmediatePropagation();
						$noticeContainer = $(this).closest('.wp-adminify-notice-plugin-update-info');
						$modal.css('display', 'flex');
					});

					// "Yes" button - Dismiss temporarily
					$(document).on('click', '#wp-adminify-notice-yes', function(evt) {
						evt.preventDefault();
						if ($noticeContainer) {
							$noticeContainer.slideUp(200);
						}
						pxlbsadminify_run_dismiss_ajax('dismiss');
						closeModal();
					});

					// "Don't show me again" button - Dismiss forever
					$(document).on('click', '#wp-adminify-notice-forever', function(evt) {
						evt.preventDefault();
						if ($noticeContainer) {
							$noticeContainer.slideUp(200);
						}
						pxlbsadminify_run_dismiss_ajax('forever');
						closeModal();
					});

					// Close modal on X button click
					$(document).on('click', '#wp-adminify-modal-close', function(evt) {
						evt.preventDefault();
						closeModal();
					});

					// Close modal on overlay click
					$modal.on('click', function(evt) {
						if (evt.target === this) {
							closeModal();
						}
					});

					// Close modal on Escape key
					$(document).on('keydown', function(evt) {
						if (evt.key === 'Escape' && $modal.is(':visible')) {
							closeModal();
						}
					});
				})(jQuery);
			</script>

		<?php
	}

		/**
		 * Intervals
		 *
		 * @author Jewel Theme <support@jeweltheme.com>
		 */
		public function intervals()
		{
			return array(0);
		}
	}
}
