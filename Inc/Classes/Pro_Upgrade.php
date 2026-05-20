<?php

namespace PXLBSAdminify\Inc\Classes;

use PXLBSAdminify\Inc\Classes\Helper;
use PXLBSAdminify\Inc\Classes\Notifications\Base\Date;
// No, Direct access Sir !!!
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
/**
 * Upgrade to Pro Class
 *
 * Jewel Theme <support@jeweltheme.com>
 */
class Pro_Upgrade {
    use Date;
    public $slug;

    protected $data = array();

    /**
     * Construct method
     */
    public function __construct() {
        $this->slug = Helper::slug_cleanup();
        $this->set_data();
        add_action( 'admin_footer', array($this, 'display_popup') );
    }

    /**
     * Set merged data
     *
     * @return void
     * @author Jewel Theme <support@jeweltheme.com>
     */
    public function set_data() {
        $this->data = Helper::get_merged_data( self::get_data() );
    }

    /**
     * Get Sheet data
     *
     * @author Jewel Theme <support@jeweltheme.com>
     */
    public static function get_data() {
        return get_option( 'pxlbsadminify_sheet_promo_data' );
    }

    /**
     * Get Contents
     *
     * @param [type] $key .
     *
     * @author Jewel Theme <support@jeweltheme.com>
     */
    public function get_content( $key ) {
        if ( empty( $this->data ) ) {
            return;
        }
        return $this->data[$key];
    }

    /**
     * Display popup contents
     *
     * @author Jewel Theme <support@jeweltheme.com>
     */
    public function display_popup() {
        if ( empty( $this->get_content( 'is_live' ) ) ) {
            $image_url = PXLBSADMINIFY_ASSETS_IMAGE . 'promo-image.png';
            $notice = 'Use "SPECIAL40" to Get Flat 40% OFF';
            $btn_url = 'https://wpadminify.com/pricing/';
            $btn_text = 'GET THE DEAL';
        } else {
            $image_url = $this->get_content( 'image_url' );
            $notice = $this->get_content( 'notice' );
            $btn_url = $this->get_content( 'button_url' );
            $btn_text = $this->get_content( 'button_text' );
        }
        ?>

		<div class="wp-adminify-popup wp-adminify-upgrade-popup" id="wp-adminify-popup" data-plugin="<?php 
        echo esc_attr( $this->slug );
        ?>" tabindex="1" style="display: none;">

			<div class="wp-adminify-popup-overlay"></div>

			<div class="wp-adminify-popup-modal" style="background-image: url('<?php 
        echo esc_url( $image_url );
        ?>'); --wp-adminify-popup-color: <?php 
        echo esc_attr( $this->get_content( 'btn_color' ) );
        ?>;">

				<!-- close  -->
				<div class="wp-adminify-popup-modal-close popup-dismiss">×</div>

				<!-- content section  -->
				<div class="wp-adminify-popup-modal-footer">
					<!-- countdown  -->
					<div class="wp-adminify-popup-countdown" style="display: none;">

						<?php 
        if ( !empty( $notice ) ) {
            ?>
							<span data-counter="notice" style="color:#F4B740; font-size:14px; padding-bottom:20px; font-style:italic;"><?php 
            echo esc_html__( 'Notice:', 'adminify' );
            ?> <?php 
            echo wp_kses_post( $notice );
            ?></span>
						<?php 
        }
        ?>

						<span class="wp-adminify-popup-countdown-text"><?php 
        echo esc_html__( 'Deal Ends In', 'adminify' );
        ?></span>
						<div class="wp-adminify-popup-countdown-time">
							<div>
								<span data-counter="days">00</span>
								<span><?php 
        echo esc_html__( 'Days', 'adminify' );
        ?></span>
							</div>
							<span>:</span>
							<div>
								<span data-counter="hours">00</span>
								<span><?php 
        echo esc_html__( 'Hours', 'adminify' );
        ?></span>
							</div>
							<span>:</span>
							<div>
								<span data-counter="minutes">00</span>
								<span><?php 
        echo esc_html__( 'Minutes', 'adminify' );
        ?></span>
							</div>
							<span>:</span>
							<div>
								<span data-counter="seconds">00</span>
								<span><?php 
        echo esc_html__( 'Seconds', 'adminify' );
        ?></span>
							</div>
						</div>
					</div>

					<!-- button  -->
					<a class="wp-adminify-popup-button" style="color: #fff!important;" target="_blank" href="<?php 
        echo esc_url( $btn_url );
        ?>"><?php 
        echo esc_html( $btn_text );
        ?></a>
			</div>
			</div>
		</div>

		<script>
			var $container = jQuery('#wp-adminify-popup'),
				plugin_data = <?php 
        echo wp_json_encode( $this->data );
        ?>,
				events = {}; //Events

			// Update Counter
			function updateCounter(seconds) {
				const $counter = $container.find(".wp-adminify-popup-countdown-time");
				const $days = $counter.find("[data-counter='days']");
				const $hours = $counter.find("[data-counter='hours']");
				const $minutes = $counter.find("[data-counter='minutes']");
				const $seconds = $counter.find("[data-counter='seconds']");
				const days = Math.floor(seconds / (3600 * 24));
				seconds -= days * 3600 * 24;
				const hrs = Math.floor(seconds / 3600);
				seconds -= hrs * 3600;
				const mnts = Math.floor(seconds / 60);
				seconds -= mnts * 60;

				$days.text(days);
				$hours.text(hrs);
				$minutes.text(mnts);
				$seconds.text(seconds);
			}

			// Trigger Event
			function trigger(event, args = []) {
				if (typeof(events[event]) !== 'undefined') {
					events[event].forEach(callback => {
						callback.apply(this, args);
					});
				}
			}

			// initCounter
			function initCounter(last_date) {
				$container.find(".wp-adminify-popup-countdown-time").show();

				const countdown = () => {

					// system time
					const now = new Date().getTime();

					// set end time to 11:59:59 PM
					const endDate = new Date(last_date);
					endDate.setHours(23);
					endDate.setMinutes(59);
					endDate.setSeconds(59);

					const seconds = Math.floor((endDate.getTime() - now) / 1000);

					if (seconds < 0) {
						return false;
					}

					updateCounter(seconds);

					return true;
				}

				let result = countdown();


				if (result) {
					trigger("countdownStart", [plugin_data]);
					$container.find(".wp-adminify-popup-countdown").show(0);
				} else {
					trigger("countdownFinish", [plugin_data]);
					$container.find(".wp-adminify-popup-countdown").hide(0);
				}

				// update counter every 1 second
				const counter = setInterval(() => {

					const result = countdown();

					if (!result) {
						clearInterval(counter);
						trigger("counter_end", [plugin_data]);
						$container.find(".wp-adminify-popup-countdown").hide(0);
					}

				}, 1000);
			}

			initCounter('<?php 
        echo esc_attr( $this->counter_date() );
        ?>');
		</script>

		<?php 
    }

    /**
     * Counter Date
     *
     * @author Jewel Theme <support@jeweltheme.com>
     */
    public function counter_date() {
        $endDate = $this->get_content( 'end_date' );
        $is_active = $this->date_is_current_or_next( $endDate );
        if ( $is_active ) {
            return $endDate;
        }
        return $this->date_increment( $this->current_time(), 3 );
    }

}
