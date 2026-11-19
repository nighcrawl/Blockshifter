<?php
/**
 * Blockshifter_Assets class.
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

/**
 * Generic conditional asset enqueue: a Module's assets are only enqueued
 * when that Module actually transforms a block during the render pass —
 * wherever the block lives (post content, block template, template part,
 * widget...). Detecting it from `$post->post_content` alone missed every
 * Target Block rendered from a template, e.g. a Query Loop on the blog home.
 */
final class Blockshifter_Assets {

	/**
	 * Hook onto the render dispatcher's own "Module rendered" signal.
	 */
	public static function register(): void {
		add_action( Blockshifter_Render::MODULE_RENDERED_ACTION, array( self::class, 'enqueue' ) );
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
