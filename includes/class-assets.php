<?php
/**
 * Blockshifter_Assets class.
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

/**
 * Generic Module asset handling. Registration follows the slug convention
 * of ADR-0020 (`blockshifter-{slug}-frontend` <- `build/frontend/{slug}-init.*`),
 * so no Module needs its own registration code. Enqueue is conditional: a
 * Module's assets are only enqueued
 * when that Module actually transforms a block during the render pass —
 * wherever the block lives (post content, block template, template part,
 * widget...). Detecting it from `$post->post_content` alone missed every
 * Target Block rendered from a template, e.g. a Query Loop on the blog home.
 */
final class Blockshifter_Assets {

	/**
	 * Register every Module's front-end assets early on `wp_enqueue_scripts`
	 * (before themes/plugins at the default priority), and enqueue them on
	 * the render dispatcher's own "Module rendered" signal.
	 */
	public static function register(): void {
		add_action( 'wp_enqueue_scripts', array( self::class, 'register_module_assets' ), 5 );
		add_action( Blockshifter_Render::MODULE_RENDERED_ACTION, array( self::class, 'enqueue' ) );
	}

	/**
	 * The script/style handle a Module's front-end assets are registered
	 * under. A Module's get_asset_handles() must return this same handle.
	 */
	public static function frontend_handle( string $slug ): string {
		return "blockshifter-{$slug}-frontend";
	}

	/**
	 * `wp_enqueue_scripts` callback: registers against the real plugin
	 * location.
	 */
	public static function register_module_assets(): void {
		self::register_frontend_assets( BLOCKSHIFTER_PLUGIN_DIR, BLOCKSHIFTER_PLUGIN_URL );
	}

	/**
	 * Register (but don't enqueue) each registered Module's front-end
	 * script and style, found by slug convention under
	 * `build/frontend/{slug}-init.*`. A Module whose front-end entry was
	 * never built is skipped; its CSS is optional.
	 */
	public static function register_frontend_assets( string $plugin_dir, string $plugin_url ): void {
		foreach ( Blockshifter_Module_Registry::all() as $slug => $module ) {
			$base       = "build/frontend/{$slug}-init";
			$asset_file = "{$plugin_dir}{$base}.asset.php";

			if ( ! file_exists( $asset_file ) ) {
				continue;
			}

			$asset  = require $asset_file;
			$handle = self::frontend_handle( $slug );

			wp_register_script(
				$handle,
				"{$plugin_url}{$base}.js",
				$asset['dependencies'],
				$asset['version'],
				true
			);

			if ( file_exists( "{$plugin_dir}{$base}.css" ) ) {
				wp_register_style(
					$handle,
					"{$plugin_url}{$base}.css",
					array(),
					BLOCKSHIFTER_VERSION
				);
			}
		}
	}

	/**
	 * Inline JS run before the editor script: exposes each Module's
	 * filtered Target Blocks as `window.blockshifterTargetBlocks`
	 * (`{ slug: [ blockName, ... ] }`). Needed synchronously, before core
	 * blocks register, since the editor adds the Blockshifter attributes on
	 * `blocks.registerBlockType` (ADR-0021).
	 */
	public static function editor_target_blocks_script(): string {
		return 'window.blockshifterTargetBlocks = '
			. wp_json_encode( (object) Blockshifter_Module_Registry::target_blocks_by_slug() )
			. ';';
	}

	/**
	 * Enqueue a Module's declared asset handles.
	 *
	 * Safe even when called before the handles are registered (a block
	 * theme renders its template before `wp_head`, hence before
	 * `wp_enqueue_scripts`): WP_Dependencies keeps such handles queued and
	 * enqueues them as soon as they get registered.
	 */
	public static function enqueue( Blockshifter_Transform $module ): void {
		$handles = $module->get_asset_handles();

		foreach ( $handles['scripts'] ?? array() as $handle ) {
			wp_enqueue_script( $handle );
		}

		foreach ( $handles['styles'] ?? array() as $handle ) {
			wp_enqueue_style( $handle );
		}
	}
}
