<?php
/**
 * Blockshifter_Masonry_Transform class.
 *
 * @package Blockshifter
 */

defined( 'ABSPATH' ) || exit;

/**
 * Module Masonry: transforms a block into a CSS Grid masonry layout.
 */
final class Blockshifter_Masonry_Transform implements Blockshifter_Transform {

	const SLUG = 'masonry';

	public function get_slug(): string {
		return self::SLUG;
	}

	public function get_allowed_blocks(): array {
		return array( 'core/gallery', 'core/group' );
	}

	public function get_asset_handles(): array {
		return array(
			'scripts' => array( 'blockshifter-masonry-frontend' ),
			'styles'  => array( 'blockshifter-masonry-frontend' ),
		);
	}

	public function render( string $block_content, array $block ): string {
		if ( '' === trim( $block_content ) ) {
			return $block_content;
		}

		return $this->add_masonry_classes_and_props( $block_content, $block );
	}

	/**
	 * Add CSS Grid classes and custom properties to the block's root element.
	 *
	 * `core/gallery` already exposes its own Columns and block-gap (spacing)
	 * controls natively, so masonry defers to those instead of duplicating
	 * them in a Blockshifter-specific config: only `--blockshifter-masonry-
	 * columns` is set (gallery has no default column count, so it falls
	 * back to 3), and no `gap` is written at all — WP's own generated
	 * layout style already applies gallery's block gap, and forcing
	 * `display: grid` (see masonry-layout.css) doesn't touch that.
	 *
	 * `core/group` has no native equivalent for either setting, so it keeps
	 * using Blockshifter's own config for both.
	 */
	private function add_masonry_classes_and_props( string $html, array $block ): string {
		$processor = new WP_HTML_Tag_Processor( $html );

		if ( ! $processor->next_tag() ) {
			return $html;
		}

		$processor->add_class( 'blockshifter-masonry' );

		if ( 'core/gallery' === ( $block['blockName'] ?? '' ) ) {
			$columns = max( 1, (int) ( $block['attrs']['columns'] ?? 3 ) );
			$style   = sprintf( '--blockshifter-masonry-columns: %d;', $columns );
		} else {
			$config  = $block['attrs']['blockshifterConfig']['masonry'] ?? array();
			$columns = max( 1, (int) ( $config['columns'] ?? 3 ) );
			$gap     = max( 0, (int) ( $config['gap'] ?? 16 ) );
			$style   = sprintf( '--blockshifter-masonry-columns: %d; gap: %dpx;', $columns, $gap );
		}

		$processor->set_attribute( 'style', $style );

		return $processor->get_updated_html();
	}
}
