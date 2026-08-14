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
	 * Gap is never written here for either block: it always comes from
	 * Gutenberg's own native spacing (Gap) support, which the browser already
	 * resolves regardless of layout type (inline custom property or WP's own
	 * generated layout stylesheet) — a single source of truth, never
	 * duplicated by a Blockshifter-authored `gap` declaration.
	 *
	 * `core/gallery` already exposes its own native Columns control, so only
	 * that attribute is read (it has no default column count, so this falls
	 * back to 3). `core/group` has no native equivalent, so it keeps its own
	 * Blockshifter-specific column count.
	 *
	 * Only `--blockshifter-masonry-columns` is appended to the root
	 * element's existing `style` attribute rather than replacing it, so
	 * that any style already authored on the block (native or otherwise)
	 * survives enabling Masonry.
	 */
	private function add_masonry_classes_and_props( string $html, array $block ): string {
		$processor = new WP_HTML_Tag_Processor( $html );

		if ( ! $processor->next_tag() ) {
			return $html;
		}

		$processor->add_class( 'blockshifter-masonry' );

		$columns = $this->get_columns( $block );

		$this->append_inline_style( $processor, sprintf( '--blockshifter-masonry-columns: %d;', $columns ) );

		return $processor->get_updated_html();
	}

	private function get_columns( array $block ): int {
		if ( 'core/gallery' === ( $block['blockName'] ?? '' ) ) {
			return max( 1, (int) ( $block['attrs']['columns'] ?? 3 ) );
		}

		$config = $block['attrs']['blockshifterConfig']['masonry'] ?? array();

		return max( 1, (int) ( $config['columns'] ?? 3 ) );
	}

	/**
	 * Appends a declaration to the root element's existing `style`
	 * attribute instead of replacing it.
	 */
	private function append_inline_style( WP_HTML_Tag_Processor $processor, string $declaration ): void {
		$existing = trim( (string) $processor->get_attribute( 'style' ) );

		if ( '' !== $existing && ';' !== substr( $existing, -1 ) ) {
			$existing .= ';';
		}

		$processor->set_attribute( 'style', trim( $existing . ' ' . $declaration ) );
	}
}
