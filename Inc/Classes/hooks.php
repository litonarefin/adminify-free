<?php

namespace PXLBSAdminify\Inc\Classes;

use PXLBSAdminify\Inc\Utils;

// no direct access allowed
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * PXLBSAdminify
 *
 * @author Jewel Theme <support@jeweltheme.com>
 */
class Hooks {

	public function __construct() {
		// https://wordpress.stackexchange.com/questions/25034/how-to-remove-screen-options-and-help-links-in-the-admin-area
		// https://wordpress.stackexchange.com/questions/73561/how-to-remove-all-widgets-from-dashboard
		// Hide Screen Options and Contextual Help

		// Add Featured Image or Post Thumbnail to RSS Feed
		add_filter( 'the_excerpt_rss', [ $this, 'rss_post_thumbnail' ] );
		add_filter( 'the_content_feed', [ $this, 'rss_post_thumbnail' ] );

		// Add Categories to WordPress Pages, add tag and category support to pages
		add_action( 'init', [ $this, 'tags_categories_support_all' ] );
		add_action( 'pre_get_posts', [ $this, 'tags_categories_support_query' ] );

		// Remove WordPress Version Number
		add_filter( 'the_generator', [ $this, 'remove_version' ] );

		// Remove Default Image Links in WordPress
		add_action( 'admin_init', [ $this, 'imagelink_setup' ], 10 );

		// WP Adminify Custom Tweaks
		add_filter( 'manage_posts_columns', [ $this, 'columns_attachments' ], 1 );
		add_action( 'manage_posts_custom_column', [ $this, 'custom_columns_attachments' ], 1, 2 );
	}


	function columns_attachments( $attachmentCount ) {
		$attachmentCount['wp_adminify_post_attachments'] = esc_html__( 'Attachment(s)', 'adminify' );
		return $attachmentCount;
	}

	function custom_columns_attachments( $adminify_col_name, $id ) {
		if ( $adminify_col_name === 'wp_adminify_post_attachments' ) {
			$attachments         = get_children( [ 'post_parent' => $id ] );
			$adminifyAttachments = count( $attachments );
			if ( $adminifyAttachments != 0 ) {
				echo esc_html( Utils::kses_custom( $adminifyAttachments ) );
			}
		}
	}


	function rss_post_thumbnail( $content ) {
		global $post;
		if ( has_post_thumbnail( $post->ID ) ) {
			$content = '<p>' . get_the_post_thumbnail( $post->ID ) .
				'</p>' . get_the_content();
		}
		return $content;
	}


	function tags_categories_support_all() {
		register_taxonomy_for_object_type( 'post_tag', 'page' );
		register_taxonomy_for_object_type( 'category', 'page' );
	}

	// ensure all tags and categories are included in queries
	function tags_categories_support_query( $wp_query ) {
		if ( $wp_query->get( 'tag' ) ) {
			$wp_query->set( 'post_type', 'any' );
		}
		if ( $wp_query->get( 'category_name' ) ) {
			$wp_query->set( 'post_type', 'any' );
		}
	}


	function remove_version() {
		return '';
	}


	function imagelink_setup() {
		$image_set = get_option( 'image_default_link_type' );

		if ( $image_set !== 'none' ) {
			update_option( 'image_default_link_type', 'none' );
		}
	}
}
