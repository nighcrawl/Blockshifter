<?php
/**
 * Blocktopus_Transform interface.
 *
 * @package Blocktopus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Contract implemented by every Blocktopus Module's PHP half.
 *
 * Covers only what the render pipeline needs (ADR-0005) — the Inspector
 * Controls (JS) live separately and share nothing but the slug.
 */
interface Blocktopus_Transform {

	/**
	 * Stable identifier shared with the Module's JS half and used as the
	 * namespace key in the `blocktopusConfig` block attribute.
	 */
	public function get_slug(): string;

	/**
	 * Default list of core block names this Module targets. Consumers must
	 * apply the `blocktopus/{slug}/allowed_blocks` filter rather than calling
	 * this directly, so third parties can extend the list (ADR-0001).
	 */
	public function get_allowed_blocks(): array;

	/**
	 * Asset handles this Module needs on the front end, already registered
	 * elsewhere (e.g. via wp_register_script/wp_register_style). Enqueued
	 * only when the Module is actually active on the page.
	 *
	 * @return array{scripts?: string[], styles?: string[]}
	 */
	public function get_asset_handles(): array;

	/**
	 * Render this Module's transformation for a single block.
	 *
	 * @param string $block_content The default rendered block content.
	 * @param array  $block         The parsed block, including attrs.
	 */
	public function render( string $block_content, array $block ): string;
}
