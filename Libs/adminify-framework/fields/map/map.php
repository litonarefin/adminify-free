<?php if ( ! defined( 'ABSPATH' ) ) { die; } // Cannot access directly.
/**
 *
 * Field: map
 *
 * @since 1.0.0
 * @version 1.0.0
 *
 */
if ( ! class_exists( 'ADMINIFY_Field_map' ) ) {
  class ADMINIFY_Field_map extends ADMINIFY_Fields {

    public $version = '1.9.4';
    public $cdn_url = '';

    public function __construct( $field, $value = '', $unique = '', $where = '', $parent = '' ) {
      parent::__construct( $field, $value, $unique, $where, $parent );
      // Leaflet is bundled locally inside the plugin (no remote CDN).
      $this->cdn_url = defined( 'PXLBSADMINIFY_ASSETS' ) ? PXLBSADMINIFY_ASSETS . 'vendors/leaflet' : '';
    }

    public function render() {

      $args              = wp_parse_args( $this->field, array(
        'placeholder'    => esc_html__( 'Search...', 'adminify' ),
        'latitude_text'  => esc_html__( 'Latitude', 'adminify' ),
        'longitude_text' => esc_html__( 'Longitude', 'adminify' ),
        'address_field'  => '',
        'height'         => '',
      ) );

      $value             = wp_parse_args( $this->value, array(
        'address'        => '',
        'latitude'       => '20',
        'longitude'      => '0',
        'zoom'           => '2',
      ) );

      $default_settings   = array(
        'center'          => array( $value['latitude'], $value['longitude'] ),
        'zoom'            => $value['zoom'],
        'scrollWheelZoom' => false,
      );

      $settings = ( ! empty( $this->field['settings'] ) ) ? $this->field['settings'] : array();
      $settings = wp_parse_args( $settings, $default_settings );

      $style_attr  = ( ! empty( $args['height'] ) ) ? ' style="min-height:'. esc_attr( $args['height'] ) .';"' : '';
      $placeholder = ( ! empty( $args['placeholder'] ) ) ? array( 'placeholder' => $args['placeholder'] ) : '';

      echo wp_kses_post( $this->field_before() );

      if ( empty( $args['address_field'] ) ) {
        echo '<div class="adminify--map-search">';
        echo '<input type="text" name="'. esc_attr( $this->field_name( '[address]' ) ) .'" value="'. esc_attr( $value['address'] ) .'"'. $this->field_attributes( $placeholder ) .' />'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- field_attributes() escapes each attribute via esc_attr()
        echo '</div>';
      } else {
        echo '<div class="adminify--address-field" data-address-field="'. esc_attr( $args['address_field'] ) .'"></div>';
      }

      echo '<div class="adminify--map-osm-wrap"><div class="adminify--map-osm" data-map="'. esc_attr( wp_json_encode( $settings ) ) .'"'. $style_attr .'></div></div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- attribute value pre-escaped with esc_attr() where built.

      echo '<div class="adminify--map-inputs">';

        echo '<div class="adminify--map-input">';
        echo '<label>'. esc_attr( $args['latitude_text'] ) .'</label>';
        echo '<input type="text" name="'. esc_attr( $this->field_name( '[latitude]' ) ) .'" value="'. esc_attr( $value['latitude'] ) .'" class="adminify--latitude" />';
        echo '</div>';

        echo '<div class="adminify--map-input">';
        echo '<label>'. esc_attr( $args['longitude_text'] ) .'</label>';
        echo '<input type="text" name="'. esc_attr( $this->field_name( '[longitude]' ) ) .'" value="'. esc_attr( $value['longitude'] ) .'" class="adminify--longitude" />';
        echo '</div>';

      echo '</div>';

      echo '<input type="hidden" name="'. esc_attr( $this->field_name( '[zoom]' ) ) .'" value="'. esc_attr( $value['zoom'] ) .'" class="adminify--zoom" />';

      echo wp_kses_post( $this->field_after() );

    }

    public function enqueue() {

      if ( empty( $this->cdn_url ) ) { return; }

      if ( ! wp_script_is( 'adminify-leaflet' ) ) {
        wp_enqueue_script( 'adminify-leaflet', esc_url( $this->cdn_url .'/leaflet.js' ), array( 'adminify' ), $this->version, true );
      }

      if ( ! wp_style_is( 'adminify-leaflet' ) ) {
        wp_enqueue_style( 'adminify-leaflet', esc_url( $this->cdn_url .'/leaflet.css' ), array(), $this->version );
      }

      if ( ! wp_script_is( 'jquery-ui-autocomplete' ) ) {
        wp_enqueue_script( 'jquery-ui-autocomplete' );
      }

    }

  }
}
