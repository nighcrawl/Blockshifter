<?php
/**
 * Blocktopus_Assets class.
 *
 * @package Blocktopus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Generic conditional asset enqueue: a Module's assets are only enqueued
 * when the page content actually contains one of its allowed blocks.
 */
final class Blocktopus_Assets {

	/**
	 * Enqueue every registered Module's assets that are active in $content.
	 */
	public static function maybe_enqueue_for_content( string $content ): void {
		foreach ( Blocktopus_Module_Registry::all() as $module ) {
			if ( self::is_active_in( $module, $content ) ) {
				self::enqueue( $module );
			}
		}
	}

	/**
	 * Whether any of the Module's allowed blocks is present in $content.
	 */
	private static function is_active_in( Blocktopus_Transform $module, string $content ): bool {
		foreach ( Blocktopus_Module_Registry::allowed_blocks_for( $module ) as $block_name ) {
			if ( has_block( $block_name, $content ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Enqueue a Module's declared asset handles.
	 */
	private static function enqueue( Blocktopus_Transform $module ): void {
		$handles = $module->get_asset_handles();

		foreach ( $handles['scripts'] ?? array() as $handle ) {
			wp_enqueue_script( $handle );
		}

		foreach ( $handles['styles'] ?? array() as $handle ) {
			wp_enqueue_style( $handle );
		}
	}
}
