<?php

namespace PXLBSAdminify\Inc\Modules\PostTypesOrder;

use PXLBSAdminify\Inc\Admin\AdminSettings;
use PXLBSAdminify\Inc\Admin\AdminSettingsModel;
use PXLBSAdminify\Inc\Modules\PostTypesOrder\PostTypesOrderWalker;

// no direct access allowed
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WP Adminify
 *
 * @package WP Adminify: Post Types Order
 *
 * @author WP Adminify <support@wpadminify.com>
 */

class PostTypesOrder extends AdminSettingsModel {
	public function __construct() {
		$this->options = (array) AdminSettings::get_instance()->get('post_types_order');

		// Admin Init
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
		if ( empty( $_GET ) ) {
			add_action( 'admin_init', [ $this, 'refresh' ] );
		}

		add_action( 'admin_init', [ $this, 'pto_load_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'pto_css' ], 99 );

		// sortable ajax action
		add_action( 'wp_ajax_pxlbsadminify_update_post_types_order', [ $this, 'pto_update_order' ] );
		add_action( 'wp_ajax_pxlbsadminify_update_post_types_taxonomy_order', [ $this, 'pto_update_taxonomy' ] );

		// reorder post types
		add_action( 'pre_get_posts', [ $this, 'pto_pre_get_posts' ] );

		add_filter( 'get_previous_post_where', array( $this, 'pto_previous_post_where' ) );
		add_filter( 'get_previous_post_sort', [ $this, 'pto_previous_post_sort' ] );
		add_filter( 'get_next_post_where', [ $this, 'pto_next_post_where' ] );
		add_filter( 'get_next_post_sort', [ $this, 'pto_next_post_sort' ] );

		// Taxonomy ordering (pto_taxonomies) is a Pro-only feature.
		// The get_terms_orderby / wp_get_object_terms / get_terms
		// filters are registered by Pro/Classes/Filters.php when the
		// Pro plugin is active.

		// reorder sites
		if ( function_exists( 'is_multisite' ) && is_multisite() ) {
			add_action( 'wp_ajax_pxlbsadminify_update_post_types_order_sites', [ $this, 'pto_update_sites' ] );

			// networkadmin
			if (
				empty( $_SERVER['QUERY_STRING'] ) ||
				( ! empty( $_SERVER['QUERY_STRING'] ) &&
					'action=deleteblog' !== $_SERVER['QUERY_STRING'] && // delete
					'action=allblogs' !== $_SERVER['QUERY_STRING']         // delete all
				)
			) {

				// call from 'get_sites'
				add_filter( 'sites_clauses', [ $this, 'pto_sites_clauses' ], 10, 1 );

				add_action( 'admin_init', [ $this, 'pto_refresh_network' ] );

				// adminbar sites reorder
				add_filter( 'get_blogs_of_user', [ $this, 'pto_get_blogs_of_user' ], 10, 3 );
			}
		}
	}

	public function pto_media_list( $args = '' ) {
		$defaults = [
			'depth'       => -1,
			'date_format' => get_option( 'date_format' ),
			'child_of'    => 0,
			'sort_column' => 'menu_order',
			'post_status' => 'any',
		];

		$r = wp_parse_args( $args, $defaults );
		extract( $r, EXTR_SKIP );

		$output = '';

		$r['exclude'] = implode( ',', apply_filters( 'wp_list_pages_excludes', [] ) ); // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude -- small admin page-exclude list, not a VIP-scale query.

		// Query pages.
		$r['hierarchical'] = 0;
		$args              = [
			'sort_column'    => 'menu_order',
			'post_type'      => $post_type,
			'posts_per_page' => -1,
			'post_status'    => 'any',
			'orderby'        => [
				'menu_order' => 'ASC',
				'post_date'  => 'DESC',
			],
		];

		$the_query = new \WP_Query( $args );
		$pages     = $the_query->posts;

		if ( ! empty( $pages ) ) {
			$output .= $this->walkTree( $pages, $r['depth'], $r );
		}

		echo wp_kses_post( $output );
	}

	public function walkTree( $pages, $depth, $r ) {
		$walker = new PostTypesOrderWalker();

		$args = [ $pages, $depth, $r ];
		return call_user_func_array( [ &$walker, 'walk' ], $args );
	}


	public function refresh() {
		global $wpdb;
		$objects = $this->pto_get_options();

		if ( ! empty( $objects ) ) {
			foreach ( $objects as $object ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required for menu_order aggregate over posts; not cached intentionally.
				$result = $wpdb->get_results(
					$wpdb->prepare(
						"SELECT count(*) as cnt, max(menu_order) as max, min(menu_order) as min
						FROM $wpdb->posts
						WHERE post_type = %s AND post_status IN ('publish', 'pending', 'draft', 'private', 'future')",
						$object
					)
				);
				if ( $result[0]->cnt == 0 || $result[0]->cnt == $result[0]->max ) {
					continue;
				}

				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to fetch ordered post IDs; not cached intentionally.
				$results = $wpdb->get_results(
					$wpdb->prepare(
						"SELECT ID
						FROM $wpdb->posts
						WHERE post_type = %s AND post_status IN ('publish', 'pending', 'draft', 'private', 'future')
						ORDER BY menu_order ASC",
						$object
					)
				);
				foreach ( $results as $key => $result ) {
					// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to persist menu_order; not cached intentionally.
					$wpdb->update( $wpdb->posts, [ 'menu_order' => $key + 1 ], [ 'ID' => $result->ID ] );
				}
			}
		}
	}



	function pto_pre_get_posts( $wp_query ) {
		$objects = $this->pto_get_options();
		if ( empty( $objects ) ) {
			return false;
		}

		/**
		 * for Admin
		 * @default
		 * post pto: [order] => null(desc) [orderby] => null(date)
		 * page: [order] => asc [orderby] => menu_order title
		 */

		if ( is_admin() ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
			if ( isset( $wp_query->query['post_type'] ) && ! isset( $_GET['orderby'] ) ) {
				if ( in_array( $wp_query->query['post_type'], $objects ) ) {
					$wp_query->set( 'orderby', 'menu_order' );
					$wp_query->set( 'order', 'ASC' );
				}
			}
		} else {
			$active = false;

			// page or custom post types
			if ( isset( $wp_query->query['post_type'] ) ) {
				// exclude array()
				if ( ! is_array( $wp_query->query['post_type'] ) ) {
					if ( in_array( $wp_query->query['post_type'], $objects ) ) {
						$active = true;
					}
				}
				// post
			} else {
				if ( in_array( 'post', $objects ) ) {
					$active = true;
				}
			}

			if ( ! $active ) {
				return false;
			}

			// get_posts()
			if ( isset( $wp_query->query['suppress_filters'] ) ) {
				if ( $wp_query->get( 'orderby' ) == 'date' || $wp_query->get( 'orderby' ) == 'menu_order' ) {
					$wp_query->set( 'orderby', 'menu_order' );
					$wp_query->set( 'order', 'ASC' );
				} elseif ( $wp_query->get( 'orderby' ) == 'default_date' ) {
					$wp_query->set( 'orderby', 'date' );
				}
				// WP_Query( contain main_query )
			} else {
				if (
					! $wp_query->get( 'orderby' )
				) {
					$wp_query->set( 'orderby', 'menu_order' );
				}
				if (
					! $wp_query->get( 'order' )
				) {
					$wp_query->set( 'order', 'ASC' );
				}
			}
		}
	}


	public function pto_update_order() {
		// Security check - verify nonce and capability
		check_ajax_referer( 'pxlbsadminify-pto-security-nonce', 'security' );

		if ( ! current_user_can( 'edit_others_posts' ) ) {
			wp_send_json_error( array( 'message' => __( 'You do not have permission to perform this action.', 'adminify' ) ) );
		}

		global $wpdb;
		$data  = [];
		$order = isset( $_POST['order'] ) ? sanitize_text_field( wp_unslash( $_POST['order'] ) ) : '';
		parse_str( $order, $data );

		if ( ! is_array( $data ) ) {
			return false;
		}

		// get objects per now page
		$id_arr = [];
		foreach ( $data as $key => $values ) {
			foreach ( $values as $position => $id ) {
				$id_arr[] = $id;
			}
		}

		// get menu_order of objects per now page
		$menu_order_arr = [];
		foreach ( $id_arr as $key => $id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to read menu_order by ID; not cached intentionally.
			$results = $wpdb->get_results( "SELECT menu_order FROM $wpdb->posts WHERE ID = " . intval( $id ) );
			foreach ( $results as $result ) {
				$menu_order_arr[] = $result->menu_order;
			}
		}

		// maintains key association = no
		sort( $menu_order_arr );

		foreach ( $data as $key => $values ) {
			foreach ( $values as $position => $id ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to persist menu_order; not cached intentionally.
				$wpdb->update( $wpdb->posts, [ 'menu_order' => $menu_order_arr[ $position ] ], [ 'ID' => intval( $id ) ] );
			}
		}

		// same number check
		$post_type = get_post_type( $id );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required for menu_order duplicate detection; not cached intentionally.
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT COUNT(menu_order) AS mo_count, post_type, menu_order FROM $wpdb->posts
				 WHERE post_type = %s AND post_status IN ('publish', 'pending', 'draft', 'private', 'future')
				 AND menu_order > 0 GROUP BY post_type, menu_order HAVING (mo_count) > 1",
				$post_type
			)
		);
		if ( count( $results ) > 0 ) {

			// menu_order refresh
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to fetch ordered post IDs; not cached intentionally.
			$results = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ID, menu_order FROM $wpdb->posts
					 WHERE post_type = %s AND post_status IN ('publish', 'pending', 'draft', 'private', 'future')
					 AND menu_order > 0 ORDER BY menu_order",
					$post_type
				)
			);
			foreach ( $results as $key => $result ) {
				$view_posi = array_search( $result->ID, $id_arr, true );
				if ( $view_posi === false ) {
					$view_posi = 999;
				}
				$sort_key              = ( $result->menu_order * 1000 ) + $view_posi;
				$sort_ids[ $sort_key ] = $result->ID;
			}
			ksort( $sort_ids );
			$oreder_no = 0;
			foreach ( $sort_ids as $key => $id ) {
				$oreder_no = $oreder_no + 1;
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to persist menu_order; not cached intentionally.
				$wpdb->update( $wpdb->posts, [ 'menu_order' => $oreder_no ], [ 'ID' => intval( $id ) ] );
			}
		}
	}

	public function pto_update_taxonomy() {
		// Security check - verify nonce and capability
		check_ajax_referer( 'pxlbsadminify-pto-security-nonce', 'security' );

		if ( ! current_user_can( 'manage_categories' ) ) {
			wp_send_json_error( array( 'message' => __( 'You do not have permission to perform this action.', 'adminify' ) ) );
		}

		global $wpdb;

		$order = isset( $_POST['order'] ) ? sanitize_text_field( wp_unslash( $_POST['order'] ) ) : '';
		parse_str( $order, $data );

		if ( ! is_array( $data ) ) {
			return false;
		}

		$id_arr = [];
		foreach ( $data as $key => $values ) {
			foreach ( $values as $position => $id ) {
				$id_arr[] = $id;
			}
		}

		$menu_order_arr = [];
		foreach ( $id_arr as $key => $id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to read term_order by ID; not cached intentionally.
			$results = $wpdb->get_results( "SELECT term_order FROM $wpdb->terms WHERE term_id = " . intval( $id ) );
			foreach ( $results as $result ) {
				$menu_order_arr[] = $result->term_order;
			}
		}
		sort( $menu_order_arr );

		foreach ( $data as $key => $values ) {
			foreach ( $values as $position => $id ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to persist term_order; not cached intentionally.
				$wpdb->update( $wpdb->terms, [ 'term_order' => $menu_order_arr[ $position ] ], [ 'term_id' => intval( $id ) ] );
			}
		}

		// same number check
		$term     = get_term( $id );
		$taxonomy = $term->taxonomy;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required for term_order duplicate detection; not cached intentionally.
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT COUNT(term_order) AS to_count, term_order
				FROM $wpdb->terms AS terms
				INNER JOIN $wpdb->term_taxonomy AS term_taxonomy ON ( terms.term_id = term_taxonomy.term_id )
				WHERE term_taxonomy.taxonomy = %s GROUP BY taxonomy, term_order HAVING (to_count) > 1",
				$taxonomy
			)
		);
		if ( count( $results ) > 0 ) {
			// term_order refresh
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to fetch ordered term IDs; not cached intentionally.
			$results = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT terms.term_id, term_order
					FROM $wpdb->terms AS terms
					INNER JOIN $wpdb->term_taxonomy AS term_taxonomy ON ( terms.term_id = term_taxonomy.term_id )
					WHERE term_taxonomy.taxonomy = %s
					ORDER BY term_order ASC",
					$taxonomy
				)
			);
			foreach ( $results as $key => $result ) {
				$view_posi = array_search( $result->term_id, $id_arr, true );
				if ( $view_posi === false ) {
					$view_posi = 999;
				}
				$sort_key              = ( $result->term_order * 1000 ) + $view_posi;
				$sort_ids[ $sort_key ] = $result->term_id;
			}
			ksort( $sort_ids );
			$oreder_no = 0;
			foreach ( $sort_ids as $key => $id ) {
				$oreder_no = $oreder_no + 1;
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to persist term_order; not cached intentionally.
				$wpdb->update( $wpdb->terms, [ 'term_order' => $oreder_no ], [ 'term_id' => $id ] );
			}
		}

		do_action( 'pxlbsadminify_update_post_types_order_taxonomy' );
	}

	public function pto_load_scripts() {
		global $pagenow;

		if ( $this->conditional_script_load() || ( $pagenow === 'upload.php' && ( isset( $this->options['pto_media'] ) && $this->options['pto_media'] ) ) ) {
			wp_enqueue_script( 'jquery' );
			wp_enqueue_script( 'jquery-ui-sortable' );
			wp_enqueue_script( 'adminify-post-type-order', PXLBSADMINIFY_URL . 'Inc/Modules/PostTypesOrder/js/post-type-order.js', [ 'jquery' ], PXLBSADMINIFY_VER, true );
			wp_localize_script( 'adminify-post-type-order', 'PXLBSADMINIFY_PTO', array(
				'nonce' => wp_create_nonce( 'pxlbsadminify-pto-security-nonce' ),
			) );
		}
	}

	public function pto_css() {
		global $pagenow;
		if ( $this->conditional_script_load() || ( $pagenow === 'upload.php' && ( ! empty( $this->options['pto_media'] ) ) ) ) {
			echo '<!-- Start of Post Type and Taxonomy Order --->';
			echo '<style type="text/css">';
			echo '.adminify-table-responsive-wrapper .ui-sortable tr:hover{cursor:move}.adminify-table-responsive-wrapper .ui-sortable tr.alternate{background-color:#f9f9f9 !important}.adminify-table-responsive-wrapper .ui-sortable tr.ui-sortable-helper{background-color:#f9f9f9 !important;border-top:1px solid #dfdfdf;border-bottom:1px solid #dfdfdf;box-shadow:0 -5px 5px -4px rgba(0,0,0,.1),0 5px 5px -3px rgba(0,0,0,.1)}.adminify-table-responsive-wrapper .ui-sortable-placeholder{height:50px;background-color:#e9e9e9;border:2px dashed #dfdfdf;visibility:visible!important}.adminify-table-responsive-wrapper .wp-list-table{table-layout:fixed;width:100%;border-collapse:collapse}.adminify-table-responsive-wrapper.wp-list-table td,.adminify-table-responsive-wrapper .wp-list-table th{padding:8px 16px;text-align:left;white-space:nowrap;word-wrap:break-word;overflow:hidden}.adminify-table-responsive-wrapper.wp-list-table .column-title,.wp-list-table td.column-title,.adminify-table-responsive-wrapper{overflow-x:auto;-webkit-overflow-scrolling:touch}@media screen and (max-width:768px){.adminify-table-responsive-wrapper .wp-list-table td,.adminify-table-responsive-wrapper.wp-list-table th{padding:8px}}';
			echo '</style>';
			echo '<!-- End of Post Type and Taxonomy Order --->';
		}
	}

	public function conditional_script_load() {
		global $pagenow;

		$active = false;

		// Multisite > Sites
		if (
			function_exists( 'is_multisite' )
			&& is_multisite()
			&& $pagenow == 'sites.php'
		) {
			return true;
		}

		$objects = $this->pto_get_options();

		if ( empty( $objects ) ) {
			return false;
		}

		// exclude (sorting, addnew page, edit page)
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
		if ( isset( $_GET['orderby'] ) || ( ! empty( $_SERVER['REQUEST_URI'] ) && strstr( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), 'action=edit' ) || strstr( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), 'wp-admin/post-new.php' ) ) ) {
			return false;
		}

		if ( ! empty( $objects ) ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
			if ( isset( $_GET['post_type'] ) && ! isset( $_GET['taxonomy'] ) && in_array( sanitize_text_field( wp_unslash( $_GET['post_type'] ) ), $objects ) ) { // if page or custom post types
				$active = true;
			}
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
			if ( ! isset( $_GET['post_type'] ) && ( ! empty( $_SERVER['REQUEST_URI'] && strstr( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), 'wp-admin/edit.php' ) ) && in_array( 'post', $objects ) ) ) {
                // if post
				$active = true;
			}
		}

		return $active;
	}

	function pto_get_options() {
		$objects = isset( $this->options['pto_posts'] ) && is_array( $this->options['pto_posts'] ) ? $this->options['pto_posts'] : [];
		return $objects;
	}

	function pto_previous_post_where( $where ) {
		global $post;

		$objects = $this->pto_get_options();
		if ( empty( $objects ) ) {
			return $where;
		}

		if ( isset( $post->post_type ) && in_array( $post->post_type, $objects ) ) {
			$current_menu_order = $post->menu_order;
			$where              = str_replace( "p.post_date < '" . $post->post_date . "'", "p.menu_order > '" . $current_menu_order . "'", $where );
		}
		return $where;
	}

	function pto_previous_post_sort( $orderby ) {
		global $post;

		$objects = $this->pto_get_options();
		if ( empty( $objects ) ) {
			return $orderby;
		}

		if ( isset( $post->post_type ) && in_array( $post->post_type, $objects ) ) {
			$orderby = 'ORDER BY p.menu_order ASC LIMIT 1';
		}
		return $orderby;
	}


	function pto_next_post_where( $where ) {
		global $post;

		$objects = $this->pto_get_options();
		if ( empty( $objects ) ) {
			return $where;
		}

		if ( isset( $post->post_type ) && in_array( $post->post_type, $objects ) ) {
			$current_menu_order = $post->menu_order;
			$where              = str_replace( "p.post_date > '" . $post->post_date . "'", "p.menu_order < '" . $current_menu_order . "'", $where );
		}
		return $where;
	}

	function pto_next_post_sort( $orderby ) {
		global $post;

		$objects = $this->pto_get_options();
		if ( empty( $objects ) ) {
			return $orderby;
		}

		if ( isset( $post->post_type ) && in_array( $post->post_type, $objects ) ) {
			$orderby = 'ORDER BY p.menu_order DESC LIMIT 1';
		}
		return $orderby;
	}


	public function pto_sites_clauses( $pieces = [] ) {
		if ( is_admin() ) {
			return $pieces;
		}

		global $wp_version;
		if ( version_compare( $wp_version, '4.6.0' ) >= 0 ) {
			if ( 'blog_id ASC' === $pieces['orderby'] ) {
				$pieces['orderby'] = 'menu_order ASC';
			}
		}
		return $pieces;
	}

	public function pto_update_sites() {
		// Security check - verify nonce and capability
		check_ajax_referer( 'pxlbsadminify-pto-security-nonce', 'security' );

		if ( ! current_user_can( 'manage_sites' ) ) {
			wp_send_json_error( array( 'message' => __( 'You do not have permission to perform this action.', 'adminify' ) ) );
		}

		global $wpdb;

		$order = isset( $_POST['order'] ) ? sanitize_text_field( wp_unslash( $_POST['order'] ) ) : '';
		parse_str( $order, $data );

		if ( ! is_array( $data ) ) {
			return false;
		}

		$id_arr = [];
		foreach ( $data as $key => $values ) {
			foreach ( $values as $position => $id ) {
				$id_arr[] = $id;
			}
		}

		foreach ( $data as $key => $values ) {
			foreach ( $values as $position => $id ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- direct query required to persist blog menu_order; not cached intentionally.
				$wpdb->update( $wpdb->prefix . 'blogs', [ 'menu_order' => $position + 1 ], [ 'blog_id' => intval( $id ) ] );
			}
		}

		die();
	}

	public function pto_refresh_network() {
		global $pagenow;
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.
		if ( 'sites.php' === $pagenow && ! isset( $_GET['orderby'] ) ) {
			add_filter( 'query', [ $this, 'pto_refresh_network_second' ] );
		}
	}


	public function pto_refresh_network_second( $query ) {
		global $wpdb, $wp_version, $blog_id;

		// $wpdb->get_varやswitch_to_blog(1)
		if ( version_compare( $wp_version, '4.7.0' ) >= 0 ) {
			if ( 1 !== $blog_id ) {
				return $query;
			}
		}

		if (
			false !== strpos( $query, "SELECT * FROM $wpdb->blogs WHERE site_id = '1'" ) ||
			false !== strpos( $query, "SQL_CALC_FOUND_ROWS blog_id FROM $wpdb->blogs  WHERE site_id = 1" )
		) {
			if ( false !== strpos( $query, ' LIMIT ' ) ) {
				$query = preg_replace( '/^(.*) LIMIT(.*)$/', '$1 ORDER BY menu_order ASC LIMIT $2', $query );
			} else {
				$query .= ' ORDER BY menu_order ASC';
			}
		}
		return $query;
	}


	public function pto_get_blogs_of_user( $blogs ) {
		$sites     = get_sites( [] );
		$sort_keys = [];
		foreach ( $sites as $k => $v ) {
			$sort_keys[] = $v->menu_order;
		}
		array_multisort( $sort_keys, SORT_ASC, $sites );

		$blog_list = [];
		foreach ( $blogs as $k => $v ) {
			$blog_list[ $v->userblog_id ] = $v;
		}

		$new = [];
		foreach ( $sites as $k => $v ) {
			if (
				isset( $v->blog_id ) &&
				isset( $blog_list[ $v->blog_id ] ) &&
				is_object( $blog_list[ $v->blog_id ] )
			) {
				$new[] = $blog_list[ $v->blog_id ];
			}
		}

		return $new;
	}
}
