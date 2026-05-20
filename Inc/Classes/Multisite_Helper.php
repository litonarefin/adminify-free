<?php

namespace PXLBSAdminify\Inc\Classes;

// no direct access allowed
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @package PXLBSAdminify
 * Multisite Helper
 *
 * @author Jewel Theme <support@jeweltheme.com>
 */

class Multisite_Helper {

	public function is_network_active() {
		if ( ! function_exists( 'is_plugin_active_for_network' ) || ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . '/wp-admin/includes/plugin.php';
		}

		return ( is_plugin_active_for_network( 'adminify/adminify.php' ) ? true : false );
	}

	/**
	 * Check Multisite Supports
	 *
	 * @return void
	 */
	public function is_multisite_supported() {
		return ( $this->is_network_active() && apply_filters( 'pxlbsadminify_ms_support', false ) ? true : false );
	}

	/**
	 * Check if it needed to switch blog
	 *
	 * @return void
	 */
	public function needs_to_switch_blog() {
		if ( ! $this->is_multisite_supported() ) {
			return false;
		}

		global $pxlbsadminify_blueprint;

		if ( empty( $pxlbsadminify_blueprint ) || get_current_blog_id() === $pxlbsadminify_blueprint ) {
			return false;
		}

		return true;
	}

	/**
	 * Construct array of excluded sites
	 *
	 * @return array The array of excluded sites.
	 */
	public function get_excluded_sites() {
		global $pxlbsadminify_blueprint;

		$array = [];

		// Include blueprint site if it is defined.
		if ( ! empty( $pxlbsadminify_blueprint ) ) {
			$array[] = $pxlbsadminify_blueprint;
		}

		if ( get_site_option( 'pxlbsadminify_multisite_exclude' ) ) {
			$excluded_sites = get_site_option( 'pxlbsadminify_multisite_exclude' );
			$excluded_sites = str_replace( ' ', '', $excluded_sites );
			$excluded_sites = explode( ',', $excluded_sites );
		} else {
			$excluded_sites = [];
		}

		$excluded_sites = array_merge( $array, $excluded_sites );

		return $excluded_sites;
	}
}
