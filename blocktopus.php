<?php
/**
 * Plugin Name:       Blocktopus
 * Description:       Transform native Gutenberg blocks into alternate display variants without leaving the editor.
 * Version:           0.1.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Ange Chierchia
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blocktopus
 *
 * @package Blocktopus
 */

defined( 'ABSPATH' ) || exit;

define( 'BLOCKTOPUS_VERSION', '0.1.0' );
define( 'BLOCKTOPUS_PLUGIN_FILE', __FILE__ );
define( 'BLOCKTOPUS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BLOCKTOPUS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once BLOCKTOPUS_PLUGIN_DIR . 'includes/interface-transform.php';
require_once BLOCKTOPUS_PLUGIN_DIR . 'includes/class-module-registry.php';
require_once BLOCKTOPUS_PLUGIN_DIR . 'includes/class-assets.php';
require_once BLOCKTOPUS_PLUGIN_DIR . 'includes/class-render.php';
require_once BLOCKTOPUS_PLUGIN_DIR . 'includes/modules/carousel/class-carousel-transform.php';

Blocktopus_Render::register();

/**
 * Register every Blocktopus Module here (ADR-0004 — explicit registry,
 * no filesystem auto-discovery).
 */
add_action(
	'init',
	static function () {
		Blocktopus_Module_Registry::register( new Blocktopus_Carousel_Transform() );
	},
	0
);

/**
 * Register (but don't yet enqueue) the Carousel Module's front-end assets.
 * Blocktopus_Assets enqueues them conditionally, only when the page
 * actually contains an active carousel.
 */
add_action(
	'wp_enqueue_scripts',
	static function () {
		$asset_file = BLOCKTOPUS_PLUGIN_DIR . 'build/frontend/carousel-init.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_register_script(
			'blocktopus-carousel-frontend',
			BLOCKTOPUS_PLUGIN_URL . 'build/frontend/carousel-init.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		$style_file = BLOCKTOPUS_PLUGIN_DIR . 'build/frontend/carousel-init.css';

		if ( file_exists( $style_file ) ) {
			wp_register_style(
				'blocktopus-carousel-frontend',
				BLOCKTOPUS_PLUGIN_URL . 'build/frontend/carousel-init.css',
				array(),
				BLOCKTOPUS_VERSION
			);
		}
	},
	5
);

/**
 * Load the block editor script that registers the generic
 * `blocktopusTransform` / `blocktopusConfig` attributes (ADR-0002).
 */
add_action(
	'enqueue_block_editor_assets',
	static function () {
		$asset_file = BLOCKTOPUS_PLUGIN_DIR . 'build/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'blocktopus-editor',
			BLOCKTOPUS_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}
);

/**
 * Enqueue each active Module's front-end assets, conditional on the
 * rendered content actually containing one of its allowed blocks.
 */
add_action(
	'wp_enqueue_scripts',
	static function () {
		global $post;

		if ( $post instanceof WP_Post ) {
			Blocktopus_Assets::maybe_enqueue_for_content( $post->post_content );
		}
	}
);
