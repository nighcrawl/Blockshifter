<?php
/**
 * Plugin Name:       Blockshifter
 * Description:       Transform native Gutenberg blocks into alternate display variants without leaving the editor.
 * Version:           0.3.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Ange Chierchia
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blockshifter
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

define( 'BLOCKSHIFTER_VERSION', '0.3.0' );
define( 'BLOCKSHIFTER_PLUGIN_FILE', __FILE__ );
define( 'BLOCKSHIFTER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BLOCKSHIFTER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once BLOCKSHIFTER_PLUGIN_DIR . 'includes/interface-transform.php';
require_once BLOCKSHIFTER_PLUGIN_DIR . 'includes/class-module-registry.php';
require_once BLOCKSHIFTER_PLUGIN_DIR . 'includes/class-assets.php';
require_once BLOCKSHIFTER_PLUGIN_DIR . 'includes/class-render.php';
require_once BLOCKSHIFTER_PLUGIN_DIR . 'includes/class-telemetry.php';
require_once BLOCKSHIFTER_PLUGIN_DIR . 'includes/modules/carousel/class-carousel-transform.php';
require_once BLOCKSHIFTER_PLUGIN_DIR . 'includes/modules/masonry/class-masonry-transform.php';

Blockshifter_Render::register();
Blockshifter_Telemetry::register();

register_deactivation_hook( BLOCKSHIFTER_PLUGIN_FILE, array( 'Blockshifter_Telemetry', 'on_deactivation' ) );

/**
 * Register every Blockshifter Module here (ADR-0004 — explicit registry,
 * no filesystem auto-discovery).
 */
add_action(
	'init',
	static function () {
		Blockshifter_Module_Registry::register( new Blockshifter_Carousel_Transform() );
		Blockshifter_Module_Registry::register( new Blockshifter_Masonry_Transform() );
	},
	0
);

/**
 * Register (but don't yet enqueue) the Carousel Module's front-end assets.
 * Blockshifter_Assets enqueues them conditionally, only when the page
 * actually contains an active carousel.
 */
add_action(
	'wp_enqueue_scripts',
	static function () {
		$asset_file = BLOCKSHIFTER_PLUGIN_DIR . 'build/frontend/carousel-init.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_register_script(
			'blockshifter-carousel-frontend',
			BLOCKSHIFTER_PLUGIN_URL . 'build/frontend/carousel-init.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		$style_file = BLOCKSHIFTER_PLUGIN_DIR . 'build/frontend/carousel-init.css';

		if ( file_exists( $style_file ) ) {
			wp_register_style(
				'blockshifter-carousel-frontend',
				BLOCKSHIFTER_PLUGIN_URL . 'build/frontend/carousel-init.css',
				array(),
				BLOCKSHIFTER_VERSION
			);
		}
	},
	5
);

/**
 * Register (but don't yet enqueue) the Masonry Module's front-end assets.
 * Blockshifter_Assets enqueues them conditionally, only when the page
 * actually contains an active masonry grid.
 */
add_action(
	'wp_enqueue_scripts',
	static function () {
		$asset_file = BLOCKSHIFTER_PLUGIN_DIR . 'build/frontend/masonry-init.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_register_script(
			'blockshifter-masonry-frontend',
			BLOCKSHIFTER_PLUGIN_URL . 'build/frontend/masonry-init.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		$style_file = BLOCKSHIFTER_PLUGIN_DIR . 'build/frontend/masonry-init.css';

		if ( file_exists( $style_file ) ) {
			wp_register_style(
				'blockshifter-masonry-frontend',
				BLOCKSHIFTER_PLUGIN_URL . 'build/frontend/masonry-init.css',
				array(),
				BLOCKSHIFTER_VERSION
			);
		}
	},
	5
);

/**
 * Load the block editor script that registers the generic
 * `blockshifterTransform` / `blockshifterConfig` attributes (ADR-0002).
 */
add_action(
	'enqueue_block_editor_assets',
	static function () {
		$asset_file = BLOCKSHIFTER_PLUGIN_DIR . 'build/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'blockshifter-editor',
			BLOCKSHIFTER_PLUGIN_URL . 'build/index.js',
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
			Blockshifter_Assets::maybe_enqueue_for_content( $post->post_content );
			Blockshifter_Telemetry::maybe_record_feature_usage( $post->post_content );
		}
	}
);
