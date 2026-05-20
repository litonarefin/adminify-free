<?php if ( ! defined( 'ABSPATH' ) ) { die; } // Cannot access directly.

use PXLBSAdminify\Inc\Utils;
/**
 *
 * Field: checkbox
 *
 * @since 1.0.0
 * @version 1.0.0
 *
 */
if ( ! class_exists( 'ADMINIFY_Field_checkbox' ) ) {
  class ADMINIFY_Field_checkbox extends ADMINIFY_Fields {

    public function __construct( $field, $value = '', $unique = '', $where = '', $parent = '' ) {
      parent::__construct( $field, $value, $unique, $where, $parent );
    }

    public function render() {

      $args              = wp_parse_args( $this->field, array(
        'inline'         => false,
        'query_args'     => array(),
        'check_all'      => false,
        'check_all_text' => esc_html__( 'Check/Uncheck All', 'adminify' ),
      ) );

      $inline_class = ( $args['inline'] ) ? ' class="adminify--inline-list"' : '';

      echo wp_kses_post( $this->field_before() );

      if ( isset( $this->field['options'] ) ) {

        $value   = ( is_array( $this->value ) ) ? $this->value : array_filter( (array) $this->value );
        $options = $this->field['options'];
        $options = ( is_array( $options ) ) ? $options : array_filter( $this->field_data( $options, false, $args['query_args'] ) );

        if ( is_array( $options ) && ! empty( $options ) ) {

          echo '<ul'. $inline_class .'>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- attribute value pre-escaped with esc_attr() where built.

          foreach ( $options as $option_key => $option_value ) {

            if ( is_array( $option_value ) && ! empty( $option_value ) ) {

              echo '<li>';
                echo '<ul>';
                  echo '<li><strong>'. esc_attr( $option_key ) .'</strong></li>';
                  foreach ( $option_value as $sub_key => $sub_value ) {
                    $checked = ( in_array( $sub_key, $value ) ) ? ' checked' : '';
                    echo '<li>';
                    echo '<label>';
                    echo '<input type="checkbox" name="'. esc_attr( $this->field_name( '[]' ) ) .'" value="'. esc_attr( $sub_key ) .'"'. $this->field_attributes() . esc_attr( $checked ) .'/>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- field_attributes() escapes each attribute via esc_attr()
                    echo '<span class="adminify--text">'. Utils::kses_custom( $sub_value ) .'</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kses_custom() is a wp_kses() wrapper; output already escaped.
                    echo '</label>';
                    echo '</li>';
                  }
                echo '</ul>';
              echo '</li>';

            } else {

              $checked = ( in_array( $option_key, $value ) ) ? ' checked' : '';

              echo '<li>';
              echo '<label>';
              echo '<input type="checkbox" name="'. esc_attr( $this->field_name( '[]' ) ) .'" value="'. esc_attr( $option_key ) .'"'. $this->field_attributes() . esc_attr( $checked ) .'/>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- field_attributes() escapes each attribute via esc_attr()
              echo '<span class="adminify--text">'. Utils::kses_custom( $option_value ) .'</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kses_custom() is a wp_kses() wrapper; output already escaped.
              echo '</label>';
              echo '</li>';

            }

          }

          echo '</ul>';

          if ( $args['check_all'] ) {
            echo '<div class="adminify-checkbox-all">'. esc_html( $args['check_all_text'] ) .'</div>';
          }

        } else {

          echo ( ! empty( $this->field['empty_message'] ) ) ? esc_attr( $this->field['empty_message'] ) : esc_html__( 'No data available.', 'adminify' );

        }

      } else {

        echo '<label class="adminify-checkbox">';
        echo '<input type="hidden" name="'. esc_attr( $this->field_name() ) .'" value="'. esc_attr( $this->value ) .'" class="adminify--input"'. $this->field_attributes() .'/>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- field_attributes() escapes each attribute via esc_attr()
        echo '<input type="checkbox" name="_pseudo" class="adminify--checkbox"'. esc_attr( checked( $this->value, 1, false ) ) . $this->field_attributes() .'/>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- field_attributes() escapes each attribute via esc_attr()
        echo ( ! empty( $this->field['label'] ) ) ? '<span class="adminify--text">'. Utils::kses_custom( $this->field['label'] ) .'</span>' : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kses_custom() is a wp_kses() wrapper; output already escaped.
        echo '</label>';

      }

      echo wp_kses_post( $this->field_after() );

    }

  }
}
