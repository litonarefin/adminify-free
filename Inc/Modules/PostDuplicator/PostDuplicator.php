<?php

namespace PXLBSAdminify\Inc\Modules\PostDuplicator;

use PXLBSAdminify\Inc\Admin\AdminSettings;
// no direct access allowed
if (!defined('ABSPATH')) {
	exit;
}

/**
 * WP Adminify
 *
 * @package Duplicate Post/Page/Custom Posts
 *
 * @author Jewel Theme <support@jeweltheme.com>
 */


if (!defined('ABSPATH')) {
	exit; // If this file is called directly, abort.
}

class PostDuplicator
{

	private $clone_title;
	public $options = [];

	public function __construct()
	{
		$this->clone_title = AdminSettings::get_instance()->get('pxlbsadminify_wl_plugin_menu_label');

		$this->options = (array) AdminSettings::get_instance()->get();

		// Taxonomy duplicator (reads post_duplicator.taxonomies) is a
		// Pro-only feature. Pro/Classes/Filters.php registers the
		// admin_action and *_row_actions filters when the Pro plugin
		// is active.

		// Check Access for User roles
		add_action('admin_init', [$this, 'post_duplicator_init']);
	}

	public function post_duplicator_init()
	{
		$post_types = [];
		if (!empty($this->options['post_duplicator']['post_types'])) {
			$post_types = $this->options['post_duplicator']['post_types'];
		}
		$all_post_types = get_post_types();

		if (empty($post_types) || empty(array_intersect($all_post_types, $post_types))) {
			return;
		}
	
		add_action('admin_action_adminify_duplicate', [$this, 'duplicate_post_as_draft']);
		add_filter('post_row_actions', [$this, 'duplicator_row_actions'], 10, 2);
		add_filter('page_row_actions', [$this, 'duplicator_row_actions'], 10, 2);


		// foreach ($post_types as $key => $post_type) {
		// 	if (in_array($post_type, $all_post_types)) {
		// 		add_filter($post_type . '_row_actions', [$this, 'duplicator_row_actions'], 10, 2);
		// 	}
		// }
	}


	/**
	 * Check if current user can clone
	 *
	 * @return bool
	 */
	public function user_can_clone($post)
	{
		if (!current_user_can('edit_posts')) {
			return false;
		}

		if (current_user_can('editor') || current_user_can('administrator')) {
			return true;
		}

		if (current_user_can('contributor') || current_user_can('author')) {
			$get_current_user_id = get_current_user_id();
			$post = get_post($post);
			$author_id = $post->post_author;
			if ($get_current_user_id == $author_id) {
				return true;
			}
		}
		return false;
	}


	/*
	 * Add the duplicate link to action list for post_row_actions
	 */
	public function duplicator_row_actions($actions, $post)
	{
		$post_type = $post->post_type;
		$allowed_post_types = $post_types = $this->options['post_duplicator']['post_types'];
		if( !in_array($post_type, $allowed_post_types)){
			return $actions;
		}
    if (!$this->user_can_clone($post)) {
			return $actions;
		}
		
		$adminify_duplicate_link = admin_url('admin.php?action=adminify_duplicate&post=' . $post->ID);
		$adminify_duplicate_link = wp_nonce_url($adminify_duplicate_link, 'pxlbsadminify_post_duplicator_nonce');

		$clone_title                   = !empty($this->clone_title) ? $this->clone_title : 'Adminify';
		$clone_title                   = preg_replace('/wp/i', '', $clone_title) . ' Clone';
		$duplicate_title               = 'Duplicate this item ' . $post->post_title;
		/* translators: 1: Duplicate post URL, 2: Link title attribute, 3: Link text */
		$actions['adminify_duplicate'] = sprintf(__('<a href="%1$s" title="%2$s" rel="permalink">%3$s</a>', 'adminify'), $adminify_duplicate_link, $duplicate_title, $clone_title);
		return $actions;
	}


