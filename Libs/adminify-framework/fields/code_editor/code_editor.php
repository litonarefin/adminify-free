<?php if ( ! defined( 'ABSPATH' ) ) { die; } // Cannot access directly.
/**
 *
 * Field: code_editor
 *
 * @since 1.0.0
 * @version 1.0.0
 *
 */
if ( ! class_exists( 'ADMINIFY_Field_code_editor' ) ) {
  class ADMINIFY_Field_code_editor extends ADMINIFY_Fields {

    public $version = '5.65.16';
    public $cdn_url = '';

    public function __construct( $field, $value = '', $unique = '', $where = '', $parent = '' ) {
      parent::__construct( $field, $value, $unique, $where, $parent );
      // CodeMirror is bundled locally inside the plugin (no remote CDN).
      $this->cdn_url = defined( 'PXLBSADMINIFY_ASSETS' ) ? PXLBSADMINIFY_ASSETS . 'vendors/codemirror' : '';
    }

    public function render() {

      $default_settings = array(
        'tabSize'       => 2,
        'lineNumbers'   => true,
        'theme'         => 'default',
        'mode'          => 'htmlmixed',
        'cdnURL'        => $this->cdn_url,
      );

      $settings = ( ! empty( $this->field['settings'] ) ) ? $this->field['settings'] : array();
      $settings = wp_parse_args( $settings, $default_settings );

      echo wp_kses_post( $this->field_before() );
      echo '<textarea name="'. esc_attr( $this->field_name() ) .'"'. $this->field_attributes() .' data-editor="'. esc_attr( wp_json_encode( $settings ) ) .'">'. esc_textarea( $this->value ) .'</textarea>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- field_attributes() escapes each attribute via esc_attr()
      echo wp_kses_post( $this->field_after() );

    }

    public function enqueue() {

      $page = ( ! empty( $_GET[ 'page' ] ) ) ? sanitize_text_field( wp_unslash( $_GET[ 'page' ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check, no state change.

      // Do not loads CodeMirror in revslider page.
      if ( in_array( $page, array( 'revslider' ) ) ) { return; }

      // Use WordPress core's bundled CodeMirror instead of shipping our own copy.
      // wp_enqueue_code_editor() registers `code-editor` + `wp-codemirror` (with
      // the common language modes) and exposes window.wp.CodeMirror.
      if ( function_exists( 'wp_enqueue_code_editor' ) ) {
        wp_enqueue_code_editor( array( 'type' => 'text/html' ) );
        wp_enqueue_script( 'wp-codemirror' );
        wp_enqueue_style( 'wp-codemirror' );
      }

    }

  }
}
