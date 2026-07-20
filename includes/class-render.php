<?php
/**
 * Blocktopus_Render class.
 *
 * @package Blocktopus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Generic render dispatch: hands a rendered block over to whichever
 * Module's Transform is active on it (ADR-0003 — at most one at a time).
 * The Transform itself decides how to render; this class only routes.
 */
final class Blocktopus_Render {

	/**
	 * Hook the dispatcher onto `render_block`.
	 */
	public static function register(): void {
		add_filter( 'render_block', array( self::class, 'dispatch' ), 10, 2 );
	}

	/**
	 * Route a rendered block to its active Module, if any.
	 *
	 * @param string $block_content The default rendered block content.
	 * @param array  $block         The parsed block, including attrs.
	 */
	public static function dispatch( string $block_content, array $block ): string {
		$transform_slug = $block['attrs']['blocktopusTransform'] ?? '';

		if ( '' === $transform_slug ) {
			return $block_content;
		}

		$module = Blocktopus_Module_Registry::get( $transform_slug );

		if ( null === $module ) {
			return $block_content;
		}

		$block_name = $block['blockName'] ?? '';

		if ( ! in_array( $block_name, Blocktopus_Module_Registry::allowed_blocks_for( $module ), true ) ) {
			return $block_content;
		}

		return $module->render( $block_content, $block );
	}
}
