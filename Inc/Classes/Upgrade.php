<?php

namespace PXLBSAdminify\Inc\Classes;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Upgrade
{

	/**
	 * Plugin version option key
	 *
	 * @var string $option_name
	 */
	protected $option_name = 'pxlbsadminify_version';

	/**
	 * Lists of upgrades
	 *
	 * @var string[] $upgrades
	 */
	protected $upgrades = [
		'3.0.2'   => 'Upgrades/upgrade-3.0.2.php',
		'3.0.9'   => 'Upgrades/upgrade-3.0.9.php',
		'3.2.4.4' => 'Upgrades/upgrade-3.2.4.4.php',
		'4.0.1'   => 'Upgrades/upgrade-4.0.php',
		'4.2.0'   => 'Upgrades/upgrade-4.2.0.php'
	];

	/**
	 * Get plugin installed version
	 *
	 * @return string
	 */
	protected function get_installed_version()
	{
		$version = get_option($this->option_name, false);

		// Fall back to the legacy version option (renamed in v4.2.0) so existing
		// installs report their real version and historical upgrades don't re-run.
		if (false === $version) {
			$version = get_option('wp_adminify_version', '1.0.0');
		}

		return $version;
	}

	/**
	 * Check if plugin's update is available
	 *
	 * @return bool
	 */
	public function if_updates_available()
	{
		if (version_compare($this->get_installed_version(), PXLBSADMINIFY_VER, '<')) {
			return true;
		}

		return false;
	}

	/**
	 * Run plugin updates
	 *
	 * @return void
	 */
	public function run_updates()
	{
		$installed_version = $this->get_installed_version();
		$path              = trailingslashit(__DIR__);

		foreach ($this->upgrades as $version => $file) {
			if (version_compare($installed_version, $version, '<')) {
				include $path . $file;
			}
		}

		// update_option( $this->option_name, PXLBSADMINIFY_VER );
	}
}
