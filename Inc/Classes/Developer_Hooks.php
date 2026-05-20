<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * WP Adminify has some hooks for developers.
 */
if ( ! class_exists( 'PXLBSAdminify_Developer_Hooks' ) ) {

	/**
	 * Developer friendly hooks.
	 */
	class PXLBSAdminify_Developer_Hooks {


		/*
		 * * * * * * * * *
		* Class constructor
		* * * * * * * * * */
		public function __construct() {
			$this->_hooks();
		}

		public function _hooks() {
			add_filter( 'pxlbsadminify_remember_me', [ $this, 'remember_me_callback' ], 10, 1 );
		}

		/**
		 * remember_me_callback [turn off the remember me option from WordPress login form.]
		 *
		 * @param  bolean $activate
		 * @since 1.0.0
		 */
		public function remember_me_callback( $activate ) {
			if ( ! $activate ) {
				return;
			}

			// Hide the "Remember Me" checkbox via CSS instead of opening
			// an output buffer in login_form. Output buffers that are not
			// closed in the same logical flow can desync the buffer stack
			// when other plugins/themes also buffer output.
			add_action( 'login_head', [ $this, 'hide_remember_me_style' ], 99 );
			// Reset any attempt to set the remember option
			add_action( 'login_head', [ $this, 'unset_remember_me_option' ], 99 );
		}

		function unset_remember_me_option() {

			// Remove the rememberme post value
			// phpcs:ignore WordPress.Security.NonceVerification.Missing -- read-only check, no state change.
			if ( isset( $_POST['rememberme'] ) ) {
				unset( $_POST['rememberme'] );
			}
		}

		function hide_remember_me_style() {
			echo '<style id="wp-adminify-hide-rememberme">.forgetmenot{display:none !important;}</style>';
		}
	}
}