	/*
	 * Function creates post duplicate as a draft and redirects then to the edit post screen
	 */
	public function duplicate_post_as_draft()
	{
		global $wpdb;

		if (!(isset($_GET['post']) || isset($_POST['post']) || (isset($_REQUEST['action']) && 'adminify_duplicate' == $_REQUEST['action']))) {
			wp_die('No post to duplicate has been supplied!');
		}

		/*
		 * Nonce verification
		 * Return if nonce is not valid
		 */
		if (!isset($_REQUEST['_wpnonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_REQUEST['_wpnonce'])), 'pxlbsadminify_post_duplicator_nonce')) {
			return;
		}

		/*
		 * get the original post id
		 */
		$post_id = (isset($_GET['post']) ? absint($_GET['post']) : absint($_POST['post']));
		/*
		 * and all the original post data then
		 */
		$post = get_post($post_id);
		if( isset( $_SERVER['HTTP_REFERER']) && str_contains( esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) ), 'action=adminify_duplicate' )) {
			$redirect_url = admin_url('edit.php?post_type=' . $post->post_type);
			wp_safe_redirect($redirect_url);

			// exit;
		}

		if (!$this->user_can_clone($post)) {
			return;
		}

		/*
		 * if post data exists, create the post duplicate
		 */
		if (isset($post) && $post != null) {

			/*
			 * new post data array
			 */
			$args = [
				'post_title'     => $post->post_title,
				'post_type'      => $post->post_type,
				'post_content'   => $post->post_content,
				'post_excerpt'   => $post->post_excerpt,
				'post_author'    => get_current_user_id(),
				'comment_status' => $post->comment_status,
				'ping_status'    => $post->ping_status,
				'post_name'      => $post->post_name,
				'post_parent'    => $post->post_parent,
				'post_password'  => $post->post_password,
				'post_status'    => 'draft',
				'to_ping'        => $post->to_ping,
				'menu_order'     => $post->menu_order,
			];

			/*
			 * insert the post by wp_insert_post() function
			 */
			$new_post_id = wp_insert_post($args);

			/*
			 * get all current post terms ad set them to the new post draft
			 */
			$taxonomies = get_object_taxonomies($post->post_type); // returns array of taxonomy names for post type, ex array("category", "post_tag");
			foreach ($taxonomies as $taxonomy) {
				$post_terms = wp_get_object_terms($post_id, $taxonomy, ['fields' => 'slugs']);
				wp_set_object_terms($new_post_id, $post_terms, $taxonomy, false);
			}

			/*
			 * duplicate all post meta just in two SQL queries
			 */
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required for copying all post meta rows; not cached intentionally.
			$post_meta_infos = $wpdb->get_results($wpdb->prepare("SELECT meta_key, meta_value FROM $wpdb->postmeta WHERE post_id=%d", $post_id));
			if (count($post_meta_infos) != 0) {
				$sql_query = "INSERT INTO $wpdb->postmeta (post_id, meta_key, meta_value) ";
				foreach ($post_meta_infos as $meta_info) {
					$meta_key = $meta_info->meta_key;

					// Do not copy these values
					if ($meta_key == '_wp_old_slug') {
						continue;
					}
					if ($meta_key == '_elementor_css') {
						continue;
					}

					// Delete already added meta data triggered by wp_insert_post hook
					if ($meta_key == '_elementor_template_type') {
						delete_post_meta($new_post_id, '_elementor_template_type');
					}

					$meta_value      = $meta_info->meta_value;
					$sql_query_sel[] = $wpdb->prepare('SELECT %d, %s, %s', $new_post_id, $meta_key, $meta_value);
				}
				$sql_query .= implode(' UNION ALL ', $sql_query_sel);
				// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,PluginCheck.Security.DirectDB.UnescapedDBParameter -- $sql_query is built from $wpdb->prepare() fragments above; direct query required for bulk meta insert, not cached intentionally.
				$wpdb->query($sql_query);
			}

			/*
			 * finally, redirect to the edit post screen for the new draft
			 */
			$redirect_url = admin_url('edit.php?post_type=' . $post->post_type);
			wp_safe_redirect($redirect_url);

			exit;
		} else {
			wp_die('Post creation failed, could not find original post: ' . absint($post_id));
		}
	}
}
